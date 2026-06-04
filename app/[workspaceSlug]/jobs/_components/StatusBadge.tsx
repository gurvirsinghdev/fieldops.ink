import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, STATUS_LABEL } from "./types";

interface Props {
  status: string;
}

const BADGE_STYLE: Record<string, string> = {
  Scheduled:
    "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
  InProgress:
    "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
  Delivered:
    "bg-teal-500/10 text-teal-600 border-teal-500/20 hover:bg-teal-500/20",
  Completed:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
  Cancelled:
    "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20 hover:bg-muted-foreground/20",
};

export function StatusBadge({ status }: Props) {
  const color = STATUS_COLORS[status] ?? "bg-muted-foreground/30";
  const label = STATUS_LABEL[status] ?? status;
  const badgeStyle = BADGE_STYLE[status] ?? "";

  return (
    <Badge variant="outline" className={badgeStyle}>
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${color}`}
      />
      {label}
    </Badge>
  );
}
