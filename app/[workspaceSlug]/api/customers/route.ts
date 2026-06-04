import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getWorkspaceId } from "@/lib/route-guards";
import { getValidAccessToken } from "@/lib/quickbooks";
import { createQBCustomer } from "@/lib/quickbooks-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceSlug: string }> },
) {
  const { workspaceSlug } = await params;

  const workspaceResult = await getWorkspaceId(workspaceSlug);
  if (typeof workspaceResult !== "string") return workspaceResult;
  const workspaceId = workspaceResult;

  const q = request.nextUrl.searchParams.get("q") || "";

  const customers = await prisma.customer.findMany({
    where: {
      workspaceId,
      ...(q
        ? { name: { contains: q, mode: "insensitive" as const } }
        : {}),
    },
    select: {
      id: true,
      name: true,
    },
    take: 20,
    orderBy: { name: "asc" as const },
  });

  return Response.json(customers);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceSlug: string }> },
) {
  const { workspaceSlug } = await params;

  const workspaceResult = await getWorkspaceId(workspaceSlug);
  if (typeof workspaceResult !== "string") return workspaceResult;
  const workspaceId = workspaceResult;

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

  const customerData = {
    workspaceId,
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

  const customer = await prisma.customer.create({ data: customerData });

  // Optionally create in QuickBooks
  let qbId: string | null = null;
  try {
    const integration = await prisma.integration.findFirst({
      where: {
        workspaceId,
        provider: "quickbooks",
        status: "Connected",
      },
      select: { id: true, externalAccountId: true },
    });

    if (integration?.externalAccountId) {
      const accessToken = await getValidAccessToken(integration.id);
      qbId = await createQBCustomer(
        accessToken,
        integration.externalAccountId,
        {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          addressLine1: customerData.addressLine1,
          city: customerData.city,
          province: customerData.province,
          postalCode: customerData.postalCode,
          country: customerData.country,
        },
      );

      if (qbId) {
        await prisma.externalEntityLink.create({
          data: {
            workspaceId,
            integrationId: integration.id,
            localEntityType: "Customer",
            localEntityId: customer.id,
            externalEntityType: "Customer",
            externalEntityId: qbId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }
    }
  } catch (err) {
    console.error("Failed to create QB customer:", err);
    // Customer is created locally — QB sync can be retried
  }

  return Response.json({
    id: customer.id,
    ...(qbId ? { qbId } : {}),
  });
}
