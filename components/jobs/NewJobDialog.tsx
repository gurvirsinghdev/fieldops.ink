"use client";

import { useState } from "react";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomerSelect } from "./CustomerSelect";
import { JOB_STATUSES, STATUS_LABEL } from "@/lib/constants";

export function NewJobDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState("");

  function resetForm(form: HTMLFormElement) {
    form.reset();
    setCustomerId("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const body: Record<string, string> = {};
    data.forEach((value, key) => {
      body[key] = (value as string).trim();
    });

    if (!body.title) {
      toast.error("Title is required");
      setSubmitting(false);
      return;
    }
    if (!customerId) {
      toast.error("Customer is required");
      setSubmitting(false);
      return;
    }
    if (!body.city) {
      toast.error("City is required");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Failed to create job");
        return;
      }

      toast.success("Job created");
      router.refresh();
      setOpen(false);
      resetForm(form);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="cursor-pointer">
          <PlusIcon className="size-3.5 mr-1.5" />
          New Job
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Foundation pour - Site A" />
          </div>

          <div className="space-y-1.5">
            <Label>Customer</Label>
            <CustomerSelect value={customerId} onChange={setCustomerId} />
            <input type="hidden" name="customerId" value={customerId} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
              <NativeSelect name="status" defaultValue="Scheduled">
                {JOB_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt">Scheduled date</Label>
              <Input id="scheduledAt" name="scheduledAt" type="date" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Optional notes..." />
          </div>

          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground mb-3">Job location</p>
            <div className="space-y-3">
              <Input name="addressLine1" placeholder="Address" />
              <div className="grid grid-cols-2 gap-3">
                <Input name="city" placeholder="City" required />
                <Input name="province" placeholder="Province" />
              </div>
              <Input name="postalCode" placeholder="Postal code" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <Loader2Icon className="size-3.5 mr-1.5 animate-spin" />
            ) : null}
            Create job
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
