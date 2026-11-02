"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { anchor } from "./anchors";
import { handLine } from "./pen";
import { draw, reveal, useBeat } from "./useBeat";
import { X_URL } from "./links";
import styles from "./Front.module.css";

// The pen set down again for the one action: a single underline from under
// the F to past the X — no frame around the words.
const last: Trace = (_, host) => {
  const follow = anchor(host, "follow");
  if (!follow) return { points: [] };
  // Just below the letters: the face's line box is tighter than its glyphs.
  const y = follow.y + follow.height + 8;
  return {
    points: handLine(
      [follow.x + 2, y - 3],
      [Math.min(follow.x + follow.width + 36, host.clientWidth - 10), y - 6],
      77,
      0.7,
    ),
    // The horizon's weight.
    emphasis: [{ from: 0, to: 1, weight: 1.55 }],
  };
};

export default function Close() {
  const ref = useRef<HTMLElement>(null);

  // A beat after the words arrive, the line under them: gathering speed
  // and running out past the X.
  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "last"), { duration: 0.75, ease: "power2.in", position: 0.35 });
  });

  return (
    <section ref={ref} className={styles.close} aria-label="Follow">
      <a className={styles.followBig} href={X_URL} rel="me" data-anchor="follow">
        Follow on X
      </a>
      <Ink trace={last} mark="last" size={3.6} seed={77} lift={14} className={styles.thread} />
    </section>
  );
}
