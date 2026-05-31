"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2Icon,
  ChevronsUpDownIcon,
  LayoutDashboardIcon,
  SettingsIcon,
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
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function WorkspaceSidebar() {
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const workspaces = useWorkspaceStore((s) => s.workspaces);

  const navigationLinks = [
    { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  ];
  const bottomNavigationLinks = [
    { title: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full cursor-pointer outline-none">
            <div className="flex items-center justify-between rounded-lg p-2 gap-2 bg-muted group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent">
              <div className="size-8 flex aspect-square items-center justify-center rounded-lg bg-primary shrink-0">
                <Building2Icon className="size-4 stroke-background!" />
              </div>
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm">
                  {currentWorkspace?.name}&nbsp;
                </span>
                <span className="truncate capitalize text-xs text-muted-foreground">
                  {currentWorkspace?.plan}&nbsp;
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.slug}
                className="cursor-pointer focus:bg-muted focus:color-background! focus:stroke-background!"
              >
                <div className="size-8 flex aspect-square items-center justify-center text-muted rounded-lg bg-primary">
                  <Building2Icon className="size-4 stroke-background!" />
                </div>
                <div className="grid flex-1 text-left  leading-tight">
                  <span className="truncate text-sm">{workspace.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {workspace.plan}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
