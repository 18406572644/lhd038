import { create } from 'zustand';
import { Building, LightConfig, UserDesign, BuildingGroup, LightGroup } from '@/types';
import { useUndoStore, DesignSnapshot } from '@/store/useUndoStore';

interface ClipboardData {
  building: Building;
  lights: LightConfig[];
}

interface GroupClipboardData {
  group: BuildingGroup;
  buildings: Building[];
  lights: LightConfig[];
}

type ClipboardItem = ClipboardData | GroupClipboardData;

function takeSnapshot(state: {
  buildings: Building[];
  groups: BuildingGroup[];
  lights: LightConfig[];
  lightGroups: LightGroup[];
}): DesignSnapshot {
  return {
    buildings: JSON.parse(JSON.stringify(state.buildings)),
    groups: JSON.parse(JSON.stringify(state.groups)),
    lights: JSON.parse(JSON.stringify(state.lights)),
    lightGroups: JSON.parse(JSON.stringify(state.lightGroups)),
  };
}

interface DesignState {
  designId: string;
  designName: string;
  buildings: Building[];
  groups: BuildingGroup[];
  lights: LightConfig[];
  lightGroups: LightGroup[];
  selectedBuildingId: string | null;
  selectedBuildingIds: string[];
  selectedGroupId: string | null;
  selectedLightId: string | null;
  selectedLightGroupId: string | null;
  activeGroupId: string | null;
  isDirty: boolean;
  clipboard: ClipboardItem | null;

  setDesignName: (name: string) => void;
  addBuilding: (building: Building) => void;
  updateBuilding: (id: string, updates: Partial<Building>) => void;
  removeBuilding: (id: string) => void;
  selectBuilding: (id: string | null) => void;
  selectBuildings: (ids: string[]) => void;
  toggleBuildingSelection: (id: string) => void;
  clearSelection: () => void;
  addGroup: (group: BuildingGroup) => void;
  updateGroup: (id: string, updates: Partial<BuildingGroup>) => void;
  removeGroup: (id: string) => void;
  selectGroup: (id: string | null) => void;
  createGroup: (buildingIds: string[], name?: string) => string;
  ungroup: (groupId: string) => void;
  enterGroupEditMode: (groupId: string) => void;
  exitGroupEditMode: () => void;
  moveGroup: (groupId: string, deltaX: number, deltaY: number) => void;
  scaleGroup: (groupId: string, scale: number) => void;
  applyLightConfigToGroup: (groupId: string, config: Partial<LightConfig>) => void;
  addLight: (light: LightConfig) => void;
  updateLight: (id: string, updates: Partial<LightConfig>) => void;
  removeLight: (id: string) => void;
  selectLight: (id: string | null) => void;
  addLightGroup: (group: LightGroup) => void;
  updateLightGroup: (id: string, updates: Partial<LightGroup>) => void;
  removeLightGroup: (id: string) => void;
  selectLightGroup: (id: string | null) => void;
  reorderBuildingIdsInLightGroup: (groupId: string, buildingIds: string[]) => void;
  loadDesign: (design: UserDesign) => void;
  newDesign: () => void;
  markClean: () => void;
  copyBuilding: (id: string) => void;
  pasteBuilding: () => void;
  getBuildingGroup: (buildingId: string) => BuildingGroup | undefined;
  getGroupBuildings: (groupId: string) => Building[];
  undo: () => void;
  redo: () => void;
}

