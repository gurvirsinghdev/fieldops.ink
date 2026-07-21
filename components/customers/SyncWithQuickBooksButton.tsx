"use client";

import { useState } from "react";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SyncWithQuickBooksButton() {
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch(
        "/api/integrations/quickbooks/sync/customers",
        { method: "POST" },
      );
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Sync failed");
        return;
      }

      const parts = [];
      if (data.imported) parts.push(`${data.imported} imported`);
      if (data.exported) parts.push(`${data.exported} exported`);
      if (data.errors) parts.push(`${data.errors} error${data.errors !== 1 ? "s" : ""}`);

      toast.success(`Sync complete — ${parts.join(", ")}`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleSync}
      disabled={syncing}
      className="cursor-pointer"
    >
      {syncing ? (
        <Loader2Icon className="size-3.5 mr-1.5 animate-spin" />
      ) : (
        <RefreshCwIcon className="size-3.5 mr-1.5" />
      )}
      Sync with QuickBooks
    </Button>
  );
}
