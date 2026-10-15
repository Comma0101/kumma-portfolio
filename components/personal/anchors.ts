import type { Box, Point } from "./pen";

// Where an anchor sits inside its host, in the host's pixels.
export function anchor(host: HTMLElement, name: string): Box | null {
  const el = host.querySelector<HTMLElement>(`[data-anchor="${name}"]`);
  if (!el) return null;
  const outer = host.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  return { x: rect.left - outer.left, y: rect.top - outer.top, width: rect.width, height: rect.height };
}

// The red line enters and leaves every section on the same margin, so the
// sections join into one stroke. Matches the record's text indent in CSS.
// Pass the host to get the margin in that host's own pixels.
export function threadX(host?: HTMLElement) {
  const width = window.innerWidth;
  const gutter = Math.max(16, width * 0.04);
  const x = width <= 720 ? gutter * 0.5 : gutter + 30;
  return host ? x - host.getBoundingClientRect().left : x;
}

export const at = (box: Box, fx: number, fy: number): Point => [
  box.x + box.width * fx,
  box.y + box.height * fy,
];
