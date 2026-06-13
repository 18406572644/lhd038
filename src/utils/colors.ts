export const NEON_PINK = '#FF2E97';
export const ELECTRIC_BLUE = '#00F0FF';
export const DEEP_BLACK = '#0A0A14';
export const DARK_PURPLE = '#1A0A2E';
export const NEON_YELLOW = '#FFE600';
export const DARK_GRAY = '#1E1E2E';

export const NEON_PRESETS = [
  { name: '霓虹粉', value: NEON_PINK },
  { name: '电光蓝', value: ELECTRIC_BLUE },
  { name: '霓虹黄', value: NEON_YELLOW },
  { name: '烈焰橙', value: '#FF6B2B' },
  { name: '幽光绿', value: '#39FF14' },
  { name: '幻紫', value: '#BF40FF' },
  { name: '冰白', value: '#E0F0FF' },
  { name: '赤红', value: '#FF003C' },
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 46, b: 151 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function lerpColor(color1: string, color2: string, t: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  return rgbToHex(
    c1.r + (c2.r - c1.r) * t,
    c1.g + (c2.g - c1.g) * t,
    c1.b + (c2.b - c1.b) * t
  );
}

export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
