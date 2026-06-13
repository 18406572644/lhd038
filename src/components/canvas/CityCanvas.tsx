import { useRef, useEffect, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { Copy } from 'lucide-react';
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer';
import { useAnimation } from '@/hooks/useAnimation';
import { useDesignStore } from '@/store/useDesignStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { isPointInBuilding, snapToGrid } from '@/utils/canvas';
import { NEON_PINK, ELECTRIC_BLUE } from '@/utils/colors';
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
  const copyBuilding = useDesignStore((s) => s.copyBuilding);
  const pasteBuilding = useDesignStore((s) => s.pasteBuilding);
  const clipboard = useDesignStore((s) => s.clipboard);
  const zoom = useCanvasStore((s) => s.zoom);
  const panX = useCanvasStore((s) => s.panX);
  const panY = useCanvasStore((s) => s.panY);
  const groundY = useCanvasStore((s) => s.groundY);
  const setZoom = useCanvasStore((s) => s.setZoom);
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
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedBuildingId) {
          copyBuilding(selectedBuildingId);
          notifications.show({
            title: '已复制',
            message: '建筑已复制到剪贴板',
            color: 'cyan',
            autoClose: 2000,
            icon: <Copy size={16} />,
            styles: {
              root: {
                backgroundColor: '#0A0A14',
                borderColor: ELECTRIC_BLUE,
              },
              title: {
                color: ELECTRIC_BLUE,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 600,
              },
              description: {
                color: '#B0B0C0',
              },
            },
          });
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (clipboard) {
          pasteBuilding();
          notifications.show({
            title: '已粘贴',
            message: '建筑粘贴成功',
            color: 'pink',
            autoClose: 2000,
            styles: {
              root: {
                backgroundColor: '#0A0A14',
                borderColor: NEON_PINK,
              },
              title: {
                color: NEON_PINK,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 600,
              },
              description: {
                color: '#B0B0C0',
              },
            },
          });
        } else {
          notifications.show({
            title: '无法粘贴',
            message: '剪贴板为空，请先复制建筑',
            color: 'yellow',
            autoClose: 2000,
            styles: {
              root: {
                backgroundColor: '#0A0A14',
              },
              title: {
                color: '#FFE600',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 600,
              },
              description: {
                color: '#B0B0C0',
              },
            },
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBuildingId, clipboard, copyBuilding, pasteBuilding]);

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
