/**
 * Real-shanshui palette — single source of truth.
 * Design: docs/plans/2026-07-16-real-shanshui-ink-rendering-design.md
 * Five-ink ladder (jiao/nong/zhong/dan/qing) on one charcoal-green hue;
 * paper is the ground, ink is the mark.
 */
export const INK = Object.freeze({
  paper: "#f0ead9",
  jiao: "#1c201a",
  nong: "#2e332b",
  zhong: "#47503f",
  dan: "#75806a",
  qing: "#a9b09a",
});

export const ACCENTS = Object.freeze({
  mineral: "#6d8a7a",
  ochre: "#a98a5e",
  cinnabar: "#9f4435",
});

/** Earth secondary tones used by scene materials (not UI). */
export const EARTHS = Object.freeze({
  paperStone: "#cfc9b4",
  stone: "#8f8a76",
  pine: "#2c3a2c",
  water: "#a7b5a8",
});

/** Darkest to lightest — the classical five ink values. */
export const INK_LADDER: readonly string[] = Object.freeze([
  INK.jiao,
  INK.nong,
  INK.zhong,
  INK.dan,
  INK.qing,
]);

/** sRGB relative luminance (WCAG formula), 0..1. */
export function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = channel((n >> 16) & 0xff);
  const g = channel((n >> 8) & 0xff);
  const b = channel(n & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
