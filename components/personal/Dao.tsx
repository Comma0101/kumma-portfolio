"use client";

import { useId, useRef } from "react";
import { centerline, pace, resample, type Emphasis } from "./ink";
import type { Point } from "./pen";
import { draw, useBeat } from "./useBeat";
import { daoMedians, daoOutlines } from "./dao";
import { chapterOf } from "./chapters";
import styles from "./Front.module.css";

// 道, the way — a path walked — as a brush writes it: each stroke is the
// font's own brush shape (Kaiti), revealed along the median the brush
// follows, in stroke order. 首 first; then, after a breath, the walking
// radical 辶 — its dot, its folded turn, and last the long sweep along the
// bottom, the slowest stroke on the page.
const RADICAL = 9;
const SWEEP = daoMedians.length - 1;

const strokes = daoMedians.map((median, i) => {
  const line = resample(median as Point[], 8);
  // The brush pauses where it presses in and where it closes; the sweep
  // presses hardest into its close.
  const emphasis: Emphasis[] = [
    { from: 0, to: 0.08, slow: 3 },
    { from: 0.88, to: 1, slow: i === SWEEP ? 4 : 2.5 },
  ];
  const length = line.slice(1).reduce((sum, p, k) => sum + Math.hypot(p[0] - line[k][0], p[1] - line[k][1]), 0);
  return {
    median: centerline(line),
    outline: daoOutlines[i],
    pace: pace(line, 48, emphasis).join(","),
    // As long as its own path; the sweep at an unhurried walk.
    duration: (0.08 + length * 0.0003) * (i === SWEEP ? 1.8 : 1),
  };
});

export default function Dao() {
  const ref = useRef<HTMLElement>(null);
  const id = `dao-${useId().replace(/:/g, "")}`;
  const chapter = chapterOf("道");

  // Written, not animated: a short breath between strokes so the order
  // reads, a longer one before the radical (a new component). The reflection
  // appears in one cut after the sweep lifts.
  useBeat(ref, (root, tl) => {
    root.querySelectorAll("[data-reveal]").forEach((stroke, index) => {
      draw(tl, stroke, {
        duration: strokes[index].duration,
        ease: "none",
        position: index === 0 ? 0.15 : index === RADICAL ? ">0.35" : index === SWEEP ? ">0.14" : ">0.09",
      });
    });
    tl.set(root.querySelector("[data-source]"), { visibility: "visible" }, ">0.3");
  });

  return (
    <section ref={ref} className={styles.dao} aria-labelledby="dao">
      <h2 id="dao" className={styles.daoGlyph}>
        <span className="sr-only">道</span>
        {strokes.map((stroke, index) => (
          <svg
            key={index}
            className={`${styles.ink} ${styles.daoStroke}`}
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            focusable="false"
            data-mark={`dao-${index}`}
            data-pace={stroke.pace}
          >
            {/* In the masked path's own (flipped) space: the font's units. */}
            <defs>
              <mask id={`${id}-${index}`} maskUnits="userSpaceOnUse" x="-200" y="-200" width="1424" height="1424">
                <path
                  d={stroke.median}
                  pathLength={1}
                  data-reveal
                  fill="none"
                  stroke="#fff"
                  strokeWidth={150}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </mask>
            </defs>
            <g transform="translate(0 900) scale(1 -1)">
              <path d={stroke.outline} mask={`url(#${id}-${index})`} />
            </g>
          </svg>
        ))}
      </h2>
      <div className={styles.daoGloss}>
        <p data-source>{chapter?.reflection}</p>
      </div>
    </section>
  );
}
