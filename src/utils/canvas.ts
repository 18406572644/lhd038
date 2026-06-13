import { Building, BuildingGroup, WindowPattern } from '@/types';
import { hexToRgb, withAlpha } from './colors';

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number = 20
) {
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

export function drawSkyGradient(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0A0A14');
  gradient.addColorStop(0.4, '#0F0A1E');
  gradient.addColorStop(0.7, '#1A0A2E');
  gradient.addColorStop(1, '#0A0A14');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number, seed: number = 42) {
  const rng = createRNG(seed);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let i = 0; i < 80; i++) {
    const x = rng() * width;
    const y = rng() * height * 0.5;
    const size = rng() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function drawBuilding(
  ctx: CanvasRenderingContext2D,
  building: Building,
  isSelected: boolean,
  time: number = 0,
  lightColor: string = '#FF2E97',
  lightIntensity: number = 0.8,
  lightAnimation: string = 'breathe',
  lightSpeed: number = 1,
  lightDelay: number = 0
) {
  const { x, y, width, height, type, windowDensity, windowPattern } = building;

  ctx.save();

  const bodyColor = type === 'tower' ? '#14141E' : '#1A1A28';
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = isSelected ? '#00F0FF' : 'rgba(0, 240, 255, 0.15)';
  ctx.lineWidth = isSelected ? 2 : 1;
  ctx.strokeRect(x, y, width, height);

  if (isSelected) {
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 12;
    ctx.strokeRect(x, y, width, height);
    ctx.shadowBlur = 0;
  }

  drawWindows(ctx, building, time, lightColor, lightIntensity, lightAnimation, lightSpeed, lightDelay);

  if (lightIntensity > 0) {
    const animValue = getAnimationValue(time, lightAnimation, lightSpeed, lightDelay);
    const glowAlpha = lightIntensity * animValue * 0.3;
    const rgb = hexToRgb(lightColor);
    ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${glowAlpha})`;
    ctx.shadowBlur = 20 + lightIntensity * 30 * animValue;
    ctx.fillStyle = 'transparent';
    ctx.fillRect(x, y, width, height);
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function drawWindows(
  ctx: CanvasRenderingContext2D,
  building: Building,
  time: number,
  lightColor: string,
  intensity: number,
  animation: string,
  speed: number,
  delay: number
) {
  const { x, y, width, height, windowDensity, windowPattern } = building;
  const winW = 4;
  const winH = 6;
  const gap = 10;
  const cols = Math.max(1, Math.floor((width - gap) / (winW + gap)));
  const rows = Math.max(1, Math.floor((height - gap) / (winH + gap)));
  const startX = x + (width - cols * (winW + gap) + gap) / 2;
  const startY = y + gap;

  const rng = createRNG(parseInt(building.id.replace(/\D/g, '') || '1'));
  const densityThreshold = windowDensity / 100;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = startX + c * (winW + gap);
      const wy = startY + r * (winH + gap);

      let shouldLight = false;
      if (windowPattern === 'grid') {
        shouldLight = (r + c) % 2 === 0 && rng() < densityThreshold + 0.3;
      } else if (windowPattern === 'random') {
        shouldLight = rng() < densityThreshold;
      } else if (windowPattern === 'strip') {
        shouldLight = r % 3 === 0 && rng() < densityThreshold + 0.2;
      }

      if (shouldLight && intensity > 0) {
        const animValue = getAnimationValue(
          time + (c * 0.1 + r * 0.05),
          animation,
          speed,
          delay + c * 0.05 + r * 0.02
        );
        const alpha = intensity * animValue * 0.9;
        ctx.fillStyle = withAlpha(lightColor, alpha);
        ctx.fillRect(wx, wy, winW, winH);
      } else {
        ctx.fillStyle = 'rgba(20, 20, 35, 0.8)';
        ctx.fillRect(wx, wy, winW, winH);
      }
    }
  }
}

function getAnimationValue(
  time: number,
  animation: string,
  speed: number,
  delay: number
): number {
  const t = (time * speed - delay) % 4;
  const phase = ((t % 4) + 4) % 4;

  switch (animation) {
    case 'breathe':
      return 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(phase * Math.PI));
    case 'chase':
      return phase < 2 ? 1 : 0.1;
    case 'blink':
      return phase < 0.2 ? 1 : (phase < 2 ? 0.1 : 0.6);
    case 'gradient':
      return 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(phase * Math.PI * 0.5));
    case 'rainbow':
      return 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);
    default:
      return 0.8;
  }
}

export function getRainbowColor(time: number, speed: number, delay: number): string {
  const hue = ((time * speed * 60 - delay * 60) % 360 + 360) % 360;
  return `hsl(${hue}, 100%, 60%)`;
}

export function drawGroundLine(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number
) {
  const gradient = ctx.createLinearGradient(0, groundY - 5, 0, height);
  gradient.addColorStop(0, 'rgba(0, 240, 255, 0.1)');
  gradient.addColorStop(0.3, 'rgba(10, 10, 20, 0.95)');
  gradient.addColorStop(1, '#0A0A14');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, groundY, width, height - groundY);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(width, groundY);
  ctx.stroke();
}

export function snapToGrid(value: number, gridSize: number = 20): number {
  return Math.round(value / gridSize) * gridSize;
}

export function isPointInBuilding(
  px: number,
  py: number,
  building: Building
): boolean {
  return (
    px >= building.x &&
    px <= building.x + building.width &&
    py >= building.y &&
    py <= building.y + building.height
  );
}

export function isBuildingInBox(
  building: Building,
  boxStartX: number,
  boxStartY: number,
  boxEndX: number,
  boxEndY: number
): boolean {
  const minX = Math.min(boxStartX, boxEndX);
  const maxX = Math.max(boxStartX, boxEndX);
  const minY = Math.min(boxStartY, boxEndY);
  const maxY = Math.max(boxStartY, boxEndY);

  return (
    building.x >= minX &&
    building.x + building.width <= maxX &&
    building.y >= minY &&
    building.y + building.height <= maxY
  );
}

export function isPointInGroup(
  px: number,
  py: number,
  group: BuildingGroup,
  buildings: Building[]
): boolean {
  const groupBuildings = buildings.filter((b) => group.childBuildingIds.includes(b.id));
  if (groupBuildings.length === 0) return false;

  const minX = Math.min(...groupBuildings.map((b) => b.x));
  const maxX = Math.max(...groupBuildings.map((b) => b.x + b.width));
  const minY = Math.min(...groupBuildings.map((b) => b.y));
  const maxY = Math.max(...groupBuildings.map((b) => b.y + b.height));

  return px >= minX && px <= maxX && py >= minY && py <= maxY;
}

export function getGroupBounds(
  group: BuildingGroup,
  buildings: Building[]
): { minX: number; maxX: number; minY: number; maxY: number } {
  const groupBuildings = buildings.filter((b) => group.childBuildingIds.includes(b.id));
  if (groupBuildings.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  return {
    minX: Math.min(...groupBuildings.map((b) => b.x)),
    maxX: Math.max(...groupBuildings.map((b) => b.x + b.width)),
    minY: Math.min(...groupBuildings.map((b) => b.y)),
    maxY: Math.max(...groupBuildings.map((b) => b.y + b.height)),
  };
}

export function drawGroupBoundingBox(
  ctx: CanvasRenderingContext2D,
  group: BuildingGroup,
  buildings: Building[],
  isSelected: boolean,
  isEditMode: boolean
) {
  const bounds = getGroupBounds(group, buildings);
  const { minX, maxX, minY, maxY } = bounds;
  const width = maxX - minX;
  const height = maxY - minY;

  ctx.save();

  const color = isEditMode ? '#FFE600' : isSelected ? '#00F0FF' : 'rgba(0, 240, 255, 0.3)';
  const dashPattern = isEditMode ? [5, 5] : isSelected ? [] : [3, 3];

  ctx.strokeStyle = color;
  ctx.lineWidth = isSelected || isEditMode ? 2 : 1;
  ctx.setLineDash(dashPattern);

  ctx.strokeRect(minX - 4, minY - 4, width + 8, height + 8);

  if (isSelected || isEditMode) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.strokeRect(minX - 4, minY - 4, width + 8, height + 8);
    ctx.shadowBlur = 0;

    const handleSize = 8;
    const handles = [
      { x: minX - 4, y: minY - 4 },
      { x: maxX - 4, y: minY - 4 },
      { x: minX - 4, y: maxY - 4 },
      { x: maxX - 4, y: maxY - 4 },
    ];

    ctx.fillStyle = '#1A1A28';
    ctx.strokeStyle = color;
    ctx.setLineDash([]);
    ctx.lineWidth = 1;

    for (const handle of handles) {
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(group.pivotX, group.pivotY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.setLineDash([]);

  if (!isEditMode) {
    const label = group.name;
    ctx.font = '12px Rajdhani, sans-serif';
    const labelWidth = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(26, 26, 40, 0.9)';
    ctx.fillRect(minX, minY - 22, labelWidth + 10, 18);
    ctx.fillStyle = color;
    ctx.fillText(label, minX + 5, minY - 9);
  }

  ctx.restore();
}

export function drawBoxSelection(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);

  ctx.save();

  ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.fillRect(minX, minY, maxX - minX, maxY - minY);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

  ctx.setLineDash([]);
  ctx.restore();
}

export function drawMultiSelectionHighlight(
  ctx: CanvasRenderingContext2D,
  building: Building
) {
  ctx.save();

  ctx.strokeStyle = '#FFE600';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#FFE600';
  ctx.shadowBlur = 8;
  ctx.strokeRect(building.x, building.y, building.width, building.height);

  ctx.shadowBlur = 0;
  ctx.restore();
}
