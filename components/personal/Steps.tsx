"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { anchor, threadX } from "./anchors";
import { fitPoints, handLine, steps } from "./pen";
import { draw, reveal, useBeat } from "./useBeat";
import styles from "./Front.module.css";

// The margin line comes down, then walks it: three forward, two back,
// three forward — and still reaches the far side.
const walk: Trace = ({ width }, host) => {
  const line = anchor(host, "steps");
  if (!line) return { points: [] };
  const x = threadX(host);
  const top = line.y + line.height + 28;
  const path = fitPoints(steps({ seed: 6, cycles: 4 }), {
    x,
    y: top,
    width: width - x - Math.max(16, window.innerWidth * 0.04),
    height: 210,
  });
  return { points: [...handLine([x, -2], path[0], 71, 0.5), ...path.slice(1)] };
};

export default function Steps() {
  const ref = useRef<HTMLElement>(null);
  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "walk"), { duration: 3.4, position: 0.1 });
  });

  return (
    <section ref={ref} className={styles.steps} aria-labelledby="steps">
      <h2 id="steps" className={styles.stepsLine} data-anchor="steps">
        Three steps forward, two back.
      </h2>
      <Ink trace={walk} mark="walk" size={3} seed={6} className={styles.thread} />
    </section>
  );
}
