"use client";

import { Button } from "@/components/ui/button";
import { Loader2Icon, UnplugIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/lib/trpc/react";
import { useMutation } from "@tanstack/react-query";

type Props = {
  integrationId: string;
};

export function DisconnectIntegrationButton({ integrationId }: Props) {
  const router = useRouter();
  const trpc = useTRPC();
  const disconnect = useMutation(
    trpc.integration.disconnect.mutationOptions({
      onSuccess: () => {
        toast.success("Integration disconnected.");
        router.refresh();
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to disconnect integration.");
      },
    }),
  );

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => disconnect.mutate({ integrationId })}
      disabled={disconnect.isPending}
      className="cursor-pointer"
    >
      {disconnect.isPending ? (
        <Loader2Icon className="mr-2 h-3.5 w-3.5 animate-spin" />
      ) : (
        <UnplugIcon className="mr-2 h-3.5 w-3.5" />
      )}
      Disconnect
    </Button>
  );
}
