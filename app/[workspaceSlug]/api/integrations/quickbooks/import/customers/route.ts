import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getValidAccessToken } from "@/lib/quickbooks";
import { importCustomers } from "@/lib/quickbooks-api";
import { getWorkspaceId } from "@/lib/route-guards";

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
    select: {
      id: true,
      externalAccountId: true,
    },
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

  let customers: { name: string; email: string | null; phone: string | null; addressLine1: string | null; city: string | null; province: string | null; postalCode: string | null; country: string | null }[];
  try {
    customers = await importCustomers(
      accessToken,
      integration.externalAccountId,
    );
  } catch (err) {
    return Response.json(
      { error: `Failed to import customers: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  if (customers.length === 0) {
    return Response.json({ imported: 0 });
  }

  let imported = 0;
  for (const customer of customers) {
    if (!customer.name) continue;

    const existing = await prisma.customer.findFirst({
      where: {
        workspaceId,
        name: customer.name,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.customer.update({
        where: { id: existing.id },
        data: {
          email: customer.email,
          phone: customer.phone,
          addressLine1: customer.addressLine1,
          city: customer.city,
          province: customer.province,
          postalCode: customer.postalCode,
          country: customer.country,
        },
      });
    } else {
      await prisma.customer.create({
        data: {
          workspaceId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          addressLine1: customer.addressLine1,
          city: customer.city,
          province: customer.province,
          postalCode: customer.postalCode,
          country: customer.country,
        },
      });
    }

    imported++;
  }

  return Response.json({ imported });
}
