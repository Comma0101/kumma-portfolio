"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { profiles } from "./brush";
import { ensoRing } from "./enso";
import { draw, reveal, useBeat } from "./useBeat";
import styles from "./Front.module.css";

// The brush is about a fifth of the circle's radius.
const enso: Trace = (_, host) => {
  const ring = ensoRing(host);
  return ring ? { points: ring.ring, size: ring.radius * 0.22 } : { points: [] };
};

// The sutra stands still; nothing touches the characters. Beside it the
// brush is set down once (the reader's vermilion circle, see brush.ts): pressed in,
// one quick sweep that runs dry, released at the opening toward the text.
export default function Line() {
  const ref = useRef<HTMLElement>(null);
  useBeat(ref, (root, tl) => {
    // Held on landing, then one quick sweep that runs dry.
    draw(tl, reveal(root, "enso"), { duration: 1.5, ease: "none", position: 0.2 });
  // Once the circle's centre is 70% down the screen: all of it is in view
  // while it is set down.
  }, { at: (root) => ensoRing(root)?.cy ?? 0, line: 0.3 });

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
        thinning={0.8}
        profile={profiles.enso}
        emphasis={[
          { from: 0, to: 0.06, slow: 6 },
          { from: 0.08, to: 0.92, slow: 0.7 },
        ]}
        dry={0.55}
        smoothing={1}
        seed={33}
        lift={3}
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
