"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { anchor, threadX } from "./anchors";
import { climb, fitPoints, type Point } from "./pen";
import { draw, reveal, useBeat, useScrub } from "./useBeat";
import styles from "./Front.module.css";

// Price leaves from the margin and runs off the page: a jagged climb in
// the band under the words, which do not move.
const price: Trace = ({ width }, host) => {
  const line = anchor(host, "chase");
  if (!line) return { points: [] };
  const x = threadX(host);
  // The band is the padding reserved under the words.
  const words = host.querySelector<HTMLElement>('[data-anchor="chase"]');
  const band = words ? parseFloat(getComputedStyle(words).paddingBottom) || 0 : 0;
  return {
    points: fitPoints(climb({ seed: 43 }), {
      x,
      y: line.y + line.height - band + 10,
      width: width - 2 - x,
      height: Math.max(60, band - 30),
    }),
  };
};

// Stay bored: a ruler line, never animated, on which the pen runs dry —
// pressing at the start, breaking up toward the end. Patience is an empty
// pen; the brush that comes next (the ensō) is freshly loaded.
const dry = (f: number) => 0.85 - 0.63 * f;
const flat: Trace = (_, host) => {
  const line = anchor(host, "bored");
  if (!line) return { points: [] };
  const y = line.y + line.height + 14;
  return { points: [[threadX(host), y] as Point, [line.x + line.width, y] as Point] };
};

function Chase() {
  const ref = useRef<HTMLDivElement>(null);
  useBeat(ref, (root, tl) => {
    // Price runs, accelerating away; the words above it never move.
    draw(tl, reveal(root, "price"), { duration: 0.8, ease: "power1.in", position: 0.15 });
  });
  return (
    <div ref={ref} className={styles.chase}>
      <p className={styles.rule} data-anchor="chase">
        Don’t chase.
      </p>
      <span className={styles.price} data-price aria-hidden="true">
        price
      </span>
      <Ink trace={price} mark="price" size={2.4} seed={43} smoothing={1} className={styles.thread} />
    </div>
  );
}

function Small() {
  const ref = useRef<HTMLParagraphElement>(null);
  // It gets smaller as the reader goes: most of it early, then settling.
  useScrub(
    ref,
    (root, tl) => {
      tl.fromTo(
        root.querySelector("[data-small]"),
        // From the line's normal width, which fits on one line like the
        // others: wider would wrap, and the page would jump as it shrank.
        { "--wdth": 160, scale: 1 },
        { "--wdth": 100, scale: 0.6, ease: "expo.out" },
      );
    },
    { start: "top 75%", end: "top 45%" },
  );
  return (
    <p ref={ref} className={styles.rule}>
      <span className={styles.small} data-small>
        Stay small.
      </span>
    </p>
  );
}

export default function Rules() {
  return (
    <section className={styles.rules} aria-label="Rules" data-thread="rules">
      <p className={styles.label}>Trade, in three rules</p>
      <Chase />
      <Small />
      <p className={styles.rule} data-anchor="bored">
        Stay bored.
      </p>
      <Ink trace={flat} mark="flat" size={2.6} seed={45} pressure={dry} still lift={1} className={styles.thread} />
    </section>
  );
}
