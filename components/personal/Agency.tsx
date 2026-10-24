"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { anchor } from "./anchors";
import { handLine } from "./pen";
import { draw, reveal, useBeat } from "./useBeat";
import styles from "./Front.module.css";

// 主: agency is an edit. One decisive stroke through the reflex — the
// pen strikes "Re" and leaves "acting." The struck letters stay on the
// paper, faded: a hand that cannot erase, only decide.
const strike: Trace = (_, host) => {
  const re = anchor(host, "re");
  if (!re) return { points: [] };
  // Across the letters' middle, rising a little as a hand does.
  const y = re.y + re.height * 0.5;
  return {
    points: handLine([re.x - re.height * 0.06, y + 4], [re.x + re.width + re.height * 0.08, y - 6], 31, 0.5),
    size: Math.max(4, re.height * 0.075),
    emphasis: [{ from: 0, to: 1, weight: 1.4 }],
  };
};

export default function Agency() {
  const ref = useRef<HTMLElement>(null);

  // A beat after the word arrives, the stroke — quick, like a decision —
  // then the reflex fades under it and the gloss is written.
  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "strike"), { duration: 0.42, ease: "power2.in", position: 0.6 });
    tl.to(root.querySelector("[data-struck]"), { opacity: 0.16, duration: 0.7, ease: "power1.out" }, ">0.05");
    tl.set(root.querySelector("[data-source]"), { visibility: "visible" }, ">0.1");
  });

  return (
    <section ref={ref} className={styles.agency} aria-labelledby="agency" data-thread="agency">
      <p className={styles.first}>Most of a life is reaction.</p>
      <h2 id="agency" className={styles.agencyLine}>
        <span aria-hidden="true">
          <span className={styles.struck} data-anchor="re" data-struck>
            Re
          </span>
          acting.
        </span>
        <span className="sr-only">Reacting, with “re” struck out: acting.</span>
      </h2>
      <Ink trace={strike} mark="strike" size={5} seed={31} lift={2} className={styles.thread} />
      <p className={styles.agencyGloss} data-source>
        <span lang="zh-Hant">主體</span> Agency: to be the subject of your own sentence, not its object.
      </p>
    </section>
  );
}
