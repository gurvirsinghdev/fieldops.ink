import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getWorkspaceId } from "@/lib/route-guards";
import { revalidatePath } from "next/cache";

export async function DELETE(
  _request: NextRequest,
  { params }: {
    params: Promise<{ workspaceSlug: string; invitationId: string }>;
  },
) {
  const { workspaceSlug, invitationId } = await params;

  const workspaceResult = await getWorkspaceId(workspaceSlug);
  if (typeof workspaceResult !== "string") return workspaceResult;
  const workspaceId = workspaceResult;

  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      workspaceId,
      status: "Pending",
    },
    select: { id: true },
  });

  if (!invitation) {
    return Response.json(
      { error: "Invitation not found or already processed" },
      { status: 404 },
    );
  }

  await prisma.invitation.delete({
    where: { id: invitationId },
  });

  revalidatePath(`/${workspaceSlug}/settings/members`);

  return Response.json({ ok: true });
}
