"use client";

import { useState } from "react";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ImportFromQuickBooksButton() {
  const router = useRouter();
  const [importing, setImporting] = useState(false);

  async function handleImport() {
    setImporting(true);
    try {
      const res = await fetch("/api/integrations/quickbooks/import/customers", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Import failed");
        return;
      }

      toast.success(
        `Imported ${data.imported} customer${data.imported !== 1 ? "s" : ""} from QuickBooks`,
      );
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleImport}
      disabled={importing}
      className="cursor-pointer"
    >
      {importing ? (
        <Loader2Icon className="size-3.5 mr-1.5 animate-spin" />
      ) : (
        <DownloadIcon className="size-3.5 mr-1.5" />
      )}
      Import from QuickBooks
    </Button>
  );
}
