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

// overshoot > 0 closes past a full turn; overshoot < 0 leaves the circle
// open, with the gap centred on `facing` (radians, 0 = right) when given.
export function loop({
  seed,
  overshoot = 0.12,
  facing,
}: {
  seed: number;
  overshoot?: number;
  facing?: number;
}): Point[] {
  const rand = random(seed);
  const gap = overshoot < 0 ? -overshoot * Math.PI * 2 : 0;
  const start =
    facing === undefined ? -Math.PI * (0.55 + rand() * 0.3) : facing + gap / 2;
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

// Three steps forward, two back, until the line arrives: long flat treads
// forward, short steep risers back down to the next tread, and a last run
// that reaches the far side.
export function steps({ seed, cycles = 4 }: { seed: number; cycles?: number }): Point[] {
  const rand = random(seed);
  const unit = 100 / (cycles * 2.4 + 1.6);
  const row = 88 / cycles;
  const points: Point[] = [[0, 6]];
  let x = 0;
  for (let i = 0; i < cycles; i += 1) {
    const y = 6 + row * i;
    const ahead = x + unit * 3;
    points.push([x + unit * 1.5, y + (rand() - 0.5) * 2]);
    points.push([ahead, y]);
    points.push([ahead + unit * 0.06, y + row * 0.12]);
    x = ahead - unit * 0.6;
    points.push([x, y + row]);
  }
  points.push([x + unit * 0.8, 94 + (rand() - 0.5) * 2]);
  points.push([100, 94]);
  return points.map(([px, py]): Point => [Math.min(100, Math.max(0, px)), py]);
}

// Price: a jagged climb that chops on the way up, left to right.
export function climb({ seed, ticks = 30 }: { seed: number; ticks?: number }): Point[] {
  const rand = random(seed);
  const walk = [0];
  for (let i = 1; i <= ticks; i += 1) walk.push(walk[i - 1] - 2.6 + (rand() - 0.35) * 14);
  // Fill the box: the low of the walk sits on the floor, the high at the top.
  const lo = Math.min(...walk);
  const hi = Math.max(...walk);
  return walk.map((v, i): Point => [(i / ticks) * 100, 8 + ((v - lo) / (hi - lo || 1)) * 84]);
}

// Round a turn: the points already drawn end at a corner; trim back up to
// `radius` before it and curve round to head for `target`. Returns the
// index where the curve begins (the last point before the turn).
export function corner(points: Point[], target: Point, radius: number): number {
  const at = points.pop();
  if (!at || !points.length) {
    if (at) points.push(at);
    return points.length - 1;
  }
  const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  while (points.length > 1 && dist(points[points.length - 1], at) < radius) points.pop();
  const back = points[points.length - 1];
  const inLength = dist(back, at) || 1;
  const r1 = Math.min(radius, inLength);
  const entry: Point = [at[0] + ((back[0] - at[0]) * r1) / inLength, at[1] + ((back[1] - at[1]) * r1) / inLength];
  const outLength = dist(at, target) || 1;
  const r2 = Math.min(radius, outLength / 2);
  const exit: Point = [at[0] + ((target[0] - at[0]) * r2) / outLength, at[1] + ((target[1] - at[1]) * r2) / outLength];
  const start = points.length;
  points.push(entry);
  const n = 10;
  for (let i = 1; i <= n; i += 1) {
    const t = i / n;
    points.push([
      (1 - t) * (1 - t) * entry[0] + 2 * (1 - t) * t * at[0] + t * t * exit[0],
      (1 - t) * (1 - t) * entry[1] + 2 * (1 - t) * t * at[1] + t * t * exit[1],
    ]);
  }
  return start;
}

// A loose coil of line between two points — loops rising off the line
// (a prolate trochoid) — that pulls straight as tension goes 0 → 1.
export function coil(
  from: Point,
  to: Point,
  { loops, depth, tension, steps = 240 }: { loops: number; depth: number; tension: number; steps?: number },
): Point[] {
  const slack = Math.pow(1 - Math.min(1, Math.max(0, tension)), 2.2);
  const width = to[0] - from[0];
  // It loops where the radius is larger than the advance per radian.
  const radius = depth / 2;
  const out: Point[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    const theta = Math.PI * 2 * loops * u;
    // Pinned at both ends: the loops fade in and out over the first and
    // last stretch so the coil starts and ends on the line.
    const pin = Math.sin(Math.PI * u) ** 0.35;
    const b = radius * slack * pin;
    const x = from[0] + width * u - b * Math.sin(theta);
    const y = from[1] + (to[1] - from[1]) * u - b * (1 - Math.cos(theta));
    out.push([x, y]);
  }
  out[0] = [from[0], from[1]];
  out[out.length - 1] = [to[0], to[1]];
  return out;
}
