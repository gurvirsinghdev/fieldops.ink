import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import { getValidAccessToken } from "@/lib/quickbooks";
import { importCustomers } from "@/lib/quickbooks-api";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceSlug: string }> },
) {
  const { workspaceSlug } = await params;

  const session = await getServerSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: session.user.id,
      workspace: { slug: workspaceSlug },
    },
    select: { workspaceId: true },
  });

  if (!membership) {
    return Response.json({ error: "Not a member" }, { status: 403 });
  }

  const integration = await prisma.integration.findFirst({
    where: {
      workspaceId: membership.workspaceId,
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

  const env = process.env.QUICKBOOKS_ENVIRONMENT ?? "sandbox";

  let customers: { name: string; email: string | null; phone: string | null; addressLine1: string | null; city: string | null; province: string | null; postalCode: string | null; country: string | null }[];
  try {
    customers = await importCustomers(
      accessToken,
      integration.externalAccountId,
      env,
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

  // Upsert by workspace + name to avoid duplicates
  let imported = 0;
  for (const customer of customers) {
    if (!customer.name) continue;

    const existing = await prisma.customer.findFirst({
      where: {
        workspaceId: membership.workspaceId,
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
          workspaceId: membership.workspaceId,
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
