"use client";

import { useRef } from "react";
import { bisect, between } from "./registration";
import { useScrub } from "./useBeat";
import ChapterMark from "./ChapterMark";
import ThenNow from "./ThenNow";
import styles from "./Front.module.css";

const lines = ["The body", "catches up."];

// The sentence is understood before it is lived: its outline is already
// there; the ink grows into it as the reader keeps going.
export default function CatchUp() {
  const ref = useRef<HTMLElement>(null);


  useScrub(
    ref,
    (root, tl) => {
      const fill = root.querySelector<HTMLElement>("[data-body]");
      const outline = fill?.previousElementSibling;
      if (!fill || !outline) return;
      const lines = Array.from(fill.children) as HTMLElement[];
      const targets = Array.from(outline.children);
      const width = (el: Element) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().width;
      };
      // For each line, the width-axis value that keeps it exactly as wide
      // as its outline at each weight: the ink grows inside the outline
      // instead of sliding out of register. Solving forces layout, so only
      // the resting weight is solved up front; the rest waits for idle time.
      const weights = [10, 55, 100, 150];
      const tables: Array<Array<[number, number]>> = lines.map(() => []);
      const solveAt = (weight: number) =>
        lines.forEach((line, i) => {
          if (tables[i].some(([w]) => w === weight)) return;
          const target = width(targets[i]);
          line.style.fontWeight = String(weight);
          const axis = bisect(
            (wdth) => {
              line.style.fontVariationSettings = `"wdth" ${wdth}`;
              return width(line);
            },
            target,
            100,
            200,
          );
          tables[i].push([weight, axis]);
          tables[i].sort((a, b) => a[0] - b[0]);
        });
      const state = { weight: 10 };
      const apply = () => {
        if (!tables[0]?.length) solveAt(10);
        lines.forEach((line, i) => {
          line.style.fontWeight = String(state.weight);
          line.style.fontVariationSettings = `"wdth" ${between(tables[i], state.weight).toFixed(2)}`;
        });
      };
      const idle =
        (window as Window & { requestIdleCallback?: (cb: () => void) => number })
          .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
      document.fonts?.ready
        .then(() => {
          apply();
          // One weight per idle slice, so no single task runs long.
          weights.slice(1).forEach((weight, k) => idle(() => window.setTimeout(() => solveAt(weight), k * 16)));
        })
        .catch(() => undefined);
      // Compounding, but readable within one scroll: slow, then sure.
      tl.fromTo(
        state,
        { weight: 10 },
        { weight: 150, ease: "power3.in", immediateRender: false, onUpdate: apply },
      );
      // What was understood gives way as it is lived: the outline fades
      // while the ink arrives, so the two are never seen out of register.
      tl.fromTo(outline, { opacity: 1 }, { opacity: 0.18, ease: "power2.out", immediateRender: false }, 0);
    },
    // The body is slower than the mind: the ink keeps filling for a moment
    // after the reader stops.
    { start: "top 70%", end: "center 35%", scrub: 1.4 },
  );

  return (
    <section ref={ref} className={styles.catchUp} aria-labelledby="catch-up" data-thread="catch">
      <p className={styles.label}>
        <ChapterMark char="知" label="Understanding" />
      </p>
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
      <ThenNow
        then="I can understand an idea and still meet the same situation with an old response."
        now="I return to that gap through practice: noticing what I do, trying again, and letting experience revise what I thought I knew."
      />
    </section>
  );
}
