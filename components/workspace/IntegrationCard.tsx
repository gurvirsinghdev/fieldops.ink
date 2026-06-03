"use client";

import { useState } from "react";
import {
  Building2Icon,
  ChevronDownIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";
import type { QBCompanyInfo } from "@/lib/quickbooks-api";
import { DisconnectIntegrationButton } from "./DisconnectIntegrationButton";

const STATUS_COLORS: Record<string, string> = {
  Connected: "bg-green-500",
  Error: "bg-destructive",
  Disconnected: "bg-muted-foreground/30",
  Revoked: "bg-destructive",
};

interface Props {
  id: string;
  name: string;
  status: string;
  config: Record<string, unknown> | null;
}

export function IntegrationCard({ id, name, status, config }: Props) {
  const [expanded, setExpanded] = useState(false);
  const companyInfo = config?.companyInfo as QBCompanyInfo | undefined;
  const statusColor = STATUS_COLORS[status] ?? "bg-muted-foreground/30";

  return (
    <div className="rounded-lg border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-4 w-full cursor-pointer hover:bg-muted/30 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${statusColor}`}
            />
            <span className="font-medium">{name}</span>
          </div>

          {companyInfo?.companyName && !expanded && (
            <span className="text-sm text-muted-foreground truncate">
              — {companyInfo.companyName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <ChevronDownIcon
            className={`size-4 text-muted-foreground transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t">
          {companyInfo ? (
            <div className="pt-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Building2Icon className="size-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="font-semibold">{companyInfo.companyName}</div>
                  {companyInfo.legalName &&
                    companyInfo.legalName !== companyInfo.companyName && (
                      <div className="text-xs text-muted-foreground">
                        Legal name: {companyInfo.legalName}
                      </div>
                    )}
                  {companyInfo.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MailIcon className="size-3 shrink-0" />
                      {companyInfo.email}
                    </div>
                  )}
                  {companyInfo.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <PhoneIcon className="size-3 shrink-0" />
                      {companyInfo.phone}
                    </div>
                  )}
                  {companyInfo.address &&
                    [companyInfo.address.line1, companyInfo.address.city]
                      .filter(Boolean)
                      .length > 0 && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MapPinIcon className="size-3 shrink-0 mt-0.5" />
                        <span>
                          {[
                            companyInfo.address.line1,
                            companyInfo.address.city,
                            companyInfo.address.province,
                            companyInfo.address.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4 text-sm text-muted-foreground text-center py-4">
              Company information not yet available. Reconnect to fetch it.
            </div>
          )}

          <div className="flex justify-end pt-3">
            <DisconnectIntegrationButton integrationId={id} />
          </div>
        </div>
      )}
    </div>
  );
}
