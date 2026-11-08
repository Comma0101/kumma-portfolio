"use client";

import Link from "next/link";
import { useRef } from "react";
import { centerline } from "./ink";
import { coil, type Point } from "./pen";
import { ease, useBeat } from "./useBeat";
import { X_HANDLE, X_URL } from "./links";
import Portrait from "./Portrait";
import ChapterMark from "./ChapterMark";
import styles from "./Front.module.css";

// The underline before it is pulled taut: a loose coil along its path,
// from the landing point to past the name, rising into the name's lower
// half. In the name's own pixels, the same ends the thread uses (Thread).
function slack(name: HTMLElement, tension: number) {
  const box = name.getBoundingClientRect();
  const dot = name.querySelector("[data-landing]")?.getBoundingClientRect();
  const y = box.height * 0.98;
  const from: Point = [dot ? dot.left + dot.width / 2 - box.left : -4, y];
  const to: Point = [box.width + 6, y - 5];
  return centerline(coil(from, to, { loops: 5, depth: box.height * 0.58, tension }));
}

export default function Opening() {
  const ref = useRef<HTMLElement>(null);

  // Slack → taut: the pen lays down a loose coil along the underline, it
  // is held a moment, then pulled straight — thinning as it tightens —
  // and the taut line it becomes is the start of the thread (Thread).
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
    const name = root.querySelector<HTMLElement>("[data-anchor=\"name\"]");
    const knot = root.querySelector<SVGSVGElement>("[data-knot]");
    const path = knot?.querySelector("path");
    if (!name || !knot || !path) return;
    const pull = { tension: 0 };
    const shape = () => {
      const box = name.getBoundingClientRect();
      knot.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
      path.setAttribute("d", slack(name, pull.tension));
      // Thinning as it pulls taut: from a loose 4.4px to the line's 3px.
      path.setAttribute("stroke-width", String(4.4 - 1.4 * pull.tension));
    };
    shape();
    tl.fromTo(
      path,
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.85, ease: "power1.inOut" },
      seen ? 0.1 : 0.45,
    );
    tl.to(pull, { tension: 1, duration: 0.42, ease: "power3.in", onUpdate: shape }, ">0.15");
    // Taut: the thread's own underline takes its place on the same frame.
    tl.call(
      () => {
        root.dispatchEvent(new CustomEvent("kumma:lifted", { bubbles: true }));
      },
      [],
      ">",
    );
    tl.set(knot, { visibility: "hidden" }, ">0.04");
  });

  return (
    <section ref={ref} className={styles.opening} aria-labelledby="name" data-thread="opening">
      <div className={styles.openingLinks}>
        <nav aria-label="Main navigation">
          <Link href="/work">Work</Link>
          <Link href="/notes">Writing</Link>
          <a href="mailto:dev@kumma.me">Email</a>
        </nav>
        <a className={styles.follow} href={X_URL} rel="me" aria-label={`Follow on X: ${X_HANDLE}`}>
          Follow <span>{X_HANDLE}</span> ↗
        </a>
      </div>

      <p className={styles.label}>
        <ChapterMark char="名" label="Name" when="lifted" />
      </p>

      <h1 id="name" className={styles.name} data-anchor="name">
        Kumma
        <span className={styles.landing} data-landing aria-hidden="true" />
        <svg className={styles.knot} data-knot aria-hidden="true" focusable="false">
          <path pathLength={1} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </h1>

      {/* Under the horizon: the bio, and the face beside it. */}
      <div className={styles.below}>
        <p className={styles.kicker}>Kumma Wu · Los Angeles</p>
        <p className={styles.attention}>
          What is it
          <br />
          to be aware?
        </p>
        <div className={styles.openingNote}>
          <p>
            I believe imagination participates in the making of reality. I want
            to understand the self I observe, and let that understanding change
            how I live.
          </p>
          <p>
            I write, build software, and explore sound, movement, and imagined
            worlds. I read, train, and trade. These pages hold work and questions
            I’m still living with.
          </p>
        </div>
        <Portrait />
      </div>

    </section>
  );
}
