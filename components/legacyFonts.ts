import localFont from "next/font/local";

// Keep the established auxiliary families self-hosted at build time too.
// The paper site's Junicode, Sprat, and CJK faces live in personal/type.ts.
// Source files and licenses: components/fonts/README.md.
export const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk.ttf",
  weight: "300 700",
  style: "normal",
  variable: "--font-sans",
  display: "swap",
  preload: false,
});

// Older component factories requested weights 400, 500, and 700.
export const legacyGrotesk = localFont({
  src: "./fonts/SpaceGrotesk.ttf",
  weight: "400 700",
  style: "normal",
  display: "swap",
  preload: false,
});

export const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono.ttf",
  weight: "100 800",
  style: "normal",
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const cormorant = localFont({
  src: [
    { path: "./fonts/CormorantGaramond-Regular.ttf", weight: "500 700", style: "normal" },
    { path: "./fonts/CormorantGaramond-Italic.ttf", weight: "500 700", style: "italic" },
  ],
  variable: "--font-editorial",
  adjustFontFallback: "Times New Roman",
  display: "swap",
  preload: false,
});
