"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbSegment {
  label: string;
  href: string;
  isCurrent: boolean;
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo<BreadcrumbSegment[]>(() => {
    const segments = pathname.split("/").filter(Boolean);

    const result: BreadcrumbSegment[] = [
      { label: "Dashboard", href: "/", isCurrent: segments.length === 0 },
    ];

    let currentPath = "";
    for (const [idx, segment] of segments.entries()) {
      currentPath += "/" + segment;
      result.push({
        label: segment.replace(/-/g, " "),
        href: currentPath,
        isCurrent: idx === segments.length - 1,
      });
    }

    return result;
  }, [pathname]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.flatMap((crumb) => {
          const item = (
            <BreadcrumbItem key={crumb.href}>
              {crumb.isCurrent ? (
                <BreadcrumbPage className="capitalize">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href} className="capitalize">
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );

          if (crumb.isCurrent) return [item];

          return [
            item,
            <BreadcrumbSeparator key={`sep-${crumb.href}`} />,
          ];
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
