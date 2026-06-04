export type JobStatus = "Scheduled" | "InProgress" | "Delivered" | "Completed" | "Cancelled";

export type JobRow = {
  id: string;
  title: string;
  description: string | null;
  status: JobStatus;
  scheduledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  addressLine1: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;
  customer: {
    id: string;
    name: string;
  };
};

export const STATUS_LABEL: Record<string, string> = {
  Scheduled: "Scheduled",
  InProgress: "Active",
  Delivered: "Delivered",
  Completed: "Complete",
  Cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  Scheduled: "bg-blue-500",
  InProgress: "bg-amber-500",
  Delivered: "bg-teal-500",
  Completed: "bg-emerald-500",
  Cancelled: "bg-muted-foreground/30",
};

export const JOB_STATUSES = [
  "Scheduled",
  "InProgress",
  "Delivered",
  "Completed",
  "Cancelled",
] as const;
