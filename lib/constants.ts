export const JOB_STATUSES = [
  "Scheduled",
  "InProgress",
  "Delivered",
  "Completed",
  "Cancelled",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

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
