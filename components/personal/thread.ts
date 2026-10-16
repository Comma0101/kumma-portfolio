// One red line for the whole page: the path is split into chunks (one per
// section), and how much of it is drawn follows the reader down the page.

import { arcAt, timeAt } from "./ink";
import type { Point } from "./pen";

// from/to: arc fractions of the whole thread; top/bottom: the page height
// the chunk covers, which is the span the reader scrolls to draw it.
export type Chunk = { from: number; to: number; top: number; bottom: number };

// `ends` are point indices where each chunk stops (the last must be the
// final point).
export function chunksOf(points: Point[], ends: number[]): Chunk[] {
  const lengths = [0];
  for (let i = 1; i < points.length; i += 1) {
    lengths.push(
      lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]),
    );
  }
  const total = lengths[lengths.length - 1] || 1;
  const chunks: Chunk[] = [];
  let start = 0;
  for (const end of ends) {
    let top = Infinity;
    let bottom = -Infinity;
    for (let i = start; i <= end; i += 1) {
      top = Math.min(top, points[i][1]);
      bottom = Math.max(bottom, points[i][1]);
    }
    chunks.push({ from: lengths[start] / total, to: lengths[end] / total, top, bottom });
    start = end;
  }
  return chunks;
}

// Fraction of the thread drawn when the reader's pen tip is at page height
// `tip`. Within a chunk the hand keeps its pacing (quick on runs, slower
// into turns), so detours are drawn, not revealed.
export function arcAtTip(chunks: Chunk[], pacing: number[], tip: number) {
  let arc = 0;
  for (const chunk of chunks) {
    if (tip < chunk.top) break;
    const span = chunk.bottom - chunk.top;
    const t = span <= 0 ? 1 : Math.min(1, (tip - chunk.top) / span);
    const a = timeAt(pacing, chunk.from);
    const b = timeAt(pacing, chunk.to);
    arc = arcAt(pacing, a + (b - a) * t);
    if (t < 1) break;
  }
  return arc;
}

// The stroke's own samples between two arc fractions, plus one point on
// each side so neighbouring chunks overlap and the line never breaks.
export function slice(line: Point[], from: number, to: number): Point[] {
  const lengths = [0];
  for (let i = 1; i < line.length; i += 1) {
    lengths.push(lengths[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]));
  }
  const total = lengths[lengths.length - 1] || 1;
  let first = line.length - 1;
  let last = 0;
  for (let i = 0; i < line.length; i += 1) {
    const f = lengths[i] / total;
    if (f >= from - 1e-9 && f <= to + 1e-9) {
      first = Math.min(first, i);
      last = Math.max(last, i);
    }
  }
  return line.slice(Math.max(0, first - 1), Math.min(line.length, last + 2));
}

// How far a chunk is drawn (0–1) when the whole thread is drawn to `arc`.
export function within(chunk: Chunk, arc: number) {
  const span = chunk.to - chunk.from;
  if (span <= 0) return arc >= chunk.to ? 1 : 0;
  return Math.min(1, Math.max(0, (arc - chunk.from) / span));
}

// What the reader's scroll draws: every chunk after the first. The first
// (the opening) is drawn by its own timed beat, never by scroll.
export function scrolledArc(chunks: Chunk[], pacing: number[], tip: number) {
  return arcAtTip(chunks.slice(1), pacing, tip);
}

// The stretches of page height where the line runs down the margin (at x),
// as [top, bottom] pairs. Detours shorter than `gap` (a tally barb out and
// back) do not break a stretch.
export function marginSpans(line: [number, number][], x: number, tolerance = 4, gap = 48) {
  const spans: [number, number][] = [];
  for (const [px, py] of line) {
    if (Math.abs(px - x) > tolerance) continue;
    const last = spans[spans.length - 1];
    if (last && py - last[1] <= gap) last[1] = Math.max(last[1], py);
    else spans.push([py, py]);
  }
  return spans.filter(([a, b]) => b - a > 1);
}
