import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Customer } from "./mockData";
import { CustomerCell } from "./CustomerCell";
import { cn } from "@/lib/utils";

interface Props {
  customer: Customer;
}

export function CustomerRow({ customer }: Props) {
  return (
    <TableRow>
      <TableCell className="py-2">
        <CustomerCell customer={customer} />
      </TableCell>
      <TableCell className="py-2 text-sm text-muted-foreground tabular-nums">
        {customer.phone ?? "—"}
      </TableCell>
      <TableCell className="py-2 text-sm text-muted-foreground truncate max-w-[220px]">
        {customer.email ?? "—"}
      </TableCell>
      <TableCell className="py-2 flex items-center justify-end">
        <Button variant="ghost" size="sm">
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}
