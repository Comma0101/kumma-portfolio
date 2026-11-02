// The face as one red line: an Archimedean spiral whose thickness carries
// the tone of the photograph, after Claude Mellan's single-line engraving
// (1649). The tones are made offline (scripts/spiral-portrait.py); here the
// spiral is rebuilt, and the pen's timing is derived from it.

import type { Point } from "./pen";

// 4-bit tones, two per byte, low nibble first, as 0–1.
export function decodeTones(base64: string, count: number): Float32Array {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const out = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const byte = bytes[i >> 1] ?? 0;
    out[i] = ((i & 1 ? byte >> 4 : byte) & 15) / 15;
  }
  return out;
}

// Points along the spiral from its centre outward, about `step` apart, in
// the same units as the radius. Must match spiral-portrait.py exactly.
export function spiralPath({ turns, radius, step }: { turns: number; radius: number; step: number }): Point[] {
  const pitch = radius / turns;
  const end = Math.PI * 2 * turns;
  const out: Point[] = [];
  for (let th = 0; th < end; ) {
    const r = (pitch * th) / (Math.PI * 2);
    out.push([r * Math.cos(th), r * Math.sin(th)]);
    th += step / Math.max(r, 2);
  }
  return out;
}

// When (0–1) the pen reaches each sample: it moves quickly across the
// light and slows where the face is dark, so the face develops like a
// print. timeline[i] is the time sample i begins; the last entry is 1.
export function timeline(tones: Float32Array): Float32Array {
  const out = new Float32Array(tones.length + 1);
  for (let i = 0; i < tones.length; i += 1) out[i + 1] = out[i] + 0.35 + tones[i];
  const total = out[tones.length] || 1;
  for (let i = 0; i <= tones.length; i += 1) out[i] /= total;
  return out;
}
