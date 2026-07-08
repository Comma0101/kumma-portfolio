import { ReactNode } from "react";
import base from "@/styles/build.module.css";
import styles from "@/styles/latency.module.css";

// The fixed method every monthly report follows. This describes how each run
// is set up — it is not measured data. No latency figures live on this page
// until the first report publishes.
const methodology: { term: string; value: ReactNode }[] = [
  {
    term: "Primary metric",
    value: (
      <>
        Turn latency at <b>p50</b> and <b>p95</b>.
      </>
    ),
  },
  {
    term: "Measured from",
    value: "The moment the user stops speaking to the first audio byte back.",
  },
  {
    term: "Also captured",
    value: "Barge-in response time and call-setup time.",
  },
  {
    term: "Stacks covered",
    value: "The major hosted voice stacks.",
  },
  {
    term: "Sample size",
    value: (
      <>
        <b>30 calls</b> per stack (N = 30).
      </>
    ),
  },
  {
    term: "Prompt set",
    value: "One identical prompt set, reused across every stack.",
  },
  {
    term: "Raw data",
    value: "A raw CSV published alongside each report.",
  },
  {
    term: "Cadence",
    value: "Published the same calendar day each month.",
  },
];

export default function LatencyPage() {
  return (
    <div className={base.page}>
      <main id="top">
        {/* Hero */}
        <section className={`${base.hero} ${base.shell}`}>
          <p className={base.eyebrow}>Monthly latency report</p>
          <h1 className={base.title}>Voice stack latency report</h1>
          <p className={base.subtitle}>
            Each month I measure turn latency across the major hosted voice
            stacks under one identical prompt set, then publish the results with
            the raw CSV. This page is the index.
          </p>
        </section>

        {/* Methodology — fixed method, not measured data */}
        <section className={`${base.section} ${base.shell}`}>
          <h2 className={base.h2}>How it is measured</h2>
          <p className={`${base.subtitle} ${styles.lead}`}>
            This is the fixed method every report follows. The rows below
            describe how a run is set up, not any measured result.
          </p>
          <dl className={styles.spec}>
            {methodology.map((row) => (
              <div key={row.term} className={styles.specRow}>
                <dt className={styles.specTerm}>{row.term}</dt>
                <dd className={styles.specValue}>{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className={base.note}>
            No measurements are published yet. Nothing here is estimated or
            modeled.
          </p>
        </section>

        {/* Reports index — empty, awaiting first report */}
        <section className={`${base.section} ${base.shell}`}>
          <h2 className={base.h2}>Reports</h2>
          <div className={styles.awaiting}>
            <span className={styles.awaitingTag}>
              <span className={styles.awaitingDot} aria-hidden="true" />
              Awaiting first report
            </span>
            <p className={styles.awaitingTitle}>The first report publishes soon</p>
            <p className={styles.awaitingBody}>
              Reports will appear here newest first, each linked to its raw CSV.
              The first run is being prepared. Come back on publish day to read
              it.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
