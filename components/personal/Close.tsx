"use client";

import { useRef } from "react";
import Pen from "./Pen";
import { underline } from "./pen";
import { draw, useBeat } from "./useBeat";
import { X_HANDLE, X_URL } from "./links";
import styles from "./Front.module.css";

const line = underline({ seed: 77, y: 55 });

const creed = [
  { lead: "I let", word: "presence", tail: "be my center," },
  { lead: "", word: "reason", tail: "be my compass," },
  { lead: "and", word: "emotion", tail: "be my light" },
];

export default function Close() {
  const ref = useRef<HTMLElement>(null);

  useBeat(ref, (root, tl) => {
    // Each word steps into its place; the last full stop lights.
    tl.fromTo(
      root.querySelectorAll("[data-step]"),
      { opacity: 0, yPercent: 40 },
      { opacity: 1, yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.45 },
      0,
    );
    tl.fromTo(
      root.querySelector("[data-light]"),
      { scale: 0, backgroundColor: "#141414" },
      { scale: 1, backgroundColor: "#a3121b", duration: 0.5, ease: "back.out(3)" },
      ">0.1",
    );
    draw(tl, root.querySelector("[data-pen]"), 0.7, ">0.2");
  });

  return (
    <footer ref={ref} className={styles.close}>
      <p className={styles.creed}>
        {creed.map((part) => (
          <span key={part.word} className={styles.creedPart} data-step>
            {part.lead && <span className={styles.quiet}>{part.lead} </span>}
            <span className={styles.keyword}>{part.word}</span>{" "}
            <span className={styles.quiet}>{part.tail}</span>
            {part.word === "emotion" && (
              <>
                <span className={styles.stop} data-light aria-hidden="true" />
                <span className="sr-only">.</span>
              </>
            )}
          </span>
        ))}
      </p>

      <a className={styles.followBig} href={X_URL} rel="me">
        Follow on X
        <Pen d={line} className={styles.followLine} />
      </a>

      <p className={styles.colophon}>
        <span>{X_HANDLE}</span>
        <span>Los Angeles</span>
        <span>© {new Date().getFullYear()} Kumma Wu</span>
      </p>
    </footer>
  );
}
