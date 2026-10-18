import localFont from "next/font/local";
import Opening from "./Opening";
import CatchUp from "./CatchUp";
import Steps from "./Steps";
import Practice from "./Practice";
import Rules from "./Rules";
import Line from "./Line";
import Dao from "./Dao";
import Close from "./Close";
import Colophon from "./Colophon";
import MotionFlag from "./MotionFlag";
import Thread from "./Thread";
import MarginNav from "./MarginNav";
import styles from "./Front.module.css";

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

// Runs before first paint on a full page load, so marks that are about to
// be drawn start undrawn instead of flashing. MotionFlag covers client
// navigations, where this script does not run.
const motion = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.front="motion"}catch(e){}`;

// Order: who he is, how change actually happens, what he practises, the
// rules of one practice, the reason behind them, the invitation, and last
// the way itself — a path walked. Nothing private: only the public bio,
// ideas, practice.
export default function Front() {
  return (
    <div
      className={`${styles.front} ${sprat.variable} ${junicode.variable} ${notoSerifTC.variable} ${wenkai.variable}`}
    >
      <script dangerouslySetInnerHTML={{ __html: motion }} />
      <MotionFlag />
      <Thread />
      <MarginNav />
      <Opening />
      <CatchUp />
      <Steps />
      <Practice />
      <Rules />
      <Line />
      <Close />
      {/* The last screen: 道 whole, and the quiet things under it. */}
      <div className={styles.ending}>
        <Dao />
        <Colophon />
      </div>
    </div>
  );
}
