import { create } from "zustand";

export type Workspace = {
  name: string;
  slug: string;
  plan: string;
};

type WorkspaceStore = {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  hydrate: (currentWorkspace: Workspace, workspaces: Workspace[]) => void;
};

export const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  currentWorkspace: null,
  workspaces: [],
  hydrate: (currentWorkspace, workspaces) =>
    set({ currentWorkspace, workspaces }),
}));
