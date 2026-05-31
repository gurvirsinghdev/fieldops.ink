"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Building2Icon } from "lucide-react";

const sizeClasses = {
  sm: "h-8 w-8",
  default: "h-10 w-10",
  lg: "h-24 w-24",
} as const;

type Props = {
  className?: string;
  size?: keyof typeof sizeClasses;
  workspace?: { name: string; image?: string | null };
};

export function WorkspaceAvatar({
  className,
  size = "default",
  workspace: workspaceProp,
}: Props) {
  const stored = useWorkspaceStore((s) => s.currentWorkspace);
  const workspace = workspaceProp ?? stored;

  return (
    <Avatar
      className={`${sizeClasses[size]} rounded-lg after:rounded-lg ${className ?? ""}`}
    >
      <AvatarImage
        src={workspace?.image ?? ""}
        alt={workspace?.name ?? "Workspace"}
        className="rounded-lg"
      />
      <AvatarFallback className="rounded-lg bg-primary">
        <Building2Icon className="size-4 stroke-background!" />
      </AvatarFallback>
    </Avatar>
  );
}
