"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { ensoRing } from "./enso";
import { draw, reveal, useBeat } from "./useBeat";
import styles from "./Front.module.css";

const enso: Trace = (_, host) => ({ points: ensoRing(host)?.ring ?? [] });

// The sutra stands still; nothing touches the characters. Beside it the
// brush is set down once — a pressed start, one slow sweep, a dry lift at
// the opening toward the text.
export default function Line() {
  const ref = useRef<HTMLElement>(null);
  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "enso"), { duration: 2.4, position: 0.5 });
  });

  return (
    <section ref={ref} className={styles.line} aria-label="Diamond Sutra" data-thread="reason">
      <p className={styles.label} aria-hidden="true" data-anchor="reason">
        The reason
      </p>
      <p className={styles.sutra} lang="zh-Hant">
        <span className={styles.column}>凡所有相，</span>
        <span className={styles.column}>皆是虛妄；</span>
        <span className={styles.column} data-anchor="not-form">
          若見諸相非相，
        </span>
        <span className={`${styles.column} ${styles.seen}`} data-anchor="seen">
          則見如來
          <span className={styles.stopMark}>
            。
          </span>
        </span>
      </p>
      <Ink
        trace={enso}
        mark="enso"
        size={7.5}
        seed={33}
        press
        lift={20}
        className={styles.thread}
      />
      <div className={styles.gloss}>
        <p>
          All that has form is illusion. See form as no-form, and you see what is
          truly so.
        </p>
        <cite>Diamond Sutra · Kumārajīva</cite>
      </div>
    </section>
  );
}