export const useDesignStore = create<DesignState>((set, get) => ({
  designId: crypto.randomUUID(),
  designName: '',
  buildings: [],
  groups: [],
  lights: [],
  lightGroups: [],
  selectedBuildingId: null,
  selectedBuildingIds: [],
  selectedGroupId: null,
  selectedLightId: null,
  selectedLightGroupId: null,
  activeGroupId: null,
  isDirty: false,
  clipboard: null,

  setDesignName: (name) => set({ designName: name, isDirty: true }),

  addBuilding: (building) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      return { buildings: [...state.buildings, building], isDirty: true };
    }),

  updateBuilding: (id, updates) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      return {
        buildings: state.buildings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        isDirty: true,
      };
    }),

  removeBuilding: (id) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      const building = state.buildings.find((b) => b.id === id);
      let updatedGroups = state.groups;
      if (building?.groupId) {
        updatedGroups = state.groups.map((g) =>
          g.id === building.groupId
            ? { ...g, childBuildingIds: g.childBuildingIds.filter((cid) => cid !== id) }
            : g
        );
      }
      return {
        buildings: state.buildings.filter((b) => b.id !== id),
        groups: updatedGroups,
        lights: state.lights.filter((l) => l.buildingId !== id),
        selectedBuildingId: state.selectedBuildingId === id ? null : state.selectedBuildingId,
        selectedBuildingIds: state.selectedBuildingIds.filter((bid) => bid !== id),
        isDirty: true,
      };
    }),

  selectBuilding: (id) => set({ selectedBuildingId: id, selectedGroupId: null }),

  selectBuildings: (ids) =>
    set({ selectedBuildingIds: ids, selectedBuildingId: ids[0] || null, selectedGroupId: null }),

  toggleBuildingSelection: (id) =>
    set((state) => {
      const isSelected = state.selectedBuildingIds.includes(id);
      const newIds = isSelected
        ? state.selectedBuildingIds.filter((bid) => bid !== id)
        : [...state.selectedBuildingIds, id];
      return {
        selectedBuildingIds: newIds,
        selectedBuildingId: newIds[0] || state.selectedBuildingId,
        selectedGroupId: null,
      };
    }),

  clearSelection: () =>
    set({
      selectedBuildingId: null,
      selectedBuildingIds: [],
      selectedGroupId: null,
      selectedLightId: null,
      selectedLightGroupId: null,
    }),

  addGroup: (group) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      return { groups: [...state.groups, group], isDirty: true };
    }),

  updateGroup: (id, updates) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      return {
        groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        isDirty: true,
      };
    }),

  removeGroup: (id) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      return {
        groups: state.groups.filter((g) => g.id !== id),
        buildings: state.buildings.map((b) =>
          b.groupId === id ? { ...b, groupId: undefined } : b
        ),
        selectedGroupId: state.selectedGroupId === id ? null : state.selectedGroupId,
        activeGroupId: state.activeGroupId === id ? null : state.activeGroupId,
        isDirty: true,
      };
    }),

  selectGroup: (id) =>
    set({
      selectedGroupId: id,
      selectedBuildingId: null,
      selectedBuildingIds: [],
    }),

  createGroup: (buildingIds, name) => {
    const { buildings } = get();
    const validIds = buildingIds.filter((id) => buildings.some((b) => b.id === id));
    if (validIds.length < 2) return '';

    const state = get();
    useUndoStore.getState().pushSnapshot(takeSnapshot(state));

    const groupBuildings = buildings.filter((b) => validIds.includes(b.id));
    const minX = Math.min(...groupBuildings.map((b) => b.x));
    const maxX = Math.max(...groupBuildings.map((b) => b.x + b.width));
    const minY = Math.min(...groupBuildings.map((b) => b.y));
    const maxY = Math.max(...groupBuildings.map((b) => b.y + b.height));

    const group: BuildingGroup = {
      id: crypto.randomUUID(),
      name: name || `组 ${get().groups.length + 1}`,
      childBuildingIds: validIds,
      pivotX: (minX + maxX) / 2,
      pivotY: (minY + maxY) / 2,
      locked: false,
    };

    set((s) => ({
      groups: [...s.groups, group],
      buildings: s.buildings.map((b) =>
        validIds.includes(b.id) ? { ...b, groupId: group.id } : b
      ),
      selectedGroupId: group.id,
      selectedBuildingId: null,
      selectedBuildingIds: [],
      isDirty: true,
    }));

    return group.id;
  },

  ungroup: (groupId) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group) return;

    const state = get();
    useUndoStore.getState().pushSnapshot(takeSnapshot(state));

    set((s) => ({
      groups: s.groups.filter((g) => g.id !== groupId),
      buildings: s.buildings.map((b) =>
        b.groupId === groupId ? { ...b, groupId: undefined } : b
      ),
      selectedBuildingIds: group.childBuildingIds,
      selectedBuildingId: group.childBuildingIds[0] || null,
      selectedGroupId: null,
      activeGroupId: s.activeGroupId === groupId ? null : s.activeGroupId,
      isDirty: true,
    }));
  },

  enterGroupEditMode: (groupId) =>
    set({
      activeGroupId: groupId,
      selectedGroupId: null,
      selectedBuildingId: null,
      selectedBuildingIds: [],
    }),

  exitGroupEditMode: () => set({ activeGroupId: null }),

  moveGroup: (groupId, deltaX, deltaY) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group || group.locked) return;

    const state = get();
    useUndoStore.getState().pushSnapshot(takeSnapshot(state));

    set((s) => ({
      buildings: s.buildings.map((b) =>
        b.groupId === groupId
          ? { ...b, x: b.x + deltaX, y: b.y + deltaY }
          : b
      ),
      groups: s.groups.map((g) =>
        g.id === groupId
          ? { ...g, pivotX: g.pivotX + deltaX, pivotY: g.pivotY + deltaY }
          : g
      ),
      isDirty: true,
    }));
  },

  scaleGroup: (groupId, scale) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group || group.locked) return;

    const state = get();
    useUndoStore.getState().pushSnapshot(takeSnapshot(state));

    set((s) => ({
      buildings: s.buildings.map((b) => {
        if (b.groupId !== groupId) return b;
        const relX = b.x - group.pivotX;
        const relY = b.y - group.pivotY;
        const newX = group.pivotX + relX * scale;
        const newY = group.pivotY + relY * scale;
        const newWidth = b.width * scale;
        const newHeight = b.height * scale;
        return { ...b, x: newX, y: newY, width: newWidth, height: newHeight };
      }),
      isDirty: true,
    }));
  },

  applyLightConfigToGroup: (groupId, config) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group) return;

    const state = get();
    useUndoStore.getState().pushSnapshot(takeSnapshot(state));

    set((s) => {
      const updatedLights = s.lights.map((l) =>
        group.childBuildingIds.includes(l.buildingId) ? { ...l, ...config } : l
      );

      const existingBuildingIds = s.lights.map((l) => l.buildingId);
      const newLights = group.childBuildingIds
        .filter((bid) => !existingBuildingIds.includes(bid))
        .map((bid) => ({
          id: crypto.randomUUID(),
          buildingId: bid,
          color: config.color || '#FF2E97',
          animation: config.animation || 'breathe',
          speed: config.speed ?? 1,
          intensity: config.intensity ?? 0.8,
          delay: config.delay ?? 0,
        }));

      return {
        lights: [...updatedLights, ...newLights],
        isDirty: true,
      };
    });
  },

  addLight: (light) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      return { lights: [...state.lights, light], isDirty: true };
    }),

  updateLight: (id, updates) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      return {
        lights: state.lights.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        isDirty: true,
      };
    }),

  removeLight: (id) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      return {
        lights: state.lights.filter((l) => l.id !== id),
        selectedLightId: state.selectedLightId === id ? null : state.selectedLightId,
        isDirty: true,
      };
    }),

  selectLight: (id) => set({ selectedLightId: id }),

  addLightGroup: (group) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      return { lightGroups: [...state.lightGroups, group], isDirty: true };
    }),

  updateLightGroup: (id, updates) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      return {
        lightGroups: state.lightGroups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        isDirty: true,
      };
    }),

  removeLightGroup: (id) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      return {
        lightGroups: state.lightGroups.filter((g) => g.id !== id),
        selectedLightGroupId: state.selectedLightGroupId === id ? null : state.selectedLightGroupId,
        isDirty: true,
      };
    }),

  selectLightGroup: (id) => set({ selectedLightGroupId: id }),

  reorderBuildingIdsInLightGroup: (groupId, buildingIds) =>
    set((state) => {
      useUndoStore.getState().pushSnapshot(takeSnapshot(state));
      return {
        lightGroups: state.lightGroups.map((g) =>
          g.id === groupId ? { ...g, buildingIds } : g
        ),
        isDirty: true,
      };
    }),

  loadDesign: (design) => {
    useUndoStore.getState().clear();
    set({
      designId: design.id,
      designName: design.name,
      buildings: design.buildings,
      groups: design.groups || [],
      lights: design.lights,
      lightGroups: design.lightGroups || [],
      selectedBuildingId: null,
      selectedBuildingIds: [],
      selectedGroupId: null,
      selectedLightId: null,
      selectedLightGroupId: null,
      activeGroupId: null,
      isDirty: false,
    });
  },

  newDesign: () => {
    useUndoStore.getState().clear();
    set({
      designId: Date.now().toString(36),
      designName: '',
      buildings: [],
      groups: [],
      lights: [],
      lightGroups: [],
      selectedBuildingId: null,
      selectedBuildingIds: [],
      selectedGroupId: null,
      selectedLightId: null,
      selectedLightGroupId: null,
      activeGroupId: null,
      isDirty: false,
    });
  },

  markClean: () => set({ isDirty: false }),

  copyBuilding: (id) => {
    const { buildings, lights, selectedGroupId, groups } = get();

    if (selectedGroupId) {
      const group = groups.find((g) => g.id === selectedGroupId);
      if (group) {
        const groupBuildings = buildings.filter((b) => group.childBuildingIds.includes(b.id));
        const groupLights = lights.filter((l) =>
          group.childBuildingIds.includes(l.buildingId)
        );
        set({
          clipboard: { group, buildings: groupBuildings, lights: groupLights },
        });
        return;
      }
    }

    const building = buildings.find((b) => b.id === id);
    if (!building) return;
    const buildingLights = lights.filter((l) => l.buildingId === id);
    set({ clipboard: { building, lights: buildingLights } });
  },

  pasteBuilding: () => {
    const { clipboard } = get();
    if (!clipboard) return;

    const state = get();
    useUndoStore.getState().pushSnapshot(takeSnapshot(state));

    if ('group' in clipboard) {
      const PASTE_OFFSET = 40;
      const newGroupId = crypto.randomUUID();

      const idMap = new Map<string, string>();
      const newBuildings: Building[] = clipboard.buildings.map((b) => {
        const newId = crypto.randomUUID();
        idMap.set(b.id, newId);
        return {
          ...b,
          id: newId,
          groupId: newGroupId,
          x: b.x + PASTE_OFFSET,
          y: b.y + PASTE_OFFSET,
        };
      });

      const newGroup: BuildingGroup = {
        ...clipboard.group,
        id: newGroupId,
        childBuildingIds: newBuildings.map((b) => b.id),
        pivotX: clipboard.group.pivotX + PASTE_OFFSET,
        pivotY: clipboard.group.pivotY + PASTE_OFFSET,
        name: `${clipboard.group.name} (副本)`,
      };

      const newLights: LightConfig[] = clipboard.lights.map((l) => ({
        ...l,
        id: crypto.randomUUID(),
        buildingId: idMap.get(l.buildingId) || l.buildingId,
      }));

      set((s) => ({
        buildings: [...s.buildings, ...newBuildings],
        groups: [...s.groups, newGroup],
        lights: [...s.lights, ...newLights],
        selectedGroupId: newGroupId,
        isDirty: true,
      }));
    } else {
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

      set((s) => ({
        buildings: [...s.buildings, newBuilding],
        lights: [...s.lights, ...newLights],
        selectedBuildingId: newBuildingId,
        isDirty: true,
      }));
    }
  },

  getBuildingGroup: (buildingId) => {
    const building = get().buildings.find((b) => b.id === buildingId);
    if (!building?.groupId) return undefined;
    return get().groups.find((g) => g.id === building.groupId);
  },

  getGroupBuildings: (groupId) => {
    return get().buildings.filter((b) => b.groupId === groupId);
  },

  undo: () => {
    const snapshot = useUndoStore.getState().undo();
    if (!snapshot) return;
    set({
      buildings: snapshot.buildings,
      groups: snapshot.groups,
      lights: snapshot.lights,
      lightGroups: snapshot.lightGroups,
      isDirty: true,
    });
  },

  redo: () => {
    const snapshot = useUndoStore.getState().redo();
    if (!snapshot) return;
    set({
      buildings: snapshot.buildings,
      groups: snapshot.groups,
      lights: snapshot.lights,
      lightGroups: snapshot.lightGroups,
      isDirty: true,
    });
  },
}));
