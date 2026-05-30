"use client";

import type { User } from "@/stores/user-store";
import type { Workspace } from "@/stores/workspace-store";
import { useUserStore } from "@/stores/user-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useEffect, useRef } from "react";

type Props = {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  user: User;
};

export function StoreHydrator({ currentWorkspace, workspaces, user }: Props) {
  const prevKey = useRef<string>("");

  useEffect(() => {
    const key = `${currentWorkspace.slug}:${user.id}`;
    if (prevKey.current === key) return;
    prevKey.current = key;

    useWorkspaceStore.setState({ currentWorkspace, workspaces });
    useUserStore.setState({ user });
  }, [currentWorkspace, workspaces, user]);

  return null;
}
