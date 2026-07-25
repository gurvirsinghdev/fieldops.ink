import { Card, CardContent } from "@/components/ui/card";
import { IntegrationCard } from "@/components/workspace/IntegrationCard";
import { getServerSession } from "@/lib/auth/helpers";
import prisma from "@/lib/db/prisma";
import { getValidAccessToken } from "@/lib/integrations/quickbooks/auth";
import { fetchCompanyInfo } from "@/lib/integrations/quickbooks/api";
import { ArrowRightIcon, PlugZapIcon } from "lucide-react";
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
    select: {
      id: true,
      provider: true,
      name: true,
      status: true,
      externalName: true,
      externalAccountId: true,
      config: true,
    },
  });

  // Backfill company info for connected QuickBooks integrations missing it
  const enrichedIntegrations = await Promise.all(
    integrations.map(async (integration) => {
      if (
        integration.provider !== "quickbooks" ||
        integration.status !== "Connected" ||
        (integration.config as Record<string, unknown>)?.companyInfo
      ) {
        return integration;
      }

      const realmId = integration.externalAccountId;
      if (!realmId) return integration;

      try {
        const accessToken = await getValidAccessToken(integration.id);
        const companyInfo = await fetchCompanyInfo(accessToken, realmId);

        const updated = await prisma.integration.update({
          where: { id: integration.id },
          data: {
            externalName: companyInfo.companyName,
            config: JSON.parse(JSON.stringify({ companyInfo })),
          },
          select: {
            id: true,
            provider: true,
            name: true,
            status: true,
            externalName: true,
            externalAccountId: true,
            config: true,
          },
        });

        return updated;
      } catch {
        console.error(
          `Failed to backfill company info for integration ${integration.id}`,
        );
        return integration;
      }
    }),
  );

  const activeIntegrations = enrichedIntegrations.filter(
    (i) => i.status !== "Disconnected",
  );

  const connectedProviders = new Set(
    enrichedIntegrations
      .filter((i) => i.status === "Connected")
      .map((i) => i.provider),
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
        <div className="space-y-3">
          {activeIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              id={integration.id}
              name={integration.name}
              status={integration.status}
              config={integration.config as Record<string, unknown> | null}
            />
          ))}

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
                <Link href="/api/integrations/quickbooks/auth">
                  <span className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
                    Connect
                    <ArrowRightIcon className="size-3.5" />
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
