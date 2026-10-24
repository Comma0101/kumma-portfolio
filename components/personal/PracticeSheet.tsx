"use client";

import { useId, useMemo, useRef } from "react";
import { inkStroke } from "./ink";
import { practiceStrokes, SHEET } from "./practice";
import { draw, useScrub } from "./useBeat";
import styles from "./Front.module.css";

// 習 shown, not declared: the pen repeats one stroke as the reader scrolls
// past — in the reader's own time — shaky at first, sure by the end.
export default function PracticeSheet() {
  const ref = useRef<HTMLDivElement>(null);
  const id = `sheet-${useId().replace(/:/g, "")}`;
  const marks = useMemo(
    () =>
      practiceStrokes(14).map((stroke, i) => {
        const ink = inkStroke(stroke.points, {
          size: 7,
          seed: 300 + i,
          pressure: stroke.pressure,
          thinning: 0.7,
          smoothing: 2,
          spacing: 1.5,
          lift: 1.6,
          press: stroke.skill > 0.6,
        });
        return { outline: ink.outline, center: ink.center, pace: ink.pace.join(","), pools: ink.pools };
      }),
    [],
  );

  useScrub(
    ref,
    (root, tl) => {
      root.querySelectorAll("[data-reveal]").forEach((stroke, i) => {
        // Each repetition a little quicker than the last: the hand learns.
        draw(tl, stroke, { duration: 1.2 - i * 0.04, ease: "power1.inOut", position: i === 0 ? 0 : ">0.25" });
      });
    },
    { start: "top 96%", end: "top 52%", scrub: 0.8 },
  );

  return (
    <div ref={ref} className={styles.practiceSheet}>
      <svg
        className={`${styles.ink} ${styles.sheetInk}`}
        viewBox={`0 0 ${SHEET.width} ${SHEET.height}`}
        aria-hidden="true"
        focusable="false"
      >
        {marks.map((mark, i) => (
          <svg key={i} overflow="visible" data-pace={mark.pace}>
            <defs>
              <mask id={`${id}-${i}`} maskUnits="userSpaceOnUse" x="-50" y="-50" width={SHEET.width + 100} height={SHEET.height + 100}>
                <path
                  d={mark.center}
                  pathLength={1}
                  data-reveal
                  fill="none"
                  stroke="#fff"
                  strokeWidth={24}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </mask>
            </defs>
            <g mask={`url(#${id}-${i})`}>
              <path d={mark.outline} />
              {mark.pools.map((pool, k) => (
                <circle key={k} cx={pool.x} cy={pool.y} r={pool.r} />
              ))}
            </g>
          </svg>
        ))}
      </svg>
      <p className={styles.practiceCaption}>
        Practice isn’t a declaration of intention but something formed through doing.
      </p>
    </div>
  );
}
