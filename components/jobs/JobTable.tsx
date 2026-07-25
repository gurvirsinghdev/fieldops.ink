"use client";

import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobTableSkeleton } from "./JobTableSkeleton";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PackagePlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_LABEL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const PER_PAGE = 25;

export function JobTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") ?? "";
  const [page, setPage] = useState(currentPage);
  const trpc = useTRPC();

  const { data, isLoading, isError, error } = useQuery(
    trpc.job.list.queryOptions({
      page,
      perPage: PER_PAGE,
      q: search || undefined,
    }),
  );

  function handlePageChange(newPage: number) {
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  }

  if (isLoading) return <JobTableSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PackagePlusIcon className="mb-2 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {error?.message ?? "Failed to load jobs."}
        </p>
      </div>
    );
  }

  const { jobs, total } = data ?? { jobs: [], total: 0 };
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PackagePlusIcon className="mb-2 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {search ? "No jobs match your search." : "No jobs yet."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Scheduled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {STATUS_LABEL[job.status as keyof typeof STATUS_LABEL] ??
                    job.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {job.customer?.name ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {job.city ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {job.scheduledAt
                  ? new Date(job.scheduledAt).toLocaleDateString()
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="cursor-pointer"
            >
              <ChevronLeftIcon className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="cursor-pointer"
            >
              <ChevronRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
