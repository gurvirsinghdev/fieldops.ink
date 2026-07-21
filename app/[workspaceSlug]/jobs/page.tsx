import { Prisma } from "@/generated/client";
import prisma from "@/lib/db/prisma";
import { getWorkspaceId } from "@/lib/workspace/helpers";
import { JOB_STATUSES } from "@/lib/constants";
import { JobTable } from "@/components/jobs/JobTable";

interface Props {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    perPage?: string;
  }>;
}

const VALID_PER_PAGE = [20, 30, 50] as const;

export default async function JobsPage({ params, searchParams }: Props) {
  const { workspaceSlug } = await params;

  const workspaceResult = await getWorkspaceId(workspaceSlug);
  if (typeof workspaceResult !== "string") {
    return <div>Unauthorized</div>;
  }
  const workspaceId = workspaceResult;

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = VALID_PER_PAGE.includes(
    Number(sp.perPage) as (typeof VALID_PER_PAGE)[number],
  )
    ? (Number(sp.perPage) as (typeof VALID_PER_PAGE)[number])
    : 20;
  const query = sp.q || "";
  const rawStatus = sp.status ?? "";
  const statusFilter = (JOB_STATUSES as readonly string[]).includes(rawStatus)
    ? rawStatus
    : "";

  const where: Prisma.JobWhereInput = {
    workspaceId,
    ...(statusFilter ? { status: statusFilter as Prisma.EnumJobStatusFilter["equals"] } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            {
              customer: {
                name: { contains: query, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        scheduledAt: true,
        startedAt: true,
        completedAt: true,
        addressLine1: true,
        city: true,
        province: true,
        postalCode: true,
        country: true,
        customer: {
          select: { id: true, name: true },
        },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.count({ where }),
  ]);

  return (
    <div>
      <JobTable
        jobs={jobs}
        total={total}
        page={page}
        perPage={perPage}
        query={query}
        status={statusFilter}
      />
    </div>
  );
}
