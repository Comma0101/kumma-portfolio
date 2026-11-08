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
import { ContributionProvider } from "./Contribution";
import styles from "./Front.module.css";

// A completed gesture belongs to this reading. It returns beside a later
// question and the outward invitation, retaining the same rendered shape.
export default function Front() {
  return (
    <ContributionProvider>
      <div className={`${styles.front} ${typeClasses}`} data-paper>
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
        <div className={styles.ending}>
          <Dao />
          <Close />
          <Colophon />
        </div>
      </div>
    </ContributionProvider>
  );
}
