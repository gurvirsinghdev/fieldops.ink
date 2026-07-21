import "server-only";

import { getServerSession } from "@/lib/auth/helpers";
import prisma from "@/lib/db/prisma";

export async function getWorkspaceId(
  workspaceSlug: string,
): Promise<string | Response> {
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

  return membership.workspaceId;
}
