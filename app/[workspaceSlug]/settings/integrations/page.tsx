import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, ExternalLinkIcon, PlugZapIcon } from "lucide-react";

export default async function IntegrationsPage() {
  const connected = true;

  return (
    <section className="p-6">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Connect FieldOps with your external tools.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <PlugZapIcon className="h-5 w-5" />
            </div>

            <p className="font-medium">QuickBooks</p>
          </div>

          {connected ? (
            <CheckCircle2Icon className="h-5 w-5 text-green-600" />
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Badge>Connected</Badge>

          <Button size="sm" variant="outline">
            Manage
            <ExternalLinkIcon className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
