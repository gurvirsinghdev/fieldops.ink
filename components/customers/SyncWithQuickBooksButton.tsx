"use client";

import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/react";
import { useMutation } from "@tanstack/react-query";

export function SyncWithQuickBooksButton() {
  const trpc = useTRPC();
  const syncCustomers = useMutation(
    trpc.integration.syncCustomers.mutationOptions({
      onSuccess: (data) => {
        const parts = [];
        if (data.imported) parts.push(`${data.imported} imported`);
        if (data.exported) parts.push(`${data.exported} exported`);
        if (data.errors)
          parts.push(`${data.errors} error${data.errors !== 1 ? "s" : ""}`);
        toast.success(`Sync complete — ${parts.join(", ")}`);
      },
      onError: (err) => {
        toast.error(err.message ?? "Sync failed");
      },
    }),
  );

  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => syncCustomers.mutate()}
      disabled={syncCustomers.isPending}
      className="cursor-pointer"
    >
      {syncCustomers.isPending ? (
        <Loader2Icon className="size-3.5 mr-1.5 animate-spin" />
      ) : (
        <RefreshCwIcon className="size-3.5 mr-1.5" />
      )}
      Sync with QuickBooks
    </Button>
  );
}
