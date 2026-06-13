import { useRef, useEffect, useCallback, useState } from 'react';
import { useDesignStore } from '@/store/useDesignStore';
import { useCanvasStore } from '@/store/useCanvasStore';

const MINIMAP_WIDTH = 120;
const MINIMAP_HEIGHT = 80;
const BUILDING_COLOR = '#00F0FF';
const VIEWPORT_COLOR = '#FF2E97';
const SELECTED_COLOR = '#FFE600';

export default function CanvasOverlay() {
  const buildingCount = useDesignStore((s) => s.buildings.length);
  const zoom = useCanvasStore((s) => s.zoom);
  const canvasWidth = useCanvasStore((s) => s.canvasWidth);
  const canvasHeight = useCanvasStore((s) => s.canvasHeight);
  const panX = useCanvasStore((s) => s.panX);
  const panY = useCanvasStore((s) => s.panY);
  const groundY = useCanvasStore((s) => s.groundY);
  const setPan = useCanvasStore((s) => s.setPan);
  const buildings = useDesignStore((s) => s.buildings);
  const selectedBuildingId = useDesignStore((s) => s.selectedBuildingId);

  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDraggingViewport, setIsDraggingViewport] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPanRef = useRef({ x: 0, y: 0 });

  const getWorldBounds = useCallback(() => {
    if (buildings.length === 0) {
      return { minX: 0, minY: 0, maxX: canvasWidth, maxY: canvasHeight };
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const b of buildings) {
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    }
    const padding = 100;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    return { minX, minY, maxX, maxY };
  }, [buildings, canvasWidth, canvasHeight]);

  const worldToMinimap = useCallback(
    (wx: number, wy: number) => {
      const bounds = getWorldBounds();
      const worldW = bounds.maxX - bounds.minX;
      const worldH = bounds.maxY - bounds.minY;
      const scaleX = MINIMAP_WIDTH / worldW;
      const scaleY = MINIMAP_HEIGHT / worldH;
      const scale = Math.min(scaleX, scaleY);
      const offsetX = (MINIMAP_WIDTH - worldW * scale) / 2;
      const offsetY = (MINIMAP_HEIGHT - worldH * scale) / 2;
      return {
        x: (wx - bounds.minX) * scale + offsetX,
        y: (wy - bounds.minY) * scale + offsetY,
        scale,
      };
    },
    [getWorldBounds]
  );

  const minimapToWorld = useCallback(
    (mx: number, my: number) => {
      const bounds = getWorldBounds();
      const worldW = bounds.maxX - bounds.minX;
      const worldH = bounds.maxY - bounds.minY;
      const scaleX = MINIMAP_WIDTH / worldW;
      const scaleY = MINIMAP_HEIGHT / worldH;
      const scale = Math.min(scaleX, scaleY);
      const offsetX = (MINIMAP_WIDTH - worldW * scale) / 2;
      const offsetY = (MINIMAP_HEIGHT - worldH * scale) / 2;
      return {
        x: (mx - offsetX) / scale + bounds.minX,
        y: (my - offsetY) / scale + bounds.minY,
      };
    },
    [getWorldBounds]
  );

  const getViewportRect = useCallback(() => {
    const yOffset = groundY - 500;
    const worldLeft = (0 - panX) / zoom;
    const worldTop = (0 - panY) / zoom - yOffset;
    const worldRight = (canvasWidth - panX) / zoom;
    const worldBottom = (canvasHeight - panY) / zoom - yOffset;

    const topLeft = worldToMinimap(worldLeft, worldTop);
    const bottomRight = worldToMinimap(worldRight, worldBottom);

    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    };
  }, [panX, panY, zoom, canvasWidth, canvasHeight, groundY, worldToMinimap]);

  const renderMinimap = useCallback(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = MINIMAP_WIDTH * dpr;
    canvas.height = MINIMAP_HEIGHT * dpr;
    canvas.style.width = `${MINIMAP_WIDTH}px`;
    canvas.style.height = `${MINIMAP_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    ctx.fillStyle = '#0A0A14';
    ctx.fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    for (const building of buildings) {
      const topLeft = worldToMinimap(building.x, building.y);
      const bottomRight = worldToMinimap(building.x + building.width, building.y + building.height);
      const w = bottomRight.x - topLeft.x;
      const h = bottomRight.y - topLeft.y;

      const isSelected = building.id === selectedBuildingId;
      ctx.fillStyle = isSelected ? SELECTED_COLOR : BUILDING_COLOR;
      ctx.globalAlpha = isSelected ? 0.8 : 0.4;
      ctx.fillRect(topLeft.x, topLeft.y, Math.max(w, 1), Math.max(h, 1));

      ctx.strokeStyle = isSelected ? SELECTED_COLOR : BUILDING_COLOR;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(topLeft.x, topLeft.y, Math.max(w, 1), Math.max(h, 1));
    }

    ctx.globalAlpha = 1;
    const viewport = getViewportRect();
    ctx.strokeStyle = VIEWPORT_COLOR;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 46, 151, 0.1)';
    ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, MINIMAP_WIDTH - 1, MINIMAP_HEIGHT - 1);
  }, [buildings, selectedBuildingId, worldToMinimap, getViewportRect]);

  useEffect(() => {
    renderMinimap();
  }, [renderMinimap]);

  const centerOnMinimapPoint = useCallback(
    (mx: number, my: number) => {
      const world = minimapToWorld(mx, my);
      const yOffset = groundY - 500;
      const newPanX = -world.x * zoom + canvasWidth / 2;
      const newPanY = -(world.y + yOffset) * zoom + canvasHeight / 2;
      setPan(newPanX, newPanY);
    },
    [minimapToWorld, zoom, canvasWidth, canvasHeight, groundY, setPan]
  );

  const handleMinimapMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = minimapCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const viewport = getViewportRect();
      const isInViewport =
        mx >= viewport.x &&
        mx <= viewport.x + viewport.width &&
        my >= viewport.y &&
        my <= viewport.y + viewport.height;

      if (isInViewport) {
        setIsDraggingViewport(true);
        dragStartRef.current = { x: mx, y: my };
        initialPanRef.current = { x: panX, y: panY };
      } else {
        centerOnMinimapPoint(mx, my);
      }
    },
    [getViewportRect, panX, panY, centerOnMinimapPoint]
  );

  const handleMinimapMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDraggingViewport) return;
      const canvas = minimapCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const dx = mx - dragStartRef.current.x;
      const dy = my - dragStartRef.current.y;

      const bounds = getWorldBounds();
      const worldW = bounds.maxX - bounds.minX;
      const worldH = bounds.maxY - bounds.minY;
      const scaleX = MINIMAP_WIDTH / worldW;
      const scaleY = MINIMAP_HEIGHT / worldH;
      const scale = Math.min(scaleX, scaleY);

      const worldDx = -dx / scale;
      const worldDy = -dy / scale;

      setPan(
        initialPanRef.current.x + worldDx * zoom,
        initialPanRef.current.y + worldDy * zoom
      );
    },
    [isDraggingViewport, getWorldBounds, zoom, setPan]
  );

  const handleMinimapMouseUp = useCallback(() => {
    setIsDraggingViewport(false);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute top-3 left-3 flex flex-col gap-1.5"
        style={{
          backgroundColor: 'rgba(10, 10, 20, 0.7)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          borderRadius: 6,
          padding: '8px 12px',
        }}
      >
        <div
          className="text-xs font-semibold tracking-wide"
          style={{
            color: '#00F0FF',
            textShadow: '0 0 6px rgba(0, 240, 255, 0.4)',
            fontFamily: 'Rajdhani, sans-serif',
          }}
        >
          缩放: {Math.round(zoom * 100)}%
        </div>
        <div
          className="text-xs font-semibold tracking-wide"
          style={{
            color: '#FF2E97',
            textShadow: '0 0 6px rgba(255, 46, 151, 0.4)',
            fontFamily: 'Rajdhani, sans-serif',
          }}
        >
          建筑: {buildingCount}
        </div>
      </div>

      <div
        className="absolute bottom-3 left-3"
        style={{
          backgroundColor: 'rgba(10, 10, 20, 0.6)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(0, 240, 255, 0.1)',
          borderRadius: 6,
          padding: '6px 10px',
        }}
      >
        <span
          className="text-xs"
          style={{
            color: 'rgba(0, 240, 255, 0.5)',
            fontFamily: 'Rajdhani, sans-serif',
          }}
        >
          按住中键拖拽平移 · Ctrl+C/V 复制粘贴
        </span>
      </div>

      <div
        className="absolute bottom-3 right-3 pointer-events-auto"
        style={{
          width: MINIMAP_WIDTH,
          height: MINIMAP_HEIGHT,
          backgroundColor: 'rgba(10, 10, 20, 0.7)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          borderRadius: 6,
          overflow: 'hidden',
          cursor: isDraggingViewport ? 'grabbing' : 'pointer',
        }}
      >
        <canvas
          ref={minimapCanvasRef}
          onMouseDown={handleMinimapMouseDown}
          onMouseMove={handleMinimapMouseMove}
          onMouseUp={handleMinimapMouseUp}
          onMouseLeave={handleMinimapMouseUp}
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
}
