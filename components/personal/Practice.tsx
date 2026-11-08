import Link from "next/link";
import ChapterMark from "./ChapterMark";
import PracticeSheet from "./PracticeSheet";
import styles from "./Front.module.css";

const practice = [
  { word: "Train.", line: "Most days. Returning to what the body learns through doing." },
  { word: "Trade.", line: "Decisions under uncertainty, with consequences I have to accept." },
  {
    word: "Build.",
    line: "Tools, systems, and imagined worlds. Making room for both use and play.",
    href: "/work",
  },
  {
    word: "Study.",
    line: "Philosophy, religion, and history. Reading sources, comparing interpretations, and writing through my own questions.",
    href: "/notes",
  },
];

export default function Practice() {
  return (
    <section className={styles.practice} aria-labelledby="practice" data-thread="practice">
      <h2 id="practice" className={styles.label}>
        <ChapterMark char="習" label="Practice" />
      </h2>
      <ol>
        {practice.map((item, index) => (
          <li key={item.word}>
            <span className={styles.index} data-anchor={`tick-${index}`}>
              0{index + 1}
            </span>
            {/* A practice with a room of its own: the verb is the door. */}
            {item.href ? (
              <Link href={item.href} className={`${styles.practiceWord} ${styles.practiceDoor}`}>
                {item.word}
                <span className={styles.practiceArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            ) : (
              <span className={styles.practiceWord}>{item.word}</span>
            )}
            <span className={styles.practiceLine}>{item.line}</span>
          </li>
        ))}
      </ol>
      <figure className={styles.practiceExcerpt}>
        <blockquote>
          <p>
            I’ve come to realize that emotions aren’t enemies.
            They’re simply parts of ourselves—just the parts that are more
            honest, less rehearsed.
          </p>
        </blockquote>
        <figcaption>
          <cite>On Emotions</cite> · <time dateTime="2025-10-26">October 26, 2025</time>
          <Link href="/notes/on-emotions">Read the essay →</Link>
        </figcaption>
      </figure>
      <PracticeSheet />
    </section>
  );
}
