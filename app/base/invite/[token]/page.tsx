import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import { buildBaseRoute } from "@/lib/utils";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InviteAcceptPage({ params }: Props) {
  const { token } = await params;
  const session = await getServerSession();
  const user = session?.user;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      workspace: { select: { id: true, slug: true, name: true } },
    },
  });

  if (!invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2 max-w-sm">
          <h1 className="text-lg font-semibold">Invitation not found</h1>
          <p className="text-sm text-muted-foreground">
            This invitation link is invalid or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (invitation.status !== "Pending") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2 max-w-sm">
          <h1 className="text-lg font-semibold">
            {invitation.status === "Accepted"
              ? "Invitation already accepted"
              : "Invitation expired"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {invitation.status === "Accepted"
              ? "You are already a member of this workspace."
              : "This invitation has expired. Ask an admin to send a new one."}
          </p>
        </div>
      </div>
    );
  }

  if (new Date() > invitation.expiresAt) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "Expired" },
    });

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2 max-w-sm">
          <h1 className="text-lg font-semibold">Invitation expired</h1>
          <p className="text-sm text-muted-foreground">
            This invitation has expired. Ask an admin to send a new one.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return redirect(
      buildBaseRoute(`/signup?invite=${token}`),
    );
  }

  if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2 max-w-sm">
          <h1 className="text-lg font-semibold">Wrong account</h1>
          <p className="text-sm text-muted-foreground">
            This invitation was sent to {invitation.email}. Please sign in with
            that account.
          </p>
        </div>
      </div>
    );
  }

  // Check if already a member
  const existingMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: invitation.workspace.id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (existingMember) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "Accepted" },
    });

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2 max-w-sm">
          <h1 className="text-lg font-semibold">Already a member</h1>
          <p className="text-sm text-muted-foreground">
            You are already a member of {invitation.workspace.name}.
          </p>
        </div>
      </div>
    );
  }

  // Accept invitation
  await Promise.all([
    prisma.workspaceMember.create({
      data: {
        workspaceId: invitation.workspace.id,
        userId: user.id,
        role: invitation.role,
      },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "Accepted" },
    }),
  ]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-3 max-w-sm">
        <h1 className="text-lg font-semibold">Welcome to {invitation.workspace.name}</h1>
        <p className="text-sm text-muted-foreground">
          You have been added as {invitation.role.toLowerCase()}.
        </p>
        <a
          href={buildBaseRoute("")}
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Go to dashboard
        </a>
      </div>
    </div>
  );
}
