"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { handLine } from "./pen";
import { draw, reveal, useBeat } from "./useBeat";
import Elsewhere from "./Elsewhere";
import { X_HANDLE, X_URL } from "./links";
import styles from "./Front.module.css";

const underline: Trace = ({ width, height }) => ({
  points: handLine([0, height * 0.5], [width, height * 0.5 - 4], 77, 0.7),
});

export default function Close() {
  const ref = useRef<HTMLElement>(null);

  // The pen's last mark: the line under the action.
  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "follow"), { duration: 0.8, position: 0.2 });
  });

  return (
    <footer ref={ref} className={styles.close}>
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
