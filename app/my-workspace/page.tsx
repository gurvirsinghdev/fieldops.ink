import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MyWorkspace() {
  const session = await getServerSession();

  const user = session?.user;
  if (!user) {
    redirect("/signin");
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id, role: "Owner" },
    select: { workspace: { select: { slug: true } } },
  });
  if (!membership) {
    redirect("/signin");
  }

  redirect(`http://localhost:3000/workspace/${membership.workspace.slug}`);
}
