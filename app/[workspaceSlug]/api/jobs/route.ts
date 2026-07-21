import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getWorkspaceId } from "@/lib/workspace/helpers";
import { JOB_STATUSES } from "@/lib/constants";
import { revalidatePath } from "next/cache";

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

  const title = body.title as string;
  if (!title || typeof title !== "string" || !title.trim()) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const customerId = body.customerId as string;
  if (!customerId) {
    return Response.json({ error: "Customer is required" }, { status: 400 });
  }

  // Verify customer belongs to this workspace
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, workspaceId },
    select: { id: true },
  });

  if (!customer) {
    return Response.json({ error: "Customer not found" }, { status: 400 });
  }

  const city = (body.city as string)?.trim();
  if (!city) {
    return Response.json({ error: "City is required" }, { status: 400 });
  }

  const status = (JOB_STATUSES as readonly string[]).includes(
    body.status as string,
  )
    ? (body.status as string)
    : "Scheduled";

  const scheduledAt = body.scheduledAt
    ? new Date(body.scheduledAt as string)
    : null;

  const job = await prisma.job.create({
    data: {
      workspaceId,
      customerId,
      title: title.trim(),
      description: (body.description as string) || null,
      status: status as (typeof JOB_STATUSES)[number],
      scheduledAt,
      addressLine1: (body.addressLine1 as string) || null,
      city: (body.city as string) || null,
      province: (body.province as string) || null,
      postalCode: (body.postalCode as string) || null,
      country: (body.country as string) || null,
    },
  });

  revalidatePath(`/${workspaceSlug}/jobs`);

  return Response.json({ id: job.id });
}
