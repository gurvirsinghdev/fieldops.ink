import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import { buildBaseRoute, buildWorkspaceRoute } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function MyWorkspace() {
  const session = await getServerSession();

  const user = session?.user;
  if (!user) {
    redirect(buildBaseRoute("/signin"));
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id, role: "Owner" },
    select: { workspace: { select: { slug: true } } },
  });
  if (!membership) {
    redirect(buildBaseRoute("/signin"));
  }

  redirect(buildWorkspaceRoute(membership.workspace.slug));
}
