import { useRef, useEffect, useCallback } from 'react';
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer';
import { useAnimation } from '@/hooks/useAnimation';
import { useDesignStore } from '@/store/useDesignStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { isPointInBuilding, snapToGrid } from '@/utils/canvas';
import CanvasOverlay from './CanvasOverlay';

export default function CityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { startRendering, stopRendering } = useCanvasRenderer(canvasRef);
  const { startPlayback, stopPlayback } = useAnimation();

  const buildings = useDesignStore((s) => s.buildings);
  const selectedBuildingId = useDesignStore((s) => s.selectedBuildingId);
  const selectBuilding = useDesignStore((s) => s.selectBuilding);
  const updateBuilding = useDesignStore((s) => s.updateBuilding);
  const zoom = useCanvasStore((s) => s.zoom);
  const panX = useCanvasStore((s) => s.panX);
  const panY = useCanvasStore((s) => s.panY);
  const groundY = useCanvasStore((s) => s.groundY);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const setPan = useCanvasStore((s) => s.setPan);
  const setCanvasSize = useCanvasStore((s) => s.setCanvasSize);
  const startDrag = useCanvasStore((s) => s.startDrag);
  const updateDrag = useCanvasStore((s) => s.updateDrag);
  const endDrag = useCanvasStore((s) => s.endDrag);
  const isDragging = useCanvasStore((s) => s.isDragging);
  const dragTarget = useCanvasStore((s) => s.dragTarget);

  const dragBuildingOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    startRendering();
    return () => {
      stopRendering();
      stopPlayback();
    };
  }, [startRendering, stopRendering, startPlayback, stopPlayback]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.scale(dpr, dpr);
        }
        setCanvasSize(width, height);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [setCanvasSize]);

  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { cx: 0, cy: 0 };
      const rect = canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      return {
        cx: (sx - panX) / zoom,
        cy: (sy - panY) / zoom - (groundY - 500),
      };
    },
    [panX, panY, zoom, groundY]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.button === 1) {
        e.preventDefault();
        startDrag('canvas', e.clientX, e.clientY);
        return;
      }

      if (e.button !== 0) return;

      const { cx, cy } = screenToCanvas(e.clientX, e.clientY);

      let clickedBuilding: string | null = null;
      for (let i = buildings.length - 1; i >= 0; i--) {
        if (isPointInBuilding(cx, cy, buildings[i])) {
          clickedBuilding = buildings[i].id;
          dragBuildingOffsetRef.current = {
            x: cx - buildings[i].x,
            y: cy - buildings[i].y,
          };
          break;
        }
      }

      if (clickedBuilding) {
        selectBuilding(clickedBuilding);
        startDrag('building', e.clientX, e.clientY);
      } else {
        selectBuilding(null);
        startDrag('canvas', e.clientX, e.clientY);
      }
    },
    [buildings, screenToCanvas, selectBuilding, startDrag]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;

      if (dragTarget === 'canvas') {
        updateDrag(e.clientX, e.clientY);
      } else if (dragTarget === 'building' && selectedBuildingId) {
        const { cx, cy } = screenToCanvas(e.clientX, e.clientY);
        const newX = snapToGrid(cx - dragBuildingOffsetRef.current.x);
        const newY = snapToGrid(cy - dragBuildingOffsetRef.current.y);
        updateBuilding(selectedBuildingId, { x: newX, y: newY });
      }
    },
    [isDragging, dragTarget, selectedBuildingId, screenToCanvas, updateDrag, updateBuilding]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      endDrag();
    }
  }, [isDragging, endDrag]);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * delta, 0.2), 5);
      setZoom(newZoom);
    },
    [zoom, setZoom]
  );

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        data-city-canvas="true"
        className="block w-full h-full"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0, 240, 255, 0.05), 0 0 1px rgba(0, 240, 255, 0.3)',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />
      <CanvasOverlay />
    </div>
  );
}
