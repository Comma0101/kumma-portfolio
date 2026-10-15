"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { fitPoints, loop } from "./pen";
import { draw, reveal, useBeat } from "./useBeat";
import styles from "./Front.module.css";

// The open circle beside the sutra let go; this one closes. Discipline.
const circle: Trace = ({ width, height }) => ({
  points: fitPoints(loop({ seed: 51, overshoot: 0.06 }), { x: 0, y: 0, width, height }),
});

export default function Body() {
  const ref = useRef<HTMLElement>(null);
  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "circle"), { duration: 1.7, position: 0.2 });
  });

  return (
    <section ref={ref} className={styles.body} aria-labelledby="body">
      <h2 id="body" className={styles.bodyLine}>
        <span>Clean energy.</span>
        <span>
          Clean{" "}
          <span className={styles.circled}>
            circle.
            <Ink trace={circle} mark="circle" size={3} seed={51} className={styles.circleRing} />
          </span>
        </span>
      </h2>
      <div className={styles.bodyNote}>
        <p>Focus on the body and the mind.</p>
        <p>Gym most days. Hiking, basketball, street clothes for the rest of it.</p>
      </div>
    </section>
  );
}
