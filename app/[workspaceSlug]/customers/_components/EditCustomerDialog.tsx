"use client";

import { useState } from "react";
import { Loader2Icon, PencilIcon } from "lucide-react";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    addressLine1: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
  };
}

export function EditCustomerDialog({ customer }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const body: Record<string, string> = {};
    data.forEach((value, key) => {
      body[key] = (value as string).trim();
    });

    if (!body.name) {
      toast.error("Name is required");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Failed to update customer");
        return;
      }

      toast.success("Customer updated");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" variant="ghost" size="sm">
          <PencilIcon className="size-3.5 mr-1.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={customer.name}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer.email ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer.phone ?? ""}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="addressLine1">Address</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              defaultValue={customer.addressLine1 ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={customer.city ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                name="province"
                defaultValue={customer.province ?? ""}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              defaultValue={customer.postalCode ?? ""}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <Loader2Icon className="size-3.5 mr-1.5 animate-spin" />
            ) : null}
            Save changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
