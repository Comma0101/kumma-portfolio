"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { fitPoints, scribble } from "./pen";
import { draw, ease, reveal, useBeat, useScrub } from "./useBeat";
import { X_HANDLE, X_URL } from "./links";
import styles from "./Front.module.css";

const tangle: Trace = ({ width, height }) => ({
  points: fitPoints(scribble({ seed: 11, passes: 7 }), { x: 0, y: 0, width, height }),
});

export default function Opening() {
  const ref = useRef<HTMLElement>(null);

  // Noise → focus: the tangle is drawn at hand speed and the pen lifts
  // it; the one taut line it leaves is the start of the thread (Thread).
  useBeat(ref, (root, tl) => {
    // First visit only: the pen sets down where the underline will start.
    const landing = root.querySelector("[data-landing]");
    let seen = false;
    try {
      seen = localStorage.getItem("kumma:landed") === "1";
      localStorage.setItem("kumma:landed", "1");
    } catch {
      // storage unavailable: treat as a first visit
    }
    if (landing) {
      if (seen) tl.set(landing, { scale: 1 }, 0);
      else tl.fromTo(landing, { scale: 0 }, { scale: 1, duration: 0.35, ease: ease.impulse }, 0);
    }
    const noise = reveal(root, "tangle");
    // Drawn, held at its densest, then pulled away; the underline snaps
    // taut as it goes (Thread waits for this).
    draw(tl, noise, { duration: 1, position: seen ? 0.1 : 0.55 });
    draw(tl, noise, { from: 1, to: 2, duration: 0.4, ease: "power2.in", position: ">0.2" });
    tl.call(
      () => {
        root.dispatchEvent(new CustomEvent("kumma:lifted", { bubbles: true }));
      },
      [],
      "<0.3",
    );
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
    <section ref={ref} className={styles.opening} aria-labelledby="name" data-thread="opening">
      <a className={styles.follow} href={X_URL} rel="me">
        Follow <span>{X_HANDLE}</span> ↗
      </a>

      <h1 id="name" className={styles.name} data-anchor="name">
        Kumma
        <span className={styles.landing} data-landing aria-hidden="true" />
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

    </section>
  );
}
