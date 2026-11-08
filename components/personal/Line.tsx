"use client";

import { useId, useRef } from "react";
import { ensoPath, profiles } from "./brush";
import { inkStroke } from "./ink";
import { fitPoints } from "./pen";
import { draw, useBeat } from "./useBeat";
import ChapterMark from "./ChapterMark";
import ContributionMark from "./ContributionMark";
import paper from "./Front.module.css";
import styles from "./Encounter.module.css";

// A fixed brush impression gives the settled composition its complete form
// before hydration. Its mask reveals the same material during the live beat.
const circle = inkStroke(
  fitPoints(ensoPath({ seed: 33, facing: -Math.PI / 6 }), {
    x: 70,
    y: 50,
    width: 860,
    height: 900,
  }),
  {
    size: 64,
    seed: 33,
    profile: profiles.enso,
    thinning: 0.8,
    dry: 0.55,
    smoothing: 1,
    lift: 3,
    skips: false,
  },
);

export default function Line() {
  const ref = useRef<HTMLElement>(null);
  const maskId = `reflection-${useId().replace(/:/g, "")}`;

  useBeat(ref, (root, tl) => {
    draw(tl, root.querySelector("[data-circle-reveal]"), {
      duration: 1.35,
      ease: "none",
      position: 0.2,
    });
  });

  return (
    <section ref={ref} className={styles.reflection} aria-labelledby="reason" data-thread="reason">
      <p className={paper.label} data-anchor="reason">
        <ChapterMark char="理" label="Reason" />
      </p>

      <div className={styles.reflectionMain}>
        <h2 id="reason" className={styles.question} aria-label="What remains aware when the “I” falls quiet?">
          <span className={styles.questionLead}>What remains</span>
          <em className={styles.questionCore}>aware</em>
          <span className={styles.questionTail}>when the “I” falls quiet?</span>
        </h2>

        <div className={styles.reflectionField} data-anchor="reflection-field">
          <svg
            className={styles.circle}
            viewBox="0 0 1000 1000"
            aria-hidden="true"
            focusable="false"
            data-pace={circle.pace.join(",")}
          >
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="-100" y="-100" width="1200" height="1200">
                <path
                  d={circle.center}
                  pathLength={1}
                  className={styles.ringReveal}
                  data-circle-reveal
                  fill="none"
                  stroke="#fff"
                  strokeWidth={210}
                  strokeLinecap="round"
                />
                {circle.dry.map((streak, index) => (
                  <path
                    key={index}
                    d={streak.d}
                    fill="none"
                    stroke="#000"
                    strokeWidth={streak.width}
                    strokeLinecap="round"
                  />
                ))}
              </mask>
            </defs>
            <path d={circle.outline} fill="currentColor" mask={`url(#${maskId})`} />
          </svg>
          <ContributionMark place="reflection" />
        </div>
      </div>

      <div className={styles.reflectionReading}>
        <p className={styles.belief}>
          I believe imagination participates in the making of reality.
        </p>
        <p className={styles.reflectionNote}>
          I can observe the person I call myself. I keep asking what it means
          to live from that awareness.
        </p>
      </div>
    </section>
  );
}
