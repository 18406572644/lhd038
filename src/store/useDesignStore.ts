import { create } from 'zustand';
import { Building, LightConfig, UserDesign } from '@/types';

interface ClipboardData {
  building: Building;
  lights: LightConfig[];
}

interface DesignState {
  designId: string;
  designName: string;
  buildings: Building[];
  lights: LightConfig[];
  selectedBuildingId: string | null;
  selectedLightId: string | null;
  isDirty: boolean;
  clipboard: ClipboardData | null;

  setDesignName: (name: string) => void;
  addBuilding: (building: Building) => void;
  updateBuilding: (id: string, updates: Partial<Building>) => void;
  removeBuilding: (id: string) => void;
  selectBuilding: (id: string | null) => void;
  addLight: (light: LightConfig) => void;
  updateLight: (id: string, updates: Partial<LightConfig>) => void;
  removeLight: (id: string) => void;
  selectLight: (id: string | null) => void;
  loadDesign: (design: UserDesign) => void;
  newDesign: () => void;
  markClean: () => void;
  copyBuilding: (id: string) => void;
  pasteBuilding: () => void;
}

export const useDesignStore = create<DesignState>((set, get) => ({
  designId: crypto.randomUUID(),
  designName: '',
  buildings: [],
  lights: [],
  selectedBuildingId: null,
  selectedLightId: null,
  isDirty: false,
  clipboard: null,

  setDesignName: (name) => set({ designName: name, isDirty: true }),

  addBuilding: (building) =>
    set((state) => ({ buildings: [...state.buildings, building], isDirty: true })),

  updateBuilding: (id, updates) =>
    set((state) => ({
      buildings: state.buildings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      isDirty: true,
    })),

  removeBuilding: (id) =>
    set((state) => ({
      buildings: state.buildings.filter((b) => b.id !== id),
      lights: state.lights.filter((l) => l.buildingId !== id),
      selectedBuildingId: state.selectedBuildingId === id ? null : state.selectedBuildingId,
      isDirty: true,
    })),

  selectBuilding: (id) => set({ selectedBuildingId: id }),

  addLight: (light) =>
    set((state) => ({ lights: [...state.lights, light], isDirty: true })),

  updateLight: (id, updates) =>
    set((state) => ({
      lights: state.lights.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      isDirty: true,
    })),

  removeLight: (id) =>
    set((state) => ({
      lights: state.lights.filter((l) => l.id !== id),
      selectedLightId: state.selectedLightId === id ? null : state.selectedLightId,
      isDirty: true,
    })),

  selectLight: (id) => set({ selectedLightId: id }),

  loadDesign: (design) =>
    set({
      designId: design.id,
      designName: design.name,
      buildings: design.buildings,
      lights: design.lights,
      selectedBuildingId: null,
      selectedLightId: null,
      isDirty: false,
    }),

  newDesign: () =>
    set({
      designId: Date.now().toString(36),
      designName: '',
      buildings: [],
      lights: [],
      selectedBuildingId: null,
      selectedLightId: null,
      isDirty: false,
    }),

  markClean: () => set({ isDirty: false }),

  copyBuilding: (id) => {
    const { buildings, lights } = get();
    const building = buildings.find((b) => b.id === id);
    if (!building) return;
    const buildingLights = lights.filter((l) => l.buildingId === id);
    set({ clipboard: { building, lights: buildingLights } });
  },

  pasteBuilding: () => {
    const { clipboard } = get();
    if (!clipboard) return;

    const newBuildingId = crypto.randomUUID();
    const PASTE_OFFSET = 40;

    const newBuilding: Building = {
      ...clipboard.building,
      id: newBuildingId,
      x: clipboard.building.x + PASTE_OFFSET,
      y: clipboard.building.y + PASTE_OFFSET,
    };

    const newLights: LightConfig[] = clipboard.lights.map((light) => ({
      ...light,
      id: crypto.randomUUID(),
      buildingId: newBuildingId,
    }));

    set((state) => ({
      buildings: [...state.buildings, newBuilding],
      lights: [...state.lights, ...newLights],
      selectedBuildingId: newBuildingId,
      isDirty: true,
    }));
  },
}));
