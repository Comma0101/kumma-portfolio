"use client";

import { useRef } from "react";
import { useBeat } from "./useBeat";
import styles from "./Front.module.css";

// A chapter's before and after, in his words: the past set in grey; the
// present arrives in ink a moment later, as the chapter is lived. With
// `waitFor`, the present waits for an act instead (主: the reader's strike).
export default function ThenNow({ then, now, waitFor }: { then: string; now: string; waitFor?: "act" }) {
  const ref = useRef<HTMLDivElement>(null);
  useBeat(ref, (root, tl) => {
    if (waitFor) return;
    tl.to(root.querySelector("[data-now]"), { opacity: 1, duration: 1.1, ease: "power1.out" }, 1.1);
  });
  return (
    <div ref={ref} className={styles.thenNow}>
      <p className={styles.then}>{then}</p>
      <p className={styles.now} data-now>
        {now}
      </p>
    </div>
  );
}
