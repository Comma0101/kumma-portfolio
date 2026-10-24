import type { Box, Point } from "./pen";

// Does a hand-drawn line cross a word out? It must run across most of the
// word's width, mostly within its letters' height, without wandering far
// above or below — a strike, not a scribble or an underline.
export function crossesOut(points: Point[], word: Box) {
  if (points.length < 2 || !word.width || !word.height) return false;
  const xs = points.map(([x]) => x);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const covers = (Math.min(right, word.x + word.width) - Math.max(left, word.x)) / word.width;
  const top = word.y + word.height * 0.15;
  const bottom = word.y + word.height * 0.9;
  const inside = points.filter(([x, y]) => x >= word.x - 4 && x <= word.x + word.width + 4 && y >= top && y <= bottom);
  const across = points.filter(([x]) => x >= word.x - 4 && x <= word.x + word.width + 4);
  return covers >= 0.7 && across.length > 0 && inside.length / across.length >= 0.75;
}
