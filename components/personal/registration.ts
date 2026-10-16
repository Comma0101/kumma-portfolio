// Keeping a line registered to its outline while its weight changes: a
// variable font gets wider as it gets heavier, so the width axis has to
// move the other way.

// The axis value at which measure() hits target (measure must increase).
export function bisect(measure: (axis: number) => number, target: number, lo: number, hi: number) {
  if (measure(hi) <= target) return hi;
  if (measure(lo) >= target) return lo;
  let a = lo;
  let b = hi;
  for (let i = 0; i < 14; i += 1) {
    const mid = (a + b) / 2;
    if (measure(mid) < target) a = mid;
    else b = mid;
  }
  return (a + b) / 2;
}

// Linear interpolation through [weight, width] pairs sorted by weight.
export function between(table: Array<[number, number]>, weight: number) {
  if (weight <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i += 1) {
    const [w1, v1] = table[i];
    if (weight <= w1) {
      const [w0, v0] = table[i - 1];
      return v0 + ((v1 - v0) * (weight - w0)) / (w1 - w0);
    }
  }
  return table[table.length - 1][1];
}
