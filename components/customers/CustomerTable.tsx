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
import { EditCustomerDialog } from "./EditCustomerDialog";
import { CustomerTableSkeleton } from "./CustomerTableSkeleton";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PackagePlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PER_PAGE = 25;

export function CustomerTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") ?? "";
  const [page, setPage] = useState(currentPage);
  const trpc = useTRPC();

  const { data, isLoading, isError, error } = useQuery(
    trpc.customer.list.queryOptions({
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

  if (isLoading) return <CustomerTableSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PackagePlusIcon className="mb-2 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {error?.message ?? "Failed to load customers."}
        </p>
      </div>
    );
  }

  const { customers, total } = data ?? { customers: [], total: 0 };
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PackagePlusIcon className="mb-2 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {search ? "No customers match your search." : "No customers yet."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>City</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {customer.email ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {customer.city ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                <EditCustomerDialog customer={customer} />
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
