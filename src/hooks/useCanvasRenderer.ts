import { useRef, useCallback, useEffect } from 'react';
import { useDesignStore } from '@/store/useDesignStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import {
  drawGrid,
  drawSkyGradient,
  drawStars,
  drawBuilding,
  drawGroundLine,
  getRainbowColor,
} from '@/utils/canvas';

export function useCanvasRenderer(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const frameIdRef = useRef<number>(0);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { buildings, lights, selectedBuildingId } = useDesignStore.getState();
    const { zoom, panX, panY, canvasWidth, canvasHeight, groundY } = useCanvasStore.getState();
    const { currentTime } = useTimelineStore.getState();

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);
    ctx.translate(0, groundY - 500);

    drawSkyGradient(ctx, canvasWidth, canvasHeight);
    drawStars(ctx, canvasWidth, canvasHeight);
    drawGrid(ctx, canvasWidth, canvasHeight);

    for (const building of buildings) {
      const light = lights.find((l) => l.buildingId === building.id);
      const isSelected = building.id === selectedBuildingId;
      const lightColor =
        light && light.animation === 'rainbow'
          ? getRainbowColor(currentTime, light.speed, light.delay)
          : light?.color ?? '#FF2E97';

      drawBuilding(
        ctx,
        building,
        isSelected,
        currentTime,
        lightColor,
        light?.intensity ?? 0.8,
        light?.animation ?? 'breathe',
        light?.speed ?? 1,
        light?.delay ?? 0
      );
    }

    drawGroundLine(ctx, canvasWidth, canvasHeight, 500);

    ctx.restore();

    frameIdRef.current = requestAnimationFrame(render);
  }, [canvasRef]);

  const startRendering = useCallback(() => {
    stopRendering();
    frameIdRef.current = requestAnimationFrame(render);
  }, [render]);

  const stopRendering = useCallback(() => {
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = 0;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRendering();
    };
  }, [stopRendering]);

  return { startRendering, stopRendering };
}
