"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { anchor, threadX } from "./anchors";
import { handLine } from "./pen";
import { draw, reveal, useBeat } from "./useBeat";
import { X_URL } from "./links";
import styles from "./Front.module.css";

// The pen set down again: the margin line comes down into the invitation
// and becomes the underline of the one action, lifting off past the X.
const last: Trace = (_, host) => {
  const follow = anchor(host, "follow");
  if (!follow) return { points: [] };
  const x = threadX(host);
  const y = follow.y + follow.height * 0.98;
  // Down the margin to above the words, out around the F, then under.
  const above = follow.y - 28;
  const side = Math.max(4, follow.x - 22);
  return {
    points: [
      ...handLine([x, -2], [x, above], 78, 0.5),
      ...handLine([x, above], [side, above + 40], 79, 0.4).slice(1),
      ...handLine([side, above + 40], [side + 8, y - 6], 80, 0.4).slice(1),
      ...handLine([side + 8, y - 6], [Math.min(follow.x + follow.width + 36, host.clientWidth - 10), y - 5], 77, 0.7).slice(1),
    ],
  };
};

export default function Close() {
  const ref = useRef<HTMLElement>(null);

  // The line under the action.
  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "last"), { duration: 1.6, position: 0.1 });
  });

  return (
    <section ref={ref} className={styles.close} aria-label="Follow">
      <a className={styles.followBig} href={X_URL} rel="me" data-anchor="follow">
        Follow on X
      </a>
      <Ink trace={last} mark="last" size={3.4} seed={77} lift={14} className={styles.thread} />
    </section>
  );
}
