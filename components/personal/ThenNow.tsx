"use client";

import { useRef } from "react";
import { useBeat } from "./useBeat";
import styles from "./Front.module.css";

// An ongoing tension and a response: the reflection is set in grey;
// the commitment arrives in ink a moment later. With `waitFor`, the
// response waits for an act instead (主: the reader's strike).
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
