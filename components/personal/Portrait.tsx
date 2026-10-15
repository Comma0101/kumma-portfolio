import { Archivo, Noto_Serif_TC } from "next/font/google";
import styles from "./Portrait.module.css";
import TypeStage from "./TypeStage";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-portrait",
  display: "swap",
});

const notoSerifTC = Noto_Serif_TC({
  weight: ["500", "600"],
  variable: "--font-tc",
  display: "swap",
  preload: false,
});

export default function Portrait() {
  return (
    <div className={`${styles.page} ${archivo.variable} ${notoSerifTC.variable}`}>
      <TypeStage />
    </div>
  );
}
