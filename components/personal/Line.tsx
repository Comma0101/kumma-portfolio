"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { anchor, threadX } from "./anchors";
import { fitPoints, handLine, loop } from "./pen";
import { draw, ease, reveal, useBeat } from "./useBeat";
import styles from "./Front.module.css";

// The margin line comes down and stops at the label: the pen lifts.
const margin: Trace = (_, host) => {
  const label = anchor(host, "reason");
  if (!label) return { points: [] };
  const x = threadX(host);
  return { points: handLine([x, -2], [x, label.y + label.height * 0.5], 51, 0.5) };
};

// Then, set down again: an open circle beside 若見諸相非相 — seeing form
// as not-form, held without grasping. Its opening faces the text, and the
// pen never touches the characters.
const enso: Trace = (_, host) => {
  const clause = anchor(host, "not-form");
  const seen = anchor(host, "seen");
  if (!clause || !seen) return { points: [] };
  const radius = Math.max(seen.width * 1.05, 46);
  const gap = seen.width * 0.45;
  const room = seen.x - gap - radius * 2 > threadX(host) + 24;
  // Beside the last column if there is room; on a phone, beneath it.
  const cx = room ? seen.x - gap - radius : seen.x + seen.width / 2;
  const cy = room ? clause.y + clause.height * 0.42 : seen.y + seen.height + gap + radius;
  return {
    points: fitPoints(loop({ seed: 33, overshoot: -0.16, facing: room ? 0 : -Math.PI / 2 }), {
      x: cx - radius,
      y: cy - radius * 1.08,
      width: radius * 2,
      height: radius * 2.16,
    }),
  };
};

export default function Line() {
  const ref = useRef<HTMLElement>(null);

  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "reason-margin"), { duration: 1.2, position: 0 });
    draw(tl, reveal(root, "enso"), { duration: 1.6, position: ">0.35" });
    tl.fromTo(
      root.querySelector("[data-stop]"),
      { scale: 0 },
      { scale: 1, duration: 0.45, ease: ease.impulse },
      ">0.15",
    );
  });

  return (
    <section ref={ref} className={styles.line} aria-label="Diamond Sutra">
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
      <Ink trace={margin} mark="reason-margin" size={2.2} seed={51} className={styles.thread} />
      <Ink trace={enso} mark="enso" size={3.2} seed={33} startPool endPool className={styles.thread} />
    </section>
  );
}
