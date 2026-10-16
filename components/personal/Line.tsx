"use client";

import { useRef } from "react";
import { ease, useBeat } from "./useBeat";
import styles from "./Front.module.css";

export default function Line() {
  const ref = useRef<HTMLElement>(null);

  useBeat(ref, (root, tl) => {
    // The thread draws the open circle as the reader arrives; the point
    // in the full stop lands a moment after.
    tl.fromTo(
      root.querySelector("[data-stop]"),
      { scale: 0 },
      { scale: 1, duration: 0.45, ease: ease.impulse },
      1.4,
    );
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
            <i className={styles.stopDot} data-stop aria-hidden="true" />
          </span>
        </span>
      </p>
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
