// Ballpoint gestures as point lists. Gestures are authored in a 0–100 box
// and fitted onto a pixel rectangle; lines between anchors are authored in
// pixels. Seeded so server and client draw the same mark.

export type Point = [number, number];
export type Box = { x: number; y: number; width: number; height: number };

export function random(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function scribble({
  seed,
  passes = 4,
  axis = "x",
}: {
  seed: number;
  passes?: number;
  axis?: "x" | "y";
}): Point[] {
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
  return axis === "y" ? points.map(([x, y]): Point => [y, x]) : points;
}

export function underline({ seed, y = 50 }: { seed: number; y?: number }): Point[] {
  const rand = random(seed);
  const points: Point[] = [];
  for (let i = 0; i <= 5; i += 1) {
    const t = i / 5;
    points.push([t * 100, y - t * 6 + (rand() - 0.5) * 3]);
  }
  return points;
}

// overshoot > 0 closes past a full turn; overshoot < 0 leaves the circle open.
export function loop({ seed, overshoot = 0.12 }: { seed: number; overshoot?: number }): Point[] {
  const rand = random(seed);
  const start = -Math.PI * (0.55 + rand() * 0.3);
  const sweep = Math.PI * 2 * (1 + overshoot);
  const steps = 40;
  const points: Point[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = start + sweep * t;
    // The hand spirals in slightly, so the closing pass does not retrace.
    const shrink = 1 - 0.07 * t;
    const wobble = 1 + (rand() - 0.5) * 0.04;
    points.push([
      50 + Math.cos(angle) * 47 * shrink * wobble,
      50 + Math.sin(angle) * 45 * shrink * wobble,
    ]);
  }
  return points;
}

export function fitPoints(points: Point[], box: Box): Point[] {
  return points.map(([x, y]) => [box.x + (x * box.width) / 100, box.y + (y * box.height) / 100]);
}

// A straight run drawn by hand: exact at both anchors, a slight bow and
// tremor between them.
export function handLine(from: Point, to: Point, seed: number, wobble = 1): Point[] {
  const rand = random(seed);
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const steps = Math.max(2, Math.ceil(length / 60));
  const nx = length ? -(to[1] - from[1]) / length : 0;
  const ny = length ? (to[0] - from[0]) / length : 0;
  const bow = (rand() - 0.5) * Math.min(5, length * 0.01) * wobble;
  const points: Point[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const edge = i === 0 || i === steps;
    const offset = edge ? 0 : Math.sin(Math.PI * t) * bow + (rand() - 0.5) * 1.2 * wobble;
    points.push([
      from[0] + (to[0] - from[0]) * t + nx * offset,
      from[1] + (to[1] - from[1]) * t + ny * offset,
    ]);
  }
  return points;
}

// Three steps forward, two back, until the line arrives: each advance runs
// along a row, each retreat cuts back down-left to the next row, so the
// walk reads as a staircase that still reaches the far side.
export function steps({ seed, cycles = 4 }: { seed: number; cycles?: number }): Point[] {
  const rand = random(seed);
  const unit = 100 / (cycles + 2);
  const row = 88 / cycles;
  const points: Point[] = [[0, 6]];
  let x = 0;
  for (let i = 0; i < cycles; i += 1) {
    const y = 6 + row * i;
    const ahead = x + unit * 3;
    const back = x + unit;
    points.push([x + unit * 1.5, y + (rand() - 0.5) * 2]);
    points.push([ahead, y]);
    points.push([ahead + unit * 0.06, y + row * 0.12]);
    points.push([back, y + row]);
    x = back;
  }
  points.push([x + unit * 1.5, 94 + (rand() - 0.5) * 2]);
  points.push([100, 94]);
  return points.map(([px, py]): Point => [Math.min(100, Math.max(0, px)), py]);
}
