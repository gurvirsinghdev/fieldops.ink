import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import {
  ArrowRightIcon,
  Building2Icon,
  CheckCircle2Icon,
  ClockIcon,
  ExternalLinkIcon,
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
    icon: Building2Icon,
    iconBg:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
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

  const connectedProviders = new Set(integrations.map((i) => i.provider));

  const unconnectedProviders = availableProviders.filter(
    (p) => !connectedProviders.has(p.provider),
  );

  const hasContent = integrations.length > 0 || unconnectedProviders.length > 0;

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
          {integrations.map((integration) => {
            const latestRun = integration.integrationSyncRuns[0];
            const StatusIcon = statusIcon[integration.status] ?? PlugZapIcon;
            const provider = availableProviders.find(
              (p) => p.provider === integration.provider,
            );

            return (
              <div
                key={integration.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${provider?.iconBg ?? "bg-muted"}`}
                  >
                    {provider ? (
                      <provider.icon className="h-5 w-5" />
                    ) : (
                      <PlugZapIcon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {integration.name}
                      </span>
                      <StatusIcon
                        className={`size-4 shrink-0 ${statusColor[integration.status] ?? ""}`}
                      />
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
                  <Badge
                    variant={
                      integration.status === "Connected"
                        ? "default"
                        : integration.status === "Error"
                          ? "destructive"
                          : "secondary"
                    }
                    className="capitalize"
                  >
                    {integration.status.toLowerCase()}
                  </Badge>

                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/settings/integrations/${integration.id}`}>
                      Manage
                      <ExternalLinkIcon className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
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
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${provider.iconBg}`}
                >
                  <provider.icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <span className="font-medium">{provider.name}</span>
                  <p className="text-sm text-muted-foreground truncate">
                    {provider.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 ml-4">
                <Button variant="outline">
                  Connect
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
