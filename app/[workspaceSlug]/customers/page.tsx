import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import { CustomerTable } from "./_components/CustomerTable";
import { mockCustomers } from "./_components/mockData";

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

  const qbConnected = membership
    ? !!(await prisma.integration.findFirst({
        where: {
          workspaceId: membership.workspaceId,
          provider: "quickbooks",
          status: "Connected",
        },
        select: { id: true },
      }))
    : false;

  return (
    <div>
      <CustomerTable customers={mockCustomers} qbConnected={qbConnected} />
    </div>
  );
}
