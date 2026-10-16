"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { anchor, threadX } from "./anchors";
import { corner, handLine, type Point } from "./pen";
import { draw, reveal, useBeat } from "./useBeat";
import { X_URL } from "./links";
import styles from "./Front.module.css";

// The pen set down again: the margin line comes down into the invitation
// and becomes the underline of the one action, lifting off past the X.
const last: Trace = (_, host) => {
  const follow = anchor(host, "follow");
  if (!follow) return { points: [] };
  const x = threadX(host);
  // Just below the letters: the face's line box is tighter than its glyphs.
  const y = follow.y + follow.height + 8;
  // Down the margin to above the words, out around the F, then under.
  const above = follow.y - 28;
  const side = Math.max(4, follow.x - 22);
  const points: Point[] = handLine([x, -2], [x, above], 78, 0.5);
  const go = (target: Point, seed: number, wobble: number, round: number) => {
    const at = corner(points, target, round);
    points.push(...handLine(points[points.length - 1], target, seed, wobble).slice(1));
    return at;
  };
  go([side, above + 40], 79, 0.4, 26);
  go([side + 8, y - 6], 80, 0.4, 20);
  const split = go([Math.min(follow.x + follow.width + 36, host.clientWidth - 10), y - 5], 77, 0.7, 30);
  const length = (from: number, to: number) =>
    points.slice(from + 1, to + 1).reduce((sum, p, i) => sum + Math.hypot(p[0] - points[from + i][0], p[1] - points[from + i][1]), 0);
  const at = length(0, split) / (length(0, points.length - 1) || 1);
  return {
    points,
    // Where the underline itself begins; it is pressed like the horizon.
    split,
    emphasis: [{ from: at, to: 1, weight: 1.55 }],
  };
};

export default function Close() {
  const ref = useRef<HTMLElement>(null);

  // The line under the action: gathering speed down into the words, then
  // snapping taut past the X — the way the page began.
  useBeat(ref, (root, tl) => {
    const path = reveal(root, "last");
    const split = () => Number(path?.closest("svg")?.getAttribute("data-split") ?? 1);
    draw(tl, path, { to: split, duration: 1.1, ease: "power2.in", position: 0.1 });
    draw(tl, path, { from: split, to: 1, duration: 0.3, ease: "expo.out" });
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
