import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MembersPageClient } from "./MembersPageClient";

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function MembersPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    notFound();
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: user.id,
      workspace: { slug: workspaceSlug },
    },
    select: { role: true, workspaceId: true },
  });

  if (!membership) {
    notFound();
  }

  const [members, invitations] = await Promise.all([
    prisma.workspaceMember.findMany({
      where: { workspaceId: membership.workspaceId },
      select: {
        id: true,
        role: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invitation.findMany({
      where: {
        workspaceId: membership.workspaceId,
        status: "Pending",
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <MembersPageClient
      members={members}
      invitations={invitations}
      currentRole={membership.role}
      currentUserId={user.id}
    />
  );
}
