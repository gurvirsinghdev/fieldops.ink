"use client";

import { useState, useMemo } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer } from "./mockData";
import { CustomerRow } from "./CustomerRow";

interface Props {
  customers: Customer[];
}

export function CustomerTable({ customers }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;

    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q),
    );
  }, [customers, search]);

  return (
    <div className="flex flex-col h-full rounded-lg border bg-card">
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
        <div className="relative flex-1 max-w-xs bg-card! rounded border border-border">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        <div className="ml-auto text-xs text-muted-foreground tabular-nums">
          {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead className="w-[160px]">Phone</TableHead>
              <TableHead className="w-[240px]">Email</TableHead>
              <TableHead className="flex justify-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <td
                  colSpan={4}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No customers found
                </td>
              </TableRow>
            ) : (
              filtered.map((customer) => (
                <CustomerRow key={customer.id} customer={customer} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
