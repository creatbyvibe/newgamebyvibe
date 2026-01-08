import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
