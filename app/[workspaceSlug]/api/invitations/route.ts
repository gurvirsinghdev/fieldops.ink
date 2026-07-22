import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { buildBaseRoute } from "@/lib/urls";
import { getServerSession } from "@/lib/auth/helpers";
import { sendEmail } from "@/lib/integrations/email";
import { getWorkspaceId } from "@/lib/workspace/helpers";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceSlug: string }> },
) {
  const { workspaceSlug } = await params;

  const workspaceResult = await getWorkspaceId(workspaceSlug);
  if (typeof workspaceResult !== "string") return workspaceResult;
  const workspaceId = workspaceResult;

  // Only Owner or Admin can invite
  const session = await getServerSession();
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: session!.user.id,
      role: { in: ["Owner", "Admin"] },
    },
    select: { id: true },
  });

  if (!membership) {
    return Response.json(
      { error: "Only owners and admins can invite members" },
      { status: 403 },
    );
  }

  let body: { email?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const role = ["Owner", "Admin", "Member"].includes(body.role ?? "")
    ? body.role!
    : "Member";

  // Check if user is already a member
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      workspaceMembers: {
        where: { workspaceId },
        select: { id: true },
      },
    },
  });

  if (user?.workspaceMembers.length) {
    return Response.json(
      { error: "User is already a member of this workspace" },
      { status: 409 },
    );
  }

  // Check for existing pending invitation
  const existingInvite = await prisma.invitation.findFirst({
    where: {
      workspaceId,
      email,
      status: "Pending",
    },
    select: { id: true },
  });

  if (existingInvite) {
    return Response.json(
      { error: "An invitation has already been sent to this email" },
      { status: 409 },
    );
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.invitation.create({
    data: {
      workspaceId,
      email,
      role: role as "Owner" | "Admin" | "Member",
      token,
      expiresAt,
    },
  });

  const inviteLink = `${buildBaseRoute("")}/invite/${token}`;

  // Send email notification
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { name: true },
  });

  const inviterName = session!.user.name;
  const workspaceName = workspace?.name ?? "FieldOps";
  const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();

  const emailSent = await sendEmail({
    to: email,
    subject: `${inviterName} invited you to ${workspaceName} on FieldOps`,
    html: [
      `<p>${inviterName} has invited you to join <strong>${workspaceName}</strong> as a ${roleLabel}.</p>`,
      `<p><a href="${inviteLink}">Accept invitation</a></p>`,
      `<p style="color:#888;font-size:12px">This invitation expires in 7 days.</p>`,
    ].join(""),
    text: [
      `${inviterName} has invited you to join ${workspaceName} as a ${roleLabel}.`,
      `Accept: ${inviteLink}`,
      "This invitation expires in 7 days.",
    ].join("\n\n"),
  });

  revalidatePath(`/${workspaceSlug}/settings/members`);

  return Response.json({ link: inviteLink, emailSent });
}
