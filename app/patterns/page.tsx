import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import styles from "@/styles/patterns.module.css";

export const metadata: Metadata = {
  title: "Patterns",
  description:
    "An engineering pattern library for real-time voice AI: barge-in, endpointing, VAD tuning, streaming STT, grounding, handoff, telephony failure modes, evals, and latency budgets.",
  openGraph: {
    title: "Patterns | Kumma",
    description:
      "An engineering pattern library for real-time voice agents — the recurring problems and the mechanisms that fix them.",
    url: "https://kumma.me/patterns",
    type: "website",
  },
  alternates: { canonical: "https://kumma.me/patterns" },
};

type Pattern = {
  index: string;
  title: string;
  blurb: string;
  slug?: string; // present only when the page is written
};

// The 10 planned patterns. Only entries with a `slug` are written and linked;
// the rest are marked "coming" and carry no fabricated content.
const patterns: Pattern[] = [
  {
    index: "01",
    title: "Barge-in",
    blurb:
      "Treat the interrupt as a state transition: when the caller talks over the agent, cancel and flush in-flight TTS, then resume with context intact.",
    slug: "barge-in",
  },
  {
    index: "02",
    title: "Endpointing and turn detection",
    blurb:
      "Decide when the caller has finished a turn without cutting off slow speakers or adding dead air. Silence timers are a starting point, not the answer.",
    slug: "endpointing",
  },
  {
    index: "03",
    title: "VAD tuning",
    blurb:
      "Setting voice-activity thresholds and hangover windows so background noise does not register as speech and soft talkers do not get dropped.",
    slug: "vad-tuning",
  },
  {
    index: "04",
    title: "Streaming STT selection",
    blurb:
      "Choosing a streaming speech-to-text path on partial-transcript stability, endpoint signals, and phone-band audio rather than headline accuracy.",
    slug: "streaming-stt",
  },
  {
    index: "05",
    title: "Menu and domain grounding",
    blurb:
      "Constraining the model to a real menu or catalog so it resolves what the caller said to items that exist, instead of inventing plausible ones.",
    slug: "menu-grounding",
  },
  {
    index: "06",
    title: "Clarify-before-commit guardrails",
    blurb:
      "Forcing a confirmation step before any irreversible action, so a low-confidence transcript never books, charges, or cancels on its own.",
    slug: "clarify-before-commit",
  },
  {
    index: "07",
    title: "Human handoff design",
    blurb:
      "Detecting when the agent is out of its depth and transferring to a person with the transcript and intent carried across the boundary.",
    slug: "human-handoff",
  },
  {
    index: "08",
    title: "Telephony failure modes",
    blurb:
      "The failure surface of SIP and Twilio: one-way audio, dropped media, DTMF collisions, and reconnection when a leg goes silent mid-call.",
    slug: "telephony-failure-modes",
  },
  {
    index: "09",
    title: "Voice eval harness design",
    blurb:
      "Replaying recorded calls and synthetic turns through the pipeline so a change to a prompt or timer is measured, not guessed at.",
    slug: "eval-harness",
  },
  {
    index: "10",
    title: "Latency budgets",
    blurb:
      "Accounting for every millisecond from end-of-speech to first audio out across VAD, STT, model, and TTS so the turn feels like a conversation.",
    slug: "latency-budgets",
  },
];

const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Voice AI engineering patterns",
  description:
    "An engineering pattern library for building real-time voice agents that run in production.",
  url: "https://kumma.me/patterns",
  isPartOf: { "@type": "WebSite", name: "Kumma", url: "https://kumma.me" },
  hasPart: patterns
    .filter((p) => p.slug)
    .map((p) => ({
      "@type": "TechArticle",
      name: p.title,
      url: `https://kumma.me/patterns/${p.slug}`,
    })),
};

export default function PatternsPage() {
  return (
    <>
      <JsonLd data={collectionLd} />
      <main className={styles.page}>
        <div className={styles.indexWrapper}>
          <header className={styles.indexHeader}>
            <p className={styles.eyebrow}>Pattern library</p>
            <h1 className={styles.indexTitle}>Patterns for real-time voice agents</h1>
            <p className={styles.indexIntro}>
              The recurring problems in building phone-grade voice AI, and the
              mechanisms that solve them. Each note frames a problem, its failure
              modes, and implementation notes drawn from systems that run live on
              a call.
            </p>
          </header>

          <div className={styles.patternGrid}>
            {patterns.map((p) =>
              p.slug ? (
                <Link
                  key={p.index}
                  href={`/patterns/${p.slug}`}
                  className={`${styles.patternCard} ${styles.patternCardWritten}`}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.cardIndex}>{p.index}</span>
                    <span className={styles.statusWritten}>Written</span>
                  </div>
                  <h2 className={styles.cardTitle}>{p.title}</h2>
                  <p className={styles.cardBlurb}>{p.blurb}</p>
                  <span className={styles.cardArrow}>Read the note &rarr;</span>
                </Link>
              ) : (
                <div
                  key={p.index}
                  className={`${styles.patternCard} ${styles.patternCardComing}`}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.cardIndex}>{p.index}</span>
                    <span className={styles.statusComing}>Coming</span>
                  </div>
                  <h2 className={styles.cardTitle}>{p.title}</h2>
                  <p className={styles.cardBlurb}>{p.blurb}</p>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </>
  );
}
