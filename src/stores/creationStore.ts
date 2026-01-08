import { create } from 'zustand';
import type { Database } from '@/integrations/supabase/types';

type Creation = Database['public']['Tables']['creations']['Row'];

interface CreationState {
  creations: Creation[];
  currentCreation: Creation | null;
  setCreations: (creations: Creation[]) => void;
  addCreation: (creation: Creation) => void;
  updateCreation: (id: string, updates: Partial<Creation>) => void;
  deleteCreation: (id: string) => void;
  setCurrentCreation: (creation: Creation | null) => void;
}

export const useCreationStore = create<CreationState>((set) => ({
  creations: [],
  currentCreation: null,
  setCreations: (creations) => set({ creations }),
  addCreation: (creation) =>
    set((state) => ({ creations: [creation, ...state.creations] })),
  updateCreation: (id, updates) =>
    set((state) => ({
      creations: state.creations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
      currentCreation:
        state.currentCreation?.id === id
          ? { ...state.currentCreation, ...updates }
          : state.currentCreation,
    })),
  deleteCreation: (id) =>
    set((state) => ({
      creations: state.creations.filter((c) => c.id !== id),
      currentCreation:
        state.currentCreation?.id === id ? null : state.currentCreation,
    })),
  setCurrentCreation: (creation) => set({ currentCreation: creation }),
}));
