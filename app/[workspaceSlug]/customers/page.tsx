import { getServerSession } from "@/lib/auth/helpers";
import prisma from "@/lib/db/prisma";
import { CustomerTable } from "@/components/customers/CustomerTable";

interface Props {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ q?: string; page?: string; perPage?: string }>;
}

const VALID_PER_PAGE = [20, 30, 50] as const;

export default async function CustomersPage({ params, searchParams }: Props) {
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

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = VALID_PER_PAGE.includes(Number(sp.perPage) as typeof VALID_PER_PAGE[number])
    ? (Number(sp.perPage) as typeof VALID_PER_PAGE[number])
    : 20;
  const query = sp.q || "";

  const where = {
    workspaceId: membership.workspaceId,
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
            { phone: { contains: query } },
          ],
        }
      : {}),
  };

  const [customers, total, qbIntegration] = await Promise.all([
    prisma.customer.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        addressLine1: true,
        city: true,
        province: true,
        postalCode: true,
        country: true,
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count({ where }),
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
        total={total}
        page={page}
        perPage={perPage}
        query={query}
        qbConnected={!!qbIntegration}
      />
    </div>
  );
}
