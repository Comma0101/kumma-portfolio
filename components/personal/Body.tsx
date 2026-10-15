"use client";

import { useRef } from "react";
import Pen from "./Pen";
import { loop } from "./pen";
import { draw, useBeat } from "./useBeat";
import styles from "./Front.module.css";

const circle = loop({ seed: 51, overshoot: 0.06 });

export default function Body() {
  const ref = useRef<HTMLElement>(null);
  // One slow, unbroken stroke: a clean circle.
  useBeat(ref, (root, tl) => {
    draw(tl, root.querySelector("[data-pen]"), 1.6, 0.2);
  });

  return (
    <section ref={ref} className={styles.body} aria-labelledby="body">
      <h2 id="body" className={styles.bodyLine}>
        <span>Clean energy.</span>
        <span>
          Clean{" "}
          <span className={styles.circled}>
            circle.
            <Pen d={circle} className={styles.circleRing} />
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
