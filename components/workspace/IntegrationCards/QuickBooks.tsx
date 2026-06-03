import { Building2Icon } from "lucide-react";
import type { QBCompanyInfo } from "@/lib/quickbooks-api";

interface Props {
  config: Record<string, unknown> | null;
}

export function QuickBooksProviderCard({ config }: Props) {
  const companyInfo = config?.companyInfo as QBCompanyInfo | undefined;

  const showLegalName =
    companyInfo?.legalName &&
    companyInfo.legalName !== companyInfo.companyName;

  const addressText =
    companyInfo?.address &&
    [companyInfo.address.line1, companyInfo.address.city].filter(Boolean)
      .length > 0
      ? [
          companyInfo.address.line1,
          companyInfo.address.city,
          companyInfo.address.province,
          companyInfo.address.postalCode,
        ]
          .filter(Boolean)
          .join(", ")
      : null;

  return (
    <div className="py-3">
      {companyInfo ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Building2Icon className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="font-semibold">{companyInfo.companyName}</div>

              {showLegalName && (
                <div className="text-xs text-muted-foreground">
                  Legal name: {companyInfo.legalName}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Email: {companyInfo.email ?? "—"}
              </div>

              <div className="text-xs text-muted-foreground">
                Phone: {companyInfo.phone ?? "—"}
              </div>

              <div className="text-xs text-muted-foreground">
                Address: {addressText ?? "—"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-2">
          Company data not yet fetched. Disconnect and reconnect to refresh.
        </div>
      )}
    </div>
  );
}
