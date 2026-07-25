"use client";

import { ReactNode } from "react";
import {
  ClipboardListIcon,
  LayoutDashboardIcon,
  PackageIcon,
  SettingsIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";

type Props = {
  trigger: ReactNode;
};

export default function WorkspaceSidebar({ trigger }: Props) {
  const navigationLinks = [
    { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
    { title: "Customers", href: "/customers", icon: UsersIcon },
    { title: "Jobs", href: "/jobs", icon: ClipboardListIcon },
    { title: "Inventory", href: "/inventory", icon: PackageIcon },
  ];
  const bottomNavigationLinks = [
    { title: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <WorkspaceSwitcher trigger={trigger} />
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navigationLinks.map((link, idx) => (
            <SidebarMenuItem key={idx}>
              <SidebarMenuButton asChild>
                <a href={link.href}>
                  <link.icon className="size-4" />
                  <span>{link.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t">
        <SidebarMenu>
          {bottomNavigationLinks.map((link, idx) => (
            <SidebarMenuItem key={idx}>
              <SidebarMenuButton asChild>
                <a href={link.href}>
                  <link.icon className="size-4" />
                  <span>{link.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
