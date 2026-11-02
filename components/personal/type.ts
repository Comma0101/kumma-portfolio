import localFont from "next/font/local";

// The page travels from carved letters, to print, to the hand: Sprat
// (chiselled, wedge serifs) for the display voice; Junicode (a scholar's
// book face) for running text and the asides; the sutra in a printed Ming;
// the hand — LXGW WenKai — only beside the brush. All SIL Open Font
// License, subset by scripts/subset-latin.py and scripts/subset-cjk.py.
const sprat = localFont({
  src: "./fonts/Sprat-subset.woff2",
  // Its own scales: weight 10 (thin) to 200 (black); width 100 to 200.
  weight: "10 200",
  variable: "--font-display",
  display: "swap",
});

const junicode = localFont({
  src: [
    { path: "./fonts/Junicode-subset.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/Junicode-Italic-subset.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-text",
  display: "swap",
});

// Only the ~30 characters the page sets (scripts/subset-cjk.py): the full
// font arrives as ~200 chunks and cost ~1 MB for a few lines of text.
const notoSerifTC = localFont({
  src: "./fonts/NotoSerifTC-subset.woff2",
  weight: "200 900",
  variable: "--font-tc",
  display: "swap",
});

const wenkai = localFont({
  src: "./fonts/LXGWWenKaiTC-subset.woff2",
  variable: "--font-hand",
  display: "swap",
});

// Every page in this voice carries all four.
export const typeClasses = [sprat.variable, junicode.variable, notoSerifTC.variable, wenkai.variable].join(" ");
