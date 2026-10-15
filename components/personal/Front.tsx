import { Archivo, Instrument_Serif, Noto_Serif_TC } from "next/font/google";
import Opening from "./Opening";
import CatchUp from "./CatchUp";
import Steps from "./Steps";
import Practice from "./Practice";
import Rules from "./Rules";
import Line from "./Line";
import Wu from "./Wu";
import Close from "./Close";
import MotionFlag from "./MotionFlag";
import styles from "./Front.module.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-front",
  display: "swap",
});

// The second voice: the margin, where he corrects himself.
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-note",
  display: "swap",
});

const notoSerifTC = Noto_Serif_TC({
  weight: ["500", "700"],
  variable: "--font-tc",
  display: "swap",
  preload: false,
});

// Runs before first paint on a full page load, so marks that are about to
// be drawn start undrawn instead of flashing. MotionFlag covers client
// navigations, where this script does not run.
const motion = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.front="motion"}catch(e){}`;

// Order: who he is, how change actually happens, what he practises, the
// rules of one practice, the reason behind them, the empty centre, the
// invitation. Nothing private: only the public bio, ideas, and practice.
export default function Front() {
  return (
    <div
      className={`${styles.front} ${archivo.variable} ${instrument.variable} ${notoSerifTC.variable}`}
    >
      <script dangerouslySetInnerHTML={{ __html: motion }} />
      <MotionFlag />
      <Opening />
      <CatchUp />
      <Steps />
      <Practice />
      <Rules />
      <Line />
      <Wu />
      <Close />
    </div>
  );
}
