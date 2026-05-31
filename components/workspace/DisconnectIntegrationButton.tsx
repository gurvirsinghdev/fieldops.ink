"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2Icon, UnplugIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  integrationId: string;
};

export function DisconnectIntegrationButton({ integrationId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDisconnect() {
    setLoading(true);

    try {
      const res = await fetch(`/api/integrations/${integrationId}`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(body?.error ?? "Failed to disconnect integration.");
        return;
      }

      toast.success("Integration disconnected.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleDisconnect}
      disabled={loading}
      className="cursor-pointer"
    >
      {loading ? (
        <Loader2Icon className="mr-2 h-3.5 w-3.5 animate-spin" />
      ) : (
        <UnplugIcon className="mr-2 h-3.5 w-3.5" />
      )}
      Disconnect
    </Button>
  );
}
