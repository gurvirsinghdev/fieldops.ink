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
  updateWorkspace: (name: string, slug: string) => void;
};

export const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  currentWorkspace: null,
  workspaces: [],
  hydrate: (currentWorkspace, workspaces) =>
    set({ currentWorkspace, workspaces }),
  updateWorkspace: (name, slug) =>
    set((state) => ({
      currentWorkspace: state.currentWorkspace
        ? { ...state.currentWorkspace, name, slug }
        : null,
      workspaces: state.workspaces.map((w) =>
        w.slug === state.currentWorkspace?.slug
          ? { ...w, name, slug }
          : w,
      ),
    })),
}));
