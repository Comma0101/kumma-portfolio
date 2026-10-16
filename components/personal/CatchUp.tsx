"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { threadX } from "./anchors";
import { handLine } from "./pen";
import { bisect, between } from "./registration";
import { draw, reveal, useBeat, useScrub } from "./useBeat";
import styles from "./Front.module.css";

const margin: Trace = ({ height }, host) => ({
  points: handLine([threadX(host), -2], [threadX(host), height + 2], 61, 0.5),
});

const lines = ["The body", "catches up."];

// The sentence is understood before it is lived: its outline is already
// there; the ink grows into it as the reader keeps going.
export default function CatchUp() {
  const ref = useRef<HTMLElement>(null);

  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "catch-margin"), { duration: 1.4, position: 0 });
  });

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
      // instead of sliding out of register.
      let tables: Array<Array<[number, number]>> | null = null;
      const solve = () =>
        lines.map((line, i) => {
          const target = width(targets[i]);
          return [100, 280, 460, 640, 820].map((weight): [number, number] => {
            line.style.fontWeight = String(weight);
            const axis = bisect(
              (wdth) => {
                line.style.fontVariationSettings = `"wdth" ${wdth}`;
                return width(line);
              },
              target,
              62,
              125,
            );
            return [weight, axis];
          });
        });
      const state = { weight: 100 };
      const apply = () => {
        tables ??= solve();
        lines.forEach((line, i) => {
          line.style.fontWeight = String(state.weight);
          line.style.fontVariationSettings = `"wdth" ${between(tables![i], state.weight).toFixed(2)}`;
        });
      };
      document.fonts?.ready.then(apply).catch(() => undefined);
      // Compounding, but readable within one scroll: slow, then sure.
      tl.fromTo(
        state,
        { weight: 100 },
        { weight: 820, ease: "power3.in", immediateRender: false, onUpdate: apply },
      );
    },
    { start: "top 75%", end: "center 40%" },
  );

  return (
    <section ref={ref} className={styles.catchUp} aria-labelledby="catch-up">
      <Ink trace={margin} mark="catch-margin" size={2.2} seed={61} className={styles.thread} />
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
    </section>
  );
}
