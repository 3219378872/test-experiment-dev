export type StatusTone = 'good' | 'warn' | 'bad';

const statusHue: Record<StatusTone, number> = {
  good: 152,
  warn: 85,
  bad: 25,
};

export function softBg(hue: number): string {
  return `oklch(0.95 0.035 ${hue})`;
}

export function softBg2(hue: number): string {
  return `oklch(0.92 0.055 ${hue})`;
}

export function inkOn(hue: number): string {
  return `oklch(0.42 0.09 ${hue})`;
}

export function sliceFill(hue: number): string {
  return `oklch(0.78 0.11 ${hue})`;
}

export function sliceFillHover(hue: number): string {
  return `oklch(0.72 0.14 ${hue})`;
}

export function statusDot(status: StatusTone): string {
  const lightness = status === 'warn' ? 0.78 : status === 'good' ? 0.68 : 0.6;
  const chroma = status === 'warn' ? 0.14 : 0.16;
  return `oklch(${lightness} ${chroma} ${statusHue[status]})`;
}

export function statusInk(status: StatusTone): string {
  return `oklch(0.45 0.11 ${statusHue[status]})`;
}

export function statusSoft(status: StatusTone): string {
  return `oklch(0.94 0.05 ${statusHue[status]})`;
}
