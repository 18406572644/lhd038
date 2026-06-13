import { Building, WindowPattern } from '@/types';
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
