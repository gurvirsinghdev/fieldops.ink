import { create } from "zustand";

export type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

type UserStore = {
  user: User | null;
  hydrate: (user: User) => void;
};

export const useUserStore = create<UserStore>()((set) => ({
  user: null,
  hydrate: (user) => set({ user }),
}));
