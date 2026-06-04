import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import { CustomerTable } from "./_components/CustomerTable";

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function CustomersPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await getServerSession();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: session.user.id,
      workspace: { slug: workspaceSlug },
    },
    select: { workspaceId: true },
  });

  if (!membership) {
    return <div>Not a member</div>;
  }

  const [customers, qbIntegration] = await Promise.all([
    prisma.customer.findMany({
      where: { workspaceId: membership.workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        province: true,
        country: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.integration.findFirst({
      where: {
        workspaceId: membership.workspaceId,
        provider: "quickbooks",
        status: "Connected",
      },
      select: { id: true },
    }),
  ]);

  return (
    <div>
      <CustomerTable
        customers={customers}
        qbConnected={!!qbIntegration}
      />
    </div>
  );
}
