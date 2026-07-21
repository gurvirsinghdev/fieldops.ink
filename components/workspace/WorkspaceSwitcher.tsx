"use client";

import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { WorkspaceAvatar } from "@/components/workspace/WorkspaceAvatar";
import { buildWorkspaceRoute } from "@/lib/urls";

type Props = {
  trigger: ReactNode;
};

export function WorkspaceSwitcher({ trigger }: Props) {
  const workspaces = useWorkspaceStore((s) => s.workspaces);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full cursor-pointer outline-none">
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.slug}
            className="cursor-pointer focus:bg-muted focus:color-background! focus:stroke-background!"
            onClick={() => {
              window.location.href = buildWorkspaceRoute(workspace.slug);
            }}
          >
            <WorkspaceAvatar
              size="sm"
              className="rounded-lg shrink-0"
              workspace={workspace}
            />
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate text-sm">{workspace.name}</span>
              <span className="truncate capitalize text-xs text-muted-foreground">
                {workspace.plan}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
