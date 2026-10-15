"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { threadX } from "./anchors";
import { handLine } from "./pen";
import { draw, reveal, useBeat, useScrub } from "./useBeat";
import styles from "./Front.module.css";

const margin: Trace = ({ height }, host) => ({
  points: handLine([threadX(host), -2], [threadX(host), height + 2], 61, 0.5),
});

const lines = ["The body", "catches up."];

// The sentence is understood before it is lived: its outline is already
// there; the ink grows into it as the reader keeps going.
export default function CatchUp() {
  const ref = useRef<HTMLElement>(null);

  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "catch-margin"), { duration: 1.4, position: 0 });
  });

  useScrub(
    ref,
    (root, tl) => {
      tl.fromTo(
        root.querySelector("[data-body]"),
        { "--wght": 100 },
        // Compounding, but readable within one scroll: slow, then sure.
        { "--wght": 820, ease: "power3.in" },
      );
    },
    { start: "top 75%", end: "center 40%" },
  );

  return (
    <section ref={ref} className={styles.catchUp} aria-labelledby="catch-up">
      <Ink trace={margin} mark="catch-margin" size={2.2} seed={61} className={styles.thread} />
      <p className={styles.first}>Understanding arrives first.</p>
      <h2 id="catch-up" className={styles.catchLine}>
        <span className={styles.outline} aria-hidden="true">
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
        <span className={styles.bodyFill} data-body>
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
      </h2>
    </section>
  );
}
