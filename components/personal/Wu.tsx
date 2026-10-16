"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { fitPoints } from "./pen";
import { draw, useBeat } from "./useBeat";
import { wu } from "./wu";
import styles from "./Front.module.css";

const strokeTrace =
  (stroke: (typeof wu)[number]): Trace =>
  ({ width, height }) => ({
    points: fitPoints(stroke, { x: 0, y: 0, width, height }),
  });

const traces = wu.map(strokeTrace);

// 無, written by the same red pen, one stroke at a time in its proper order.
export default function Wu() {
  const ref = useRef<HTMLElement>(null);

  // Written, not animated: a pause between strokes so the order reads,
  // the four dots (灬) quick. The text it comes from appears in one cut
  // when the last dot lands.
  useBeat(ref, (root, tl) => {
    root.querySelectorAll("[data-reveal]").forEach((stroke, index) => {
      const dot = index >= 8;
      draw(tl, stroke, {
        duration: dot ? 0.16 : 0.34,
        ease: "power2.out",
        position: index === 0 ? 0.25 : dot ? ">0.12" : ">0.25",
      });
    });
    tl.set(root.querySelector("[data-source]"), { visibility: "visible" }, ">0.2");
  });

  return (
    <section ref={ref} className={styles.wu} aria-labelledby="wu">
      <h2 id="wu" className={styles.wuGlyph}>
        <span className="sr-only">無</span>
        {traces.map((trace, index) => (
          <Ink
            key={index}
            trace={trace}
            mark={`wu-${index}`}
            size={11}
            seed={90 + index}
            endPool
            className={styles.wuStroke}
          />
        ))}
      </h2>
      <div className={styles.wuGloss}>
        <p lang="zh-Hant" className={styles.wuSource} data-source>
          三十輻，共一轂，當其無，有車之用。
        </p>
        <p>
          Thirty spokes share one hub. Where it is empty, the cart has its use.
        </p>
        <cite>Daodejing 11</cite>
      </div>
    </section>
  );
}
