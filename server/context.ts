import { getServerSession } from "@/lib/auth/helpers";
import prisma from "@/lib/db/prisma";
import { TRPCError } from "@trpc/server";

export interface Context {
  workspaceSlug: string;
  userId: string;
  workspaceId: string;
}

export async function createContext(workspaceSlug: string): Promise<Context> {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    throw new TRPCError({
      message: "You are not authorized to access this resource.",
      code: "UNAUTHORIZED",
    });
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: user.id,
      workspace: { slug: workspaceSlug },
    },
    select: { workspaceId: true },
  });

  if (!membership) {
    throw new TRPCError({
      message: "You can only access resources in your workspaces.",
      code: "UNAUTHORIZED",
    });
  }

  return {
    workspaceSlug,
    userId: user.id,
    workspaceId: membership.workspaceId,
  };
}
