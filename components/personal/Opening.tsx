"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { anchor, threadX } from "./anchors";
import { fitPoints, handLine, scribble, type Point } from "./pen";
import { draw, ease, reveal, split, useBeat, useScrub } from "./useBeat";
import { X_HANDLE, X_URL } from "./links";
import styles from "./Front.module.css";

const tangle: Trace = ({ width, height }) => ({
  points: fitPoints(scribble({ seed: 11, passes: 7 }), { x: 0, y: 0, width, height }),
});

// The underline the tangle pulls taut into, then the line leaves: down the
// right edge, under everything, to the margin where the next section
// picks it up.
const thread: Trace = ({ width, height }, host) => {
  const name = anchor(host, "name");
  if (!name) return { points: [] };
  const y = name.y + name.height * 0.98;
  const left: Point = [name.x - 4, y];
  const right: Point = [name.x + name.width + 6, y - 5];
  const edge = width - Math.max(14, width * 0.018);
  const floor = height - 22;
  const underline = handLine(left, right, 3, 0.6);
  const points = [
    ...underline,
    ...handLine(right, [edge, y + 60], 5).slice(1),
    ...handLine([edge, y + 60], [edge - 8, floor - 40], 6).slice(1),
    ...handLine([edge - 8, floor - 40], [width * 0.55, floor], 7).slice(1),
    ...handLine([width * 0.55, floor], [threadX(host) + 30, floor + 6], 8).slice(1),
    ...handLine([threadX(host) + 30, floor + 6], [threadX(host), height + 2], 9).slice(1),
  ];
  return { points, split: underline.length - 1 };
};

export default function Opening() {
  const ref = useRef<HTMLElement>(null);

  // Noise → focus: the tangle is drawn at hand speed, the pen lifts it,
  // and one taut line is left; then the line walks off down the page.
  useBeat(ref, (root, tl) => {
    const noise = reveal(root, "tangle");
    const line = reveal(root, "thread");
    draw(tl, noise, { duration: 1.15, position: 0.2 });
    draw(tl, noise, { from: 1, to: 2, duration: 0.5, ease: "power2.in", position: ">0.1" });
    draw(tl, line, { to: () => split(root, "thread"), duration: 0.45, ease: ease.impulse, position: "<0.2" });
    draw(tl, line, { from: () => split(root, "thread"), duration: 1.8, position: ">0.35" });
  });

  // Attention compounds with the reader's own attention: nothing for most
  // of the first scroll, then all at once.
  useScrub(
    ref,
    (root, tl) => {
      tl.fromTo(
        root.querySelector("[data-compound]"),
        { "--wdth": 75, "--wght": 300 },
        { "--wdth": 125, "--wght": 880, ease: ease.compound },
      );
    },
    { start: "top top", end: "+=55%" },
  );

  return (
    <section ref={ref} className={styles.opening} aria-labelledby="name">
      <a className={styles.follow} href={X_URL} rel="me">
        Follow <span>{X_HANDLE}</span> ↗
      </a>

      <h1 id="name" className={styles.name} data-anchor="name">
        Kumma
        <Ink trace={tangle} mark="tangle" size={2.4} seed={11} className={styles.nameNoise} />
      </h1>

      <figure className={styles.portrait}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kumma/portrait.jpg" alt="Kumma Wu, black and white portrait" width={400} height={400} />
      </figure>

      <div className={styles.bio}>
        <p>In the gym most days. Trading options.</p>
        <p className={styles.attention}>
          Attention goes where it{" "}
          <span className={styles.compound} data-compound>
            compounds.
          </span>
        </p>
      </div>

      <Ink trace={thread} mark="thread" size={3.2} seed={3} className={styles.thread} />
    </section>
  );
}
