// Ballpoint strokes as SVG path data, drawn in a 0–100 box so any
// `viewBox="0 0 100 100" preserveAspectRatio="none"` overlay can stretch
// them across a word. Seeded so server and client draw the same mark.

type Point = [number, number];

function random(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fmt = (n: number) => String(Number(n.toFixed(1)));
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const at = ([x, y]: Point) => `${fmt(x)} ${fmt(y)}`;
const mid = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

// Smooth a polyline through its midpoints: the pen passes near every point.
function smooth(points: Point[]) {
  if (points.length < 3) return `M ${points.map(at).join(" L ")}`;
  let d = `M ${at(points[0])}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    d += ` Q ${at(points[i])} ${at(mid(points[i], points[i + 1]))}`;
  }
  return `${d} L ${at(points[points.length - 1])}`;
}

export function scribble({
  seed,
  passes = 4,
  axis = "x",
}: {
  seed: number;
  passes?: number;
  axis?: "x" | "y";
}) {
  const rand = random(seed);
  const points: Point[] = [];
  for (let pass = 0; pass < passes; pass += 1) {
    const forward = pass % 2 === 0;
    const steps = 9 + Math.floor(rand() * 5);
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = forward ? t * 100 : 100 - t * 100;
      const high = i % 2 === 0;
      const y = high ? 4 + rand() * 30 : 66 + rand() * 30;
      points.push([clamp(x + (rand() - 0.5) * 10, -4, 104), clamp(y, -4, 104)]);
    }
  }
  return smooth(axis === "y" ? points.map(([x, y]): Point => [y, x]) : points);
}

export function underline({ seed, y = 72 }: { seed: number; y?: number }) {
  const rand = random(seed);
  const points: Point[] = [];
  for (let i = 0; i <= 5; i += 1) {
    const t = i / 5;
    points.push([t * 100, y - t * 6 + (rand() - 0.5) * 3]);
  }
  return smooth(points);
}

export function loop({ seed, overshoot = 0.12 }: { seed: number; overshoot?: number }) {
  const rand = random(seed);
  const start = -Math.PI * (0.55 + rand() * 0.3);
  const sweep = Math.PI * 2 * (1 + overshoot);
  const steps = 30;
  const points: Point[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = start + sweep * t;
    // The hand spirals in slightly, so the closing pass does not retrace.
    const shrink = 1 - 0.07 * t;
    const wobble = 1 + (rand() - 0.5) * 0.05;
    points.push([
      50 + Math.cos(angle) * 47 * shrink * wobble,
      50 + Math.sin(angle) * 45 * shrink * wobble,
    ]);
  }
  return smooth(points);
}

// Re-express a 0–100 stroke in pixel space for a box of width × height,
// so the stroke keeps an even width and pathLength stays exact.
export function fit(d: string, width: number, height: number) {
  let axis = 0;
  return d.replace(/-?\d+(\.\d+)?/g, (raw) => {
    const value = Number(raw) * (axis % 2 === 0 ? width : height) / 100;
    axis += 1;
    return fmt(value);
  });
}
