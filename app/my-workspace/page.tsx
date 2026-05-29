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

  const appHost = process.env.APP_HOST;
  const appPort = appHost === "localhost" ? ":3000" : "";
  const scheme = process.env.NODE_ENV === "production" ? "https" : "http";

  redirect(
    `${scheme}://${appHost}${appPort}/workspace/${membership.workspace.slug}`,
  );
}
