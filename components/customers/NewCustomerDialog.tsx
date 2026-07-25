"use client";

import { useState } from "react";
import { PlusIcon, Loader2Icon } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function NewCustomerDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createCustomer = useMutation(
    trpc.customer.create.mutationOptions({
      onSuccess: (result) => {
        const qbMsg = result.qbId ? " and in QuickBooks" : "";
        toast.success(`Customer created${qbMsg}`);
        queryClient.invalidateQueries({
          queryKey: trpc.customer.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.customer.search.queryKey(),
        });
        router.refresh();
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to create customer");
      },
    }),
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = (data.get("name") as string)?.trim();
    if (!name) {
      toast.error("Name is required");
      setSubmitting(false);
      return;
    }

    createCustomer.mutate(
      {
        name,
        email: (data.get("email") as string)?.trim() || null,
        phone: (data.get("phone") as string)?.trim() || null,
        addressLine1: (data.get("addressLine1") as string)?.trim() || null,
        city: (data.get("city") as string)?.trim() || null,
        province: (data.get("province") as string)?.trim() || null,
        postalCode: (data.get("postalCode") as string)?.trim() || null,
        country: (data.get("country") as string)?.trim() || null,
      },
      {
        onSettled: () => {
          setSubmitting(false);
          form.reset();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="cursor-pointer">
          <PlusIcon className="size-3.5 mr-1.5" />
          New Customer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Acme Construction"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contact@acme.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="604-555-1234" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="addressLine1">Address</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="Vancouver" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="province">Province</Label>
              <Input id="province" name="province" placeholder="BC" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input id="postalCode" name="postalCode" placeholder="V6B 1A1" />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <Loader2Icon className="size-3.5 mr-1.5 animate-spin" />
            ) : null}
            Create customer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
