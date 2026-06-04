"use client";

import { cn } from "@/lib/utils";
import {
  Building2Icon,
  KeyRoundIcon,
  PlugZapIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: UserIcon,
  },
  {
    title: "Workspace",
    href: "/settings/workspace",
    icon: Building2Icon,
  },
  {
    title: "Members",
    href: "/settings/members",
    icon: UsersIcon,
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: KeyRoundIcon,
  },
  {
    title: "Integrations",
    href: "/settings/integrations",
    icon: PlugZapIcon,
  },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b bg-sidebar text-sidebar-foreground md:w-56 md:h-full md:border-r md:border-b-0">
      <div className="flex items-center gap-2 px-4 h-14 border-b md:border-b">
        <SettingsIcon className="size-4 shrink-0" />
        <span className="text-sm">Settings</span>
      </div>

      <nav className="flex-1 p-2">
        <ul className="flex flex-row gap-1 md:flex-col">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground whitespace-nowrap",
                    isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                  )}
                >
                  <link.icon className="size-4 shrink-0" />
                  <span className="hidden md:inline">{link.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
