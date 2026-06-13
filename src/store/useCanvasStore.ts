import { create } from 'zustand';

interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  canvasWidth: number;
  canvasHeight: number;
  groundY: number;
  isDragging: boolean;
  dragTarget: 'building' | 'canvas' | null;
  dragStartX: number;
  dragStartY: number;

  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setCanvasSize: (width: number, height: number) => void;
  startDrag: (target: 'building' | 'canvas', x: number, y: number) => void;
  updateDrag: (x: number, y: number) => void;
  endDrag: () => void;
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

  setZoom: (zoom) => set({ zoom }),

  setPan: (x, y) => set({ panX: x, panY: y }),

  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height, groundY: height * 0.92 }),

  startDrag: (target, x, y) =>
    set({ isDragging: true, dragTarget: target, dragStartX: x, dragStartY: y }),

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
    set({ isDragging: false, dragTarget: null, dragStartX: 0, dragStartY: 0 }),

  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),
}));
