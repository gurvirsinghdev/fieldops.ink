"use client";

import { WorkspaceAvatar } from "@/components/workspace/WorkspaceAvatar";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ChevronsUpDownIcon } from "lucide-react";

export function SidebarTrigger() {
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  return (
    <div className="flex items-center justify-between rounded-lg p-2 gap-2 bg-muted group-data-[collapsible=icon]:p-[10.5]! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent">
      <WorkspaceAvatar size="sm" className="rounded-lg shrink-0" />
      <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate text-sm">{currentWorkspace?.name}&nbsp;</span>
        <span className="truncate capitalize text-xs text-muted-foreground">
          {currentWorkspace?.plan}&nbsp;
        </span>
      </div>
      <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
    </div>
  );
}
