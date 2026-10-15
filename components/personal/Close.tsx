"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { handLine } from "./pen";
import { draw, ease, reveal, useBeat } from "./useBeat";
import Elsewhere from "./Elsewhere";
import { X_HANDLE, X_URL } from "./links";
import styles from "./Front.module.css";

const underline: Trace = ({ width, height }) => ({
  points: handLine([0, height * 0.5], [width, height * 0.5 - 4], 77, 0.7),
});

export default function Close() {
  const ref = useRef<HTMLElement>(null);

  // The pen's last two marks: the full stop, then the line under the action.
  useBeat(ref, (root, tl) => {
    tl.fromTo(
      root.querySelector("[data-light]"),
      { scale: 0 },
      { scale: 1, duration: 0.45, ease: ease.impulse },
      0.3,
    );
    draw(tl, reveal(root, "follow"), { duration: 0.8, position: ">0.25" });
  });

  return (
    <footer ref={ref} className={styles.close}>
      <p className={styles.creed}>
        I let <b>presence</b> be my center, <b>reason</b> be my compass, and{" "}
        <b>emotion</b> be my light
        <span className={styles.stop} data-light aria-hidden="true" />
        <span className="sr-only">.</span>
      </p>

      <a className={styles.followBig} href={X_URL} rel="me">
        Follow on X
        <Ink trace={underline} mark="follow" size={3.4} seed={77} className={styles.followLine} />
      </a>

      <Elsewhere />

      <p className={styles.colophon}>
        <span>{X_HANDLE}</span>
        <span>Los Angeles</span>
        <span>© {new Date().getFullYear()} Kumma Wu</span>
      </p>
    </footer>
  );
}
