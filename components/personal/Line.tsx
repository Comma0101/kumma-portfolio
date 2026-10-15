"use client";

import { useRef } from "react";
import Pen from "./Pen";
import { scribble } from "./pen";
import { draw, useBeat } from "./useBeat";
import styles from "./Front.module.css";

const veil = scribble({ seed: 31, passes: 9, axis: "y" });

// Kumārajīva, Taishō T235, CBETA punctuation (see research_notes).
// Four clauses, four columns, read right to left.
export default function Line() {
  const ref = useRef<HTMLElement>(null);

  useBeat(ref, (root, tl) => {
    const columns = Array.from(root.querySelectorAll("[data-ink]"));
    const ink = (column: Element | undefined, position: gsap.Position) =>
      column &&
      tl.fromTo(
        column,
        // Reveal downward like a brush; the sides stay open for the pen.
        { clipPath: "inset(-6% -60% 106% -60%)" },
        { clipPath: "inset(-6% -60% -6% -60%)", duration: 0.85, ease: "power2.inOut" },
        position,
      );
    ink(columns[0], 0);
    ink(columns[1], ">-0.2");
    // Form is called illusion: the pen scribbles the whole clause out.
    draw(tl, root.querySelector("[data-pen]"), 1, ">0.1");
    ink(columns[2], ">0.25");
    ink(columns[3], ">-0.1");
    tl.fromTo(
      root.querySelector("[data-gloss]"),
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
      ">0.2",
    );
  });

  return (
    <section ref={ref} className={styles.line} aria-label="Diamond Sutra">
      <p className={styles.label} aria-hidden="true">
        The line
      </p>
      <p className={styles.sutra} lang="zh-Hant">
        <span className={styles.column} data-ink>
          凡所有相，
        </span>
        <span className={`${styles.column} ${styles.veiled}`} data-ink>
          皆是虛妄；
          <Pen d={veil} className={styles.veil} />
        </span>
        <span className={styles.column} data-ink>
          若見諸相非相，
        </span>
        <span className={`${styles.column} ${styles.seen}`} data-ink>
          則見如來。
        </span>
      </p>
      <div className={styles.gloss} data-gloss>
        <p>
          All that has form is illusion. See form as no-form, and you see what is
          truly so.
        </p>
        <cite>Diamond Sutra · Kumārajīva</cite>
      </div>
    </section>
  );
}
