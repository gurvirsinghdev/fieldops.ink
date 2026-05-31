import { create } from "zustand";

export type Workspace = {
  name: string;
  slug: string;
  plan: string;
  image?: string | null;
};

type WorkspaceStore = {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  hydrate: (currentWorkspace: Workspace, workspaces: Workspace[]) => void;
  updateWorkspace: (name: string, slug: string, image?: string | null) => void;
};

export const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  currentWorkspace: null,
  workspaces: [],
  hydrate: (currentWorkspace, workspaces) =>
    set({ currentWorkspace, workspaces }),
  updateWorkspace: (name, slug, image) =>
    set((state) => ({
      currentWorkspace: state.currentWorkspace
        ? {
            ...state.currentWorkspace,
            name,
            slug,
            ...(image !== undefined && { image }),
          }
        : null,
      workspaces: state.workspaces.map((w) =>
        w.slug === state.currentWorkspace?.slug
          ? { ...w, name, slug, ...(image !== undefined && { image }) }
          : w,
      ),
    })),
}));
