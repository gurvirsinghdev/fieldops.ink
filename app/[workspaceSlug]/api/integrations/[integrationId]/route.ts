import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ integrationId: string }> },
) {
  const { integrationId } = await params;

  const session = await getServerSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
    select: { id: true, workspaceId: true },
  });

  if (!integration) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: session.user.id,
      workspaceId: integration.workspaceId,
    },
    select: { id: true },
  });

  if (!membership) {
    return Response.json({ error: "Not a member" }, { status: 403 });
  }

  await prisma.integration.update({
    where: { id: integrationId },
    data: {
      status: "Disconnected",
      accessTokenEncrypted: null,
      refreshTokenEncrypted: null,
      tokenExpiresAt: null,
    },
  });

  return Response.json({ ok: true });
}
