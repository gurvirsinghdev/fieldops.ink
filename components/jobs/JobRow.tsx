import { TableCell, TableRow } from "@/components/ui/table";
import type { JobRow } from "./types";
import { StatusBadge } from "./StatusBadge";

interface Props {
  job: JobRow;
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function locationLabel(job: JobRow): string {
  const parts = [job.city, job.province].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export function JobRow({ job }: Props) {
  return (
    <TableRow>
      <TableCell className="py-2">
        <div className="text-sm font-medium truncate max-w-[280px]">
          {job.title}
        </div>
      </TableCell>
      <TableCell className="py-2 text-sm text-muted-foreground">
        {job.customer.name}
      </TableCell>
      <TableCell className="py-2 text-sm text-muted-foreground">
        {locationLabel(job)}
      </TableCell>
      <TableCell className="py-2">
        <StatusBadge status={job.status} />
      </TableCell>
      <TableCell className="py-2 text-sm text-muted-foreground tabular-nums">
        {formatDate(job.scheduledAt)}
      </TableCell>
    </TableRow>
  );
}
