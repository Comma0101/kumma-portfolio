"use client";

import { useRef } from "react";
import { useScrub } from "./useBeat";
import ChapterMark from "./ChapterMark";
import styles from "./Front.module.css";

// The thread walks the staircase under the words (Thread), and the words
// walk with it: three footfalls forward, two back, twice — each a hard
// step, held still between — ending a little ahead of where they began.
export default function Steps() {
  const ref = useRef<HTMLElement>(null);
  useScrub(
    ref,
    (root, tl) => {
      const line = root.querySelector<HTMLElement>("[data-anchor=\"steps\"]");
      if (!line) return;
      const step = parseFloat(getComputedStyle(line).fontSize) * 0.18;
      let at = 0;
      for (let cycle = 0; cycle < 2; cycle += 1) {
        for (const dir of [1, 1, 1, -1, -1]) {
          at += dir * step;
          tl.to(line, { x: at, duration: 0.1, ease: "power4.out" });
          tl.to({}, { duration: 0.4 });
        }
      }
    },
    { start: "top 55%", end: "bottom 75%", scrub: 0.3 },
  );

  return (
    <section ref={ref} className={styles.steps} aria-labelledby="steps" data-thread="steps">
      <p className={styles.label}>
        <ChapterMark char="步" label="Steps" />
      </p>
      <h2 id="steps" className={styles.stepsLine} data-anchor="steps">
        Three steps forward, two back.
      </h2>
    </section>
  );
}
