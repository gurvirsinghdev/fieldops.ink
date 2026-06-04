import { DisconnectIntegrationButton } from "./DisconnectIntegrationButton";

interface Props {
  id: string;
  name: string;
  status: string;
  config: Record<string, unknown> | null;
}

const STATUS_COLORS: Record<string, string> = {
  Connected: "bg-green-500",
  Error: "bg-destructive",
  Disconnected: "bg-muted-foreground/30",
  Revoked: "bg-destructive",
};

export function IntegrationCard({ id, name, status, config }: Props) {
  const statusColor = STATUS_COLORS[status] ?? "bg-muted-foreground/30";
  const companyInfo = config?.companyInfo as
    | { companyName?: string }
    | undefined;

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${statusColor}`}
            />
            <span className="font-medium">{name}</span>
          </div>
          {companyInfo?.companyName && (
            <div className="text-sm text-muted-foreground mt-0.5 ml-4.5">
              {companyInfo.companyName}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <DisconnectIntegrationButton integrationId={id} />
        </div>
      </div>
    </div>
  );
}
