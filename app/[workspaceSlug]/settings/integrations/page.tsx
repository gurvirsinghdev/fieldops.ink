import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DisconnectIntegrationButton } from "@/components/workspace/DisconnectIntegrationButton";
import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  PlugZapIcon,
  TriangleAlertIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

const availableProviders = [
  {
    provider: "quickbooks",
    name: "QuickBooks",
    description:
      "Sync customers, invoices, and payments automatically with your accounting.",
  },
] as const;

const statusIcon: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Connected: CheckCircle2Icon,
  Disconnected: XCircleIcon,
  Error: TriangleAlertIcon,
  Revoked: XCircleIcon,
};

const statusColor: Record<string, string> = {
  Connected: "text-green-600",
  Disconnected: "text-muted-foreground",
  Error: "text-destructive",
  Revoked: "text-destructive",
};

const syncStatusLabel: Record<string, string> = {
  Idle: "Idle",
  Syncing: "Syncing…",
  Success: "Last sync succeeded",
  Failed: "Last sync failed",
};

const syncStatusColor: Record<string, string> = {
  Idle: "text-muted-foreground",
  Syncing: "text-blue-600",
  Success: "text-green-600",
  Failed: "text-destructive",
};

export default async function IntegrationsPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    return redirect("/signin");
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    select: { workspace: { select: { id: true } } },
  });

  if (!membership) {
    notFound();
  }

  const workspaceId = membership.workspace.id;

  const integrations = await prisma.integration.findMany({
    where: { workspaceId },
    include: {
      integrationSyncRuns: {
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  });

  const activeIntegrations = integrations.filter(
    (i) => i.status !== "Disconnected",
  );

  const connectedProviders = new Set(
    integrations.filter((i) => i.status === "Connected").map((i) => i.provider),
  );

  const unconnectedProviders = availableProviders.filter(
    (p) => !connectedProviders.has(p.provider),
  );

  const hasContent =
    activeIntegrations.length > 0 || unconnectedProviders.length > 0;

  return (
    <section className="p-6">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Connect FieldOps with your external tools.
        </p>
      </div>

      {!hasContent ? (
        <Card className="py-0">
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <PlugZapIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No integrations available</p>
              <p className="text-sm text-muted-foreground">
                New integrations will appear here when they become available.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 bg-card">
          {activeIntegrations.map((integration) => {
            const latestRun = integration.integrationSyncRuns[0];
            const StatusIcon = statusIcon[integration.status] ?? PlugZapIcon;

            return (
              <div
                key={integration.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusIcon
                        className={`size-4 shrink-0 ${statusColor[integration.status] ?? ""}`}
                      />
                      <span className="font-medium truncate">
                        {integration.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {integration.externalName && (
                        <span className="truncate">
                          {integration.externalName}
                        </span>
                      )}
                      {latestRun && (
                        <>
                          {integration.externalName && (
                            <span aria-hidden="true">·</span>
                          )}
                          <span
                            className={syncStatusColor[latestRun.status] ?? ""}
                          >
                            {syncStatusLabel[latestRun.status] ??
                              latestRun.status}
                          </span>
                          {latestRun.finishedAt && (
                            <span className="flex items-center gap-1">
                              <ClockIcon className="size-3" />
                              {new Date(
                                latestRun.finishedAt,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {integration.status === "Connected" && (
                    <DisconnectIntegrationButton
                      integrationId={integration.id}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {unconnectedProviders.map((provider) => (
            <div
              key={provider.provider}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <span className="font-medium">{provider.name}</span>
                  <p className="text-sm text-muted-foreground truncate">
                    {provider.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 ml-4">
                <Button variant="outline" asChild>
                  <Link href={`/api/integrations/quickbooks/auth`}>
                    Connect
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
