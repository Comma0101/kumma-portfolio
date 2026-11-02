import localFont from "next/font/local";

// The notes' Chinese editions, in print: Noto Serif SC, only the
// characters they set (scripts/subset-cjk.py --noto-sc). Imported only by
// the notes, so no other page carries it.
const notoSerifSC = localFont({
  src: "./fonts/NotoSerifSC-notes.woff2",
  weight: "200 900",
  variable: "--font-sc",
  display: "swap",
  // Most of these pages are English: fetched only where a glyph needs it.
  preload: false,
});

export const scClass = notoSerifSC.variable;
