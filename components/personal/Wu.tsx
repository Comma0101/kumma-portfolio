"use client";

import { useId, useRef } from "react";
import { centerline, pace, resample, type Emphasis } from "./ink";
import type { Point } from "./pen";
import { draw, useBeat } from "./useBeat";
import { wuMedians, wuOutlines } from "./wu";
import styles from "./Front.module.css";

// 無 as a brush writes it: each stroke is the font's own brush shape
// (Kaiti), revealed along the median the brush follows, in stroke order.
// The brush pauses where it presses in and where it closes; the dots (the
// last four strokes) only press in.
const DOTS = 8;

const strokes = wuMedians.map((median, i) => {
  const line = resample(median as Point[], 8);
  const emphasis: Emphasis[] =
    i >= DOTS
      ? [{ from: 0, to: 0.15, slow: 2 }]
      : [
          { from: 0, to: 0.08, slow: 3 },
          { from: 0.9, to: 1, slow: 2.5 },
        ];
  const length = line.slice(1).reduce((sum, p, k) => sum + Math.hypot(p[0] - line[k][0], p[1] - line[k][1]), 0);
  return {
    median: centerline(line),
    outline: wuOutlines[i],
    pace: pace(line, 48, emphasis).join(","),
    // As long as its own path: a dot is quick, the long horizontal long.
    duration: i >= DOTS ? 0.09 : 0.08 + length * 0.0003,
  };
});

export default function Wu() {
  const ref = useRef<HTMLElement>(null);
  const id = `wu-${useId().replace(/:/g, "")}`;

  // Written, not animated: a short breath between strokes so the order
  // reads, a longer one before the dots (a new component), the dots quick.
  // The text it comes from appears in one cut after the last dot lands.
  useBeat(ref, (root, tl) => {
    root.querySelectorAll("[data-reveal]").forEach((stroke, index) => {
      draw(tl, stroke, {
        duration: strokes[index].duration,
        ease: "none",
        position: index === 0 ? 0.15 : index === DOTS ? ">0.3" : index > DOTS ? ">0.05" : ">0.09",
      });
    });
    tl.set(root.querySelector("[data-source]"), { visibility: "visible" }, ">0.25");
  // Once the character's centre reaches the middle of the screen.
  }, {
    at: (root) => {
      const glyph = root.querySelector("#wu")?.getBoundingClientRect();
      return glyph ? glyph.top + glyph.height / 2 - root.getBoundingClientRect().top : 0;
    },
    line: 0.5,
  });

  return (
    <section ref={ref} className={styles.wu} aria-labelledby="wu">
      <h2 id="wu" className={styles.wuGlyph}>
        <span className="sr-only">無</span>
        {strokes.map((stroke, index) => (
          <svg
            key={index}
            className={`${styles.ink} ${styles.wuStroke}`}
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            focusable="false"
            data-mark={`wu-${index}`}
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
