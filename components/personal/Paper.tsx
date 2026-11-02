import type { ReactNode } from "react";
import Shell from "./Shell";
import styles from "./Pages.module.css";

// The older pages (the case studies, the demo, the benchmark) on the
// homepage's paper: their own layouts, with the dark site's tokens re-cut
// for ink on paper and the type swapped for the homepage's.
export default function Paper({ children }: { children: ReactNode }) {
  return (
    <Shell mainClassName={styles.paperMain}>
      <div className={styles.paperInk}>{children}</div>
    </Shell>
  );
}
