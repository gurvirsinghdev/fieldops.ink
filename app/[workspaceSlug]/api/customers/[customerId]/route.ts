import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getWorkspaceId } from "@/lib/workspace/helpers";
import { revalidatePath } from "next/cache";
import { getValidAccessToken } from "@/lib/integrations/quickbooks/auth";
import { updateQBCustomer } from "@/lib/integrations/quickbooks/api";

export async function PATCH(
  request: NextRequest,
  { params }: {
    params: Promise<{ workspaceSlug: string; customerId: string }>;
  },
) {
  const { workspaceSlug, customerId } = await params;

  const workspaceResult = await getWorkspaceId(workspaceSlug);
  if (typeof workspaceResult !== "string") return workspaceResult;
  const workspaceId = workspaceResult;

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, workspaceId },
    select: { id: true, name: true },
  });

  if (!customer) {
    return Response.json({ error: "Customer not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name as string;
  if (!name || typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const updateData = {
    name: name.trim(),
    email: (body.email as string) || null,
    phone: (body.phone as string) || null,
    addressLine1: (body.addressLine1 as string) || null,
    addressLine2: (body.addressLine2 as string) || null,
    city: (body.city as string) || null,
    province: (body.province as string) || null,
    postalCode: (body.postalCode as string) || null,
    country: (body.country as string) || null,
  };

  const updated = await prisma.customer.update({
    where: { id: customerId },
    data: updateData,
  });

  // Optionally update in QuickBooks
  try {
    const link = await prisma.externalEntityLink.findFirst({
      where: {
        workspaceId,
        localEntityType: "Customer",
        localEntityId: customerId,
      },
      select: { externalEntityId: true, integrationId: true },
    });

    if (link) {
      const integration = await prisma.integration.findFirst({
        where: {
          id: link.integrationId,
          status: "Connected",
        },
        select: { id: true, externalAccountId: true },
      });

      if (integration?.externalAccountId) {
        const accessToken = await getValidAccessToken(integration.id);
        await updateQBCustomer(
          accessToken,
          integration.externalAccountId,
          link.externalEntityId,
          {
            name: updateData.name,
            email: updateData.email,
            phone: updateData.phone,
            addressLine1: updateData.addressLine1,
            city: updateData.city,
            province: updateData.province,
            postalCode: updateData.postalCode,
            country: updateData.country,
          },
        );
      }
    }
  } catch (err) {
    console.error(`Failed to update QB customer "${customer.name}":`, err);
  }

  revalidatePath(`/${workspaceSlug}/customers`);

  return Response.json({ id: updated.id });
}
