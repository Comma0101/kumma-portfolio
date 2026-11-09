import Link from "next/link";
import Image from "next/image";
import Shell from "./Shell";
import styles from "./Work.module.css";

// Art gets an image-led entrance. The system write-ups retain their decisions.
const work = [
  {
    id: "kota",
    name: "KOTA",
    description:
      "A restaurant phone call becomes a menu-verified kitchen ticket. Streaming speech, item extraction, and confirmation carry the order from conversation to the kitchen.",
    decision:
      "Check each item against the live menu and ask for clarification before committing an uncertain order.",
    href: "/work/kota",
  },
  {
    id: "archon",
    name: "ARCHON",
    description:
      "A multi-step task becomes a run across models, tools, and coding agents. Sessions, jobs, and execution turns keep the work and its reasoning trace inspectable.",
    decision:
      "Choose a model or worker for each task, rather than hardwiring the agent to one provider.",
    href: "/work/archon",
  },
  {
    id: "audiobook",
    name: "Audiobook AI",
    description:
      "PDFs, EPUBs, Word documents, web pages, and pasted text become narrated chapters with MP3 audio and subtitle cues.",
    decision:
      "Split text at sentence boundaries before synthesis, with safe punctuation as a fallback for longer spans.",
    href: "/work/audiobook",
  },
  {
    id: "ledger",
    name: "Trade ledger",
    description:
      "A brokerage CSV becomes a per-trade profit-and-loss record. Buy and sell fills are paired before the table and charts read the results.",
    decision:
      "Match stock lots in FIFO order and option fills by full contract, keeping unclosed quantities in the ledger.",
    href: "/work/robinhood-dashboard",
  },
];

export default function Work() {
  return (
    <Shell mainClassName={styles.body}>
      <header className={styles.introduction}>
        <h1 className={styles.title}>Work.</h1>
        <svg className={styles.horizon} viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d="M2 7 C 220 5.6, 460 8.2, 700 6.4 S 930 5.4, 998 6" />
        </svg>
        <p className={styles.lede}>
          Software, visual experiments, and the decisions that shape them.
        </p>
      </header>

      <article className={styles.artwork} aria-labelledby="work-map-art">
        <Link href="/work/map-art" className={styles.artworkLink} aria-labelledby="work-map-art">
          <div className={styles.artworkCopy}>
            <h2 id="work-map-art" className={styles.artworkTitle}>Map Art <span aria-hidden="true">→</span></h2>
            <p>Places we have called home, and the histories that overlap through them.</p>
            <span className={styles.artworkAction}>View the two studies</span>
          </div>
          <Image
            className={styles.artworkImage}
            src="/art/map-art/one-life.webp"
            width={1200}
            height={1200}
            alt="Amsterdam and Los Angeles street drawings overlap in red and black ink."
            sizes="(max-width: 760px) 100vw, 60vw"
            priority
          />
        </Link>
      </article>

      <ul className={styles.list} role="list">
        {work.map((item) => (
          <li key={item.href}>
            <article className={styles.project} aria-labelledby={`work-${item.id}`}>
              <h2 id={`work-${item.id}`} className={styles.projectTitle}>
                <Link href={item.href} className={styles.projectLink}>
                  <span>{item.name}</span>
                  <span className={styles.arrow} aria-hidden="true">→</span>
                </Link>
              </h2>
              <div className={styles.projectCopy}>
                <p className={styles.description}>{item.description}</p>
                <p className={styles.decision}>
                  <span className={styles.decisionLabel}>The decision.</span>{" "}
                  {item.decision}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
