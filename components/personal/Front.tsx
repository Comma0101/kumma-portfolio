import Opening from "./Opening";
import Agency from "./Agency";
import CatchUp from "./CatchUp";
import Steps from "./Steps";
import Practice from "./Practice";
import Rules from "./Rules";
import Line from "./Line";
import Dao from "./Dao";
import Close from "./Close";
import Colophon from "./Colophon";
import MotionFlag from "./MotionFlag";
import { motionScript } from "./motion";
import Thread from "./Thread";
import MarginNav from "./MarginNav";
import { typeClasses } from "./type";
import styles from "./Front.module.css";

// Order: who he is, that a life is authored and not only reacted to, how
// change actually happens, what he practises, the
// rules for acting without knowing, the reason behind them, the way itself
// — a path walked — and after it the invitation. Nothing private: only the public bio,
// ideas, practice.
export default function Front() {
  return (
    <div
      className={`${styles.front} ${typeClasses}`}
      data-paper
    >
      <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      <MotionFlag />
      <Thread />
      <MarginNav />
      <Opening />
      <Agency />
      <CatchUp />
      <Steps />
      <Practice />
      <Rules />
      <Line />
      {/* The last screen: 道, the arc's last chapter, straight after the
          reason; under it, small, the invitation and the quiet things. */}
      <div className={styles.ending}>
        <Dao />
        <Close />
        <Colophon />
      </div>
    </div>
  );
}
