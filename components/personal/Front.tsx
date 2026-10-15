import { Archivo, Noto_Serif_TC } from "next/font/google";
import Opening from "./Opening";
import Line from "./Line";
import Record from "./Record";
import Body from "./Body";
import Elsewhere from "./Elsewhere";
import Close from "./Close";
import styles from "./Front.module.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--font-front",
  display: "swap",
});

const notoSerifTC = Noto_Serif_TC({
  weight: ["500", "700"],
  variable: "--font-tc",
  display: "swap",
  preload: false,
});

// Runs before first paint on a full page load, so marks that are about to be
// drawn start undrawn instead of flashing. Client navigations skip it; the
// timelines set their own start states.
const motion = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.front="motion"}catch(e){}`;

export default function Front() {
  return (
    <div className={`${styles.front} ${archivo.variable} ${notoSerifTC.variable}`}>
      <script dangerouslySetInnerHTML={{ __html: motion }} />
      <Opening />
      <Line />
      <Record />
      <Body />
      <Elsewhere />
      <Close />
    </div>
  );
}
