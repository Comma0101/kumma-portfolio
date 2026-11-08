import { inkStroke, type Emphasis } from "./ink";
import type { Box, Point } from "./pen";

export type Contribution = {
  d: string;
  points: Point[];
  bounds: Box;
  source: "reader" | "pen";
};

export const MAX_CONTRIBUTION_POINTS = 512;

// Keep the finished outline alongside the gesture. Replaying a centreline
// through a different brush would change the mark the reader recognises.
export function createContribution(
  points: Point[],
  source: Contribution["source"],
  brush: { size: number; seed: number; emphasis?: Emphasis[] },
): Contribution | null {
  const valid = points.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (valid.length < 2 || !Number.isFinite(brush.size) || brush.size <= 0) return null;

  const count = Math.min(valid.length, MAX_CONTRIBUTION_POINTS);
  const bounded = Array.from({ length: count }, (_, index): Point => {
    const at = Math.round((index * (valid.length - 1)) / (count - 1));
    return [...valid[at]];
  });
  const length = bounded.reduce((total, point, index) => {
    if (!index) return total;
    const previous = bounded[index - 1];
    return total + Math.hypot(point[0] - previous[0], point[1] - previous[1]);
  }, 0);
  const ink = inkStroke(bounded, {
    ...brush,
    smoothing: 2,
    lift: 2,
    // Long wandering gestures must keep a bounded rendering workload too.
    spacing: Math.max(2, brush.size * 0.8, length / 1024),
  });
  if (!ink.outline) return null;

  const xs = bounded.map(([x]) => x);
  const ys = bounded.map(([, y]) => y);
  const padding = brush.size * 2;
  const x = Math.min(...xs) - padding;
  const y = Math.min(...ys) - padding;

  return {
    d: ink.outline,
    points: bounded,
    bounds: {
      x,
      y,
      width: Math.max(...xs) - x + padding,
      height: Math.max(...ys) - y + padding,
    },
    source,
  };
}
