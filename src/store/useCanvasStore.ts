import { create } from 'zustand';

interface BoxSelection {
  active: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  canvasWidth: number;
  canvasHeight: number;
  groundY: number;
  isDragging: boolean;
  dragTarget: 'building' | 'group' | 'canvas' | 'selection' | null;
  dragStartX: number;
  dragStartY: number;
  dragBuildingId: string | null;
  dragGroupId: string | null;
  boxSelection: BoxSelection;
  lastClickTime: number;
  lastClickX: number;
  lastClickY: number;

  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setCanvasSize: (width: number, height: number) => void;
  startDrag: (
    target: 'building' | 'group' | 'canvas' | 'selection',
    x: number, y: number,
    buildingId?: string | null,
    groupId?: string | null
  ) => void;
  updateDrag: (x: number, y: number) => void;
  endDrag: () => void;
  startBoxSelection: (x: number, y: number) => void;
  updateBoxSelection: (x: number, y: number) => void;
  endBoxSelection: () => void;
  recordClick: (x: number, y: number) => boolean;
  resetView: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  canvasWidth: 0,
  canvasHeight: 0,
  groundY: 0,
  isDragging: false,
  dragTarget: null,
  dragStartX: 0,
  dragStartY: 0,
  dragBuildingId: null,
  dragGroupId: null,
  boxSelection: { active: false, startX: 0, startY: 0, endX: 0, endY: 0 },
  lastClickTime: 0,
  lastClickX: 0,
  lastClickY: 0,

  setZoom: (zoom) => set({ zoom }),

  setPan: (x, y) => set({ panX: x, panY: y }),

  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height, groundY: height * 0.92 }),

  startDrag: (target, x, y, buildingId = null, groupId = null) =>
    set({
      isDragging: true,
      dragTarget: target,
      dragStartX: x,
      dragStartY: y,
      dragBuildingId: buildingId,
      dragGroupId: groupId,
    }),

  updateDrag: (x, y) =>
    set((state) => {
      const deltaX = x - state.dragStartX;
      const deltaY = y - state.dragStartY;
      return {
        panX: state.panX + deltaX,
        panY: state.panY + deltaY,
        dragStartX: x,
        dragStartY: y,
      };
    }),

  endDrag: () =>
    set({
      isDragging: false,
      dragTarget: null,
      dragStartX: 0,
      dragStartY: 0,
      dragBuildingId: null,
      dragGroupId: null,
    }),

  startBoxSelection: (x, y) =>
    set({
      boxSelection: { active: true, startX: x, startY: y, endX: x, endY: y },
    }),

  updateBoxSelection: (x, y) =>
    set((state) => ({
      boxSelection: { ...state.boxSelection, endX: x, endY: y },
    })),

  endBoxSelection: () =>
    set({
      boxSelection: { active: false, startX: 0, startY: 0, endX: 0, endY: 0 },
    }),

  recordClick: (x, y) => {
    const now = Date.now();
    const lastTime = useCanvasStore.getState().lastClickTime;
    const lastX = useCanvasStore.getState().lastClickX;
    const lastY = useCanvasStore.getState().lastClickY;
    const isDoubleClick = now - lastTime < 300 && Math.abs(x - lastX) < 5 && Math.abs(y - lastY) < 5;
    set({ lastClickTime: now, lastClickX: x, lastClickY: y });
    return isDoubleClick;
  },

  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),
}));
