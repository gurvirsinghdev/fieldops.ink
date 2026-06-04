"use client";

import { useCallback, useRef, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NativeSelect } from "@/components/ui/native-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter } from "next/navigation";
import type { JobRow } from "./types";
import { JobRow as JobRowComponent } from "./JobRow";
import { JOB_STATUSES, STATUS_LABEL } from "./types";

const PER_PAGE_OPTIONS = [20, 30, 50] as const;

interface Props {
  jobs: JobRow[];
  total: number;
  page: number;
  perPage: number;
  query: string;
  status: string;
}

export function JobTable({
  jobs,
  total,
  page,
  perPage,
  query,
  status,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const totalPages = Math.ceil(total / perPage);

  const pushParams = useCallback(
    (overrides: Record<string, string | number>) => {
      const params = new URLSearchParams();
      const nextQuery = String(overrides.q ?? search);
      const nextStatus = String(overrides.status ?? status);
      const nextPage = String(overrides.page ?? 1);
      const nextPerPage = String(overrides.perPage ?? perPage);

      if (nextQuery) params.set("q", nextQuery);
      if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
      if (nextPage !== "1") params.set("page", nextPage);
      if (nextPerPage !== "20") params.set("perPage", nextPerPage);

      const qs = params.toString();
      router.push(qs ? `?${qs}` : window.location.pathname);
    },
    [router, search, status, perPage],
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        pushParams({ q: value, page: 1 });
      }, 300);
    },
    [pushParams],
  );

  const handlePerPage = useCallback(
    (value: string) => {
      pushParams({ perPage: Number(value), page: 1 });
    },
    [pushParams],
  );

  const handleStatus = useCallback(
    (value: string) => {
      pushParams({ status: value || "all", page: 1 });
    },
    [pushParams],
  );

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
        <div className="relative flex-1 max-w-xs bg-card! rounded-lg border border-border">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            autoFocus={!!search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 h-7 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <ToggleGroup
            type="single"
            value={status || "all"}
            onValueChange={handleStatus}
            size="sm"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            {JOB_STATUSES.map((s) => (
              <ToggleGroupItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="ml-auto text-xs text-muted-foreground tabular-nums">
          {total} job{total !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Title</TableHead>
              <TableHead className="w-40">Customer</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-32">Scheduled</TableHead>
              <TableHead className="flex justify-end items-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <td
                  colSpan={5}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No jobs found
                </td>
              </TableRow>
            ) : (
              jobs.map((job) => <JobRowComponent key={job.id} job={job} />)
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-[7.5] border-t">
          <div className="flex items-center gap-2 w-full">
            <NativeSelect
              size="sm"
              value={String(perPage)}
              onChange={(e) => handlePerPage(e.target.value)}
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </NativeSelect>
            <span className="text-xs text-muted-foreground">
              Records per page
            </span>
          </div>

          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => pushParams({ page: page - 1 })}
                  aria-disabled={page <= 1}
                  tabIndex={page <= 1 ? -1 : undefined}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  text="Previous"
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-xs text-muted-foreground tabular-nums px-2">
                  Page {page} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => pushParams({ page: page + 1 })}
                  aria-disabled={page >= totalPages}
                  tabIndex={page >= totalPages ? -1 : undefined}
                  className={
                    page >= totalPages ? "pointer-events-none opacity-50" : ""
                  }
                  text="Next"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
