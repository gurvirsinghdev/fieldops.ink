import type { JobStatus } from "@/lib/constants";
import { JOB_STATUSES, STATUS_LABEL, STATUS_COLORS } from "@/lib/constants";

export type { JobStatus };
export { JOB_STATUSES, STATUS_LABEL, STATUS_COLORS };

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
