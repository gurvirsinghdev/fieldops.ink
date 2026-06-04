import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getValidAccessToken } from "@/lib/quickbooks";
import {
  fetchQBCustomers,
  createQBCustomer,
} from "@/lib/quickbooks-api";
import { getWorkspaceId } from "@/lib/route-guards";
import { revalidatePath } from "next/cache";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceSlug: string }> },
) {
  const { workspaceSlug } = await params;

  const workspaceResult = await getWorkspaceId(workspaceSlug);
  if (typeof workspaceResult !== "string") return workspaceResult;
  const workspaceId = workspaceResult;

  const integration = await prisma.integration.findFirst({
    where: {
      workspaceId,
      provider: "quickbooks",
      status: "Connected",
    },
    select: { id: true, externalAccountId: true },
  });

  if (!integration || !integration.externalAccountId) {
    return Response.json(
      { error: "QuickBooks is not connected" },
      { status: 400 },
    );
  }

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(integration.id);
  } catch (err) {
    return Response.json(
      { error: `Token refresh failed: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  const realmId = integration.externalAccountId;

  // Fetch all external entity links for this integration + entity type
  const links = await prisma.externalEntityLink.findMany({
    where: {
      integrationId: integration.id,
      localEntityType: "Customer",
    },
    select: {
      localEntityId: true,
      externalEntityId: true,
    },
  });

  const linkByQbId = new Map<string, string>();
  const linkByLocalId = new Map<string, string>();
  for (const link of links) {
    linkByQbId.set(link.externalEntityId, link.localEntityId);
    linkByLocalId.set(link.localEntityId, link.externalEntityId);
  }

  // Fetch all local customers for this workspace
  const localCustomers = await prisma.customer.findMany({
    where: { workspaceId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      addressLine1: true,
      city: true,
      province: true,
      postalCode: true,
      country: true,
    },
  });

  // Fetch all QB customers
  let qbCustomers;
  try {
    qbCustomers = await fetchQBCustomers(accessToken, realmId);
  } catch (err) {
    return Response.json(
      { error: `Failed to fetch QB customers: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  let imported = 0;
  let exported = 0;
  let errors = 0;

  // Import: for each QB customer, create or update locally
  for (const qb of qbCustomers) {
    if (!qb.name) continue;

    try {
      const localId = linkByQbId.get(qb.qbId);

      if (localId) {
        await prisma.customer.update({
          where: { id: localId },
          data: {
            name: qb.name,
            email: qb.email,
            phone: qb.phone,
            addressLine1: qb.addressLine1,
            city: qb.city,
            province: qb.province,
            postalCode: qb.postalCode,
            country: qb.country,
          },
        });
        imported++;
      } else {
        // Fallback: match by name if link was not found
        const existingByName = localCustomers.find(
          (c) => c.name.toLowerCase() === qb.name.toLowerCase(),
        );

        let customerId: string;

        if (existingByName) {
          customerId = existingByName.id;
          await prisma.customer.update({
            where: { id: customerId },
            data: {
              email: qb.email,
              phone: qb.phone,
              addressLine1: qb.addressLine1,
              city: qb.city,
              province: qb.province,
              postalCode: qb.postalCode,
              country: qb.country,
            },
          });
        } else {
          const created = await prisma.customer.create({
            data: {
              workspaceId,
              name: qb.name,
              email: qb.email,
              phone: qb.phone,
              addressLine1: qb.addressLine1,
              city: qb.city,
              province: qb.province,
              postalCode: qb.postalCode,
              country: qb.country,
            },
          });
          customerId = created.id;
        }

        await prisma.externalEntityLink.create({
          data: {
            workspaceId,
            integrationId: integration.id,
            localEntityType: "Customer",
            localEntityId: customerId,
            externalEntityType: "Customer",
            externalEntityId: qb.qbId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });

        linkByLocalId.set(customerId, qb.qbId);
        imported++;
      }
    } catch (err) {
      console.error(`Sync error importing QB customer "${qb.name}" (${qb.qbId}):`, err);
      errors++;
    }
  }

  // Export: for each local customer without a link, create in QB
  for (const local of localCustomers) {
    const qbId = linkByLocalId.get(local.id);
    if (qbId) continue;

    // Skip if QB already has a customer with this name (would be a 409)
    const qbDuplicate = qbCustomers.find(
      (q) => q.name.toLowerCase() === local.name.toLowerCase(),
    );
    if (qbDuplicate) {
      // Link the existing QB customer instead of trying to create a duplicate
      try {
        await prisma.externalEntityLink.create({
          data: {
            workspaceId,
            integrationId: integration.id,
            localEntityType: "Customer",
            localEntityId: local.id,
            externalEntityType: "Customer",
            externalEntityId: qbDuplicate.qbId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
        linkByLocalId.set(local.id, qbDuplicate.qbId);
      } catch {
        // Link may already exist — fine
      }
      continue;
    }

    try {
      const newQbId = await createQBCustomer(accessToken, realmId, {
        name: local.name,
        email: local.email,
        phone: local.phone,
        addressLine1: local.addressLine1,
        city: local.city,
        province: local.province,
        postalCode: local.postalCode,
        country: local.country,
      });

      if (newQbId) {
        await prisma.externalEntityLink.create({
          data: {
            workspaceId,
            integrationId: integration.id,
            localEntityType: "Customer",
            localEntityId: local.id,
            externalEntityType: "Customer",
            externalEntityId: newQbId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
        exported++;
      }
    } catch (err) {
      console.error(`Sync error exporting local customer "${local.name}" (${local.id}):`, err);
      errors++;
    }
  }

  revalidatePath(`/${workspaceSlug}/customers`);

  return Response.json({ imported, exported, errors });
}
