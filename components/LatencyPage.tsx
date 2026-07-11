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

// Published third-party component latencies — vendor or independent-benchmark
// figures, each cited. These are NOT measurements of this line; they are the
// on-paper starting point the measured monthly report will replace.
const referenceBudget: { term: string; value: ReactNode }[] = [
  {
    term: "Human turn gap",
    value: (
      <>
        ~200ms is natural, comfortable under ~500ms (
        <a
          href="https://prodinit.com/blog/production-voice-ai-agents-latency-architecture"
          target="_blank"
          rel="noopener noreferrer"
        >
          Prodinit
        </a>
        ).
      </>
    ),
  },
  {
    term: "Deepgram STT (Nova-3)",
    value: (
      <>
        First token ~150ms in the US, sub-300ms streaming (
        <a
          href="https://deepgram.com/learn/introducing-nova-3-speech-to-text-api"
          target="_blank"
          rel="noopener noreferrer"
        >
          Deepgram
        </a>
        ).
      </>
    ),
  },
  {
    term: "LLM first token",
    value: (
      <>
        ~100–180ms on fast models, 300–500ms common (
        <a
          href="https://introl.com/blog/voice-ai-infrastructure-real-time-speech-agents-asr-tts-guide-2025"
          target="_blank"
          rel="noopener noreferrer"
        >
          Introl
        </a>
        ).
      </>
    ),
  },
  {
    term: "TTS first audio",
    value: (
      <>
        ~40–90ms vendor targets, ~190–310ms measured P50 (
        <a
          href="https://gradium.ai/content/tts-latency-benchmark-2026"
          target="_blank"
          rel="noopener noreferrer"
        >
          Gradium
        </a>
        ).
      </>
    ),
  },
  {
    term: "Telephony / network",
    value: (
      <>
        20–40ms WebRTC; Twilio targets sub-600ms end to end (
        <a
          href="https://www.twilio.com/en-us/blog/developers/best-practices/guide-core-latency-ai-voice-agents"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twilio
        </a>
        ).
      </>
    ),
  },
];

export default function LatencyPage() {
  return (
    <div className={base.page}>
      <div id="top">
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

        {/* Reference budget — published third-party figures, cited. Not ours. */}
        <section className={`${base.section} ${base.shell}`}>
          <h2 className={base.h2}>Reference budget, from published figures</h2>
          <p className={`${base.subtitle} ${styles.lead}`}>
            Until the first measured report lands, here is what the stack costs
            on paper. Each stage below is a latency figure published by the
            vendor or an independent benchmark, cited. These are third-party
            numbers, not measurements of my line, and they are the starting
            point the monthly report will replace with measured ones. The full
            breakdown, and why the naive sum is a trap, is in{" "}
            <a href="/blog/en/latency-budget-twilio-deepgram-voice-agent">
              the latency-budget note
            </a>
            .
          </p>
          <dl className={styles.spec}>
            {referenceBudget.map((row) => (
              <div key={row.term} className={styles.specRow}>
                <dt className={styles.specTerm}>{row.term}</dt>
                <dd className={styles.specValue}>{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className={base.note}>
            Published third-party figures, cited. Not measured on this line.
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
      </div>
    </div>
  );
}
