import { create } from 'zustand';
import { Building, BuildingGroup, LightConfig, LightGroup } from '@/types';

const MAX_HISTORY = 50;

export interface DesignSnapshot {
  buildings: Building[];
  groups: BuildingGroup[];
  lights: LightConfig[];
  lightGroups: LightGroup[];
}

interface UndoState {
  past: DesignSnapshot[];
  future: DesignSnapshot[];
  undoCount: number;
  redoCount: number;

  pushSnapshot: (snapshot: DesignSnapshot) => void;
  undo: () => DesignSnapshot | null;
  redo: () => DesignSnapshot | null;
  clear: () => void;
}

export const useUndoStore = create<UndoState>((set, get) => ({
  past: [],
  future: [],
  undoCount: 0,
  redoCount: 0,

  pushSnapshot: (snapshot) => {
    set((state) => {
      const newPast = [...state.past, snapshot];
      if (newPast.length > MAX_HISTORY) {
        newPast.shift();
      }
      return {
        past: newPast,
        future: [],
        undoCount: Math.min(newPast.length, MAX_HISTORY),
        redoCount: 0,
      };
    });
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return null;
    const newPast = [...past];
    const snapshot = newPast.pop()!;
    return (() => {
      set({
        past: newPast,
        future: [snapshot, ...future],
        undoCount: newPast.length,
        redoCount: future.length + 1,
      });
      return snapshot;
    })();
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return null;
    const newFuture = [...future];
    const snapshot = newFuture.shift()!;
    set({
      past: [...past, snapshot],
      future: newFuture,
      undoCount: past.length + 1,
      redoCount: newFuture.length,
    });
    return snapshot;
  },

  clear: () =>
    set({
      past: [],
      future: [],
      undoCount: 0,
      redoCount: 0,
    }),
}));
