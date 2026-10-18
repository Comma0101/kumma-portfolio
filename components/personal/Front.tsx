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
import { typeClasses } from "./type";
import styles from "./Front.module.css";

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
      className={`${styles.front} ${typeClasses}`}
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
