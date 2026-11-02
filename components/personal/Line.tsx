"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { anchor } from "./anchors";
import { profiles } from "./brush";
import { ensoRing } from "./enso";
import { draw, reveal, useBeat } from "./useBeat";
import ChapterMark from "./ChapterMark";
import styles from "./Front.module.css";

// The brush is about a fifth of the circle's radius.
const enso: Trace = (_, host) => {
  const ring = ensoRing(host);
  const sutra = anchor(host, "sutra");
  if (ring && sutra) {
    // The circle moves below the columns when they leave too little room
    // beside them. Keep the reading note below the actual ink at any size.
    const clearance = Math.max(0, ring.below - (sutra.y + sutra.height) + 24);
    host.style.setProperty("--enso-clearance", `${clearance}px`);
  }
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
  });

  return (
    <section ref={ref} id="reason" className={styles.line} aria-label="Diamond Sutra" data-thread="reason">
      <p className={styles.label} data-anchor="reason">
        <ChapterMark char="理" label="Reason" />
      </p>
      <p className={styles.sutra} lang="zh-Hant" data-anchor="sutra">
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
        <cite>Diamond Sutra · Kumārajīva</cite>
        <p>
          Some passages stay with me because I don’t finish understanding them.
        </p>
        <p>
          What am I experiencing, and what have I already decided it means? I ask
          this about a thought, an identity, and the reality I take for granted.
        </p>
        <p>
          I want to read closely enough to let a text disagree with me.
        </p>
      </div>
    </section>
  );
}
