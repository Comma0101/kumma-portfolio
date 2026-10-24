import Link from "next/link";
import ChapterMark from "./ChapterMark";
import styles from "./Front.module.css";

const practice = [
  { word: "Trade.", line: "Options. A craft, not a casino." },
  {
    word: "Build.",
    line: "Software as leverage: voice agents, tools, systems.",
    href: "/work",
  },
  {
    word: "Study.",
    line: "Old texts, read slowly: the Diamond Sutra, the Daodejing, Zhuangzi, the Gospels, the Greeks.",
    href: "/notes",
  },
  { word: "Draw.", line: "Bamboo, geometry, negative space.", href: "/studies" },
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
    </section>
  );
}
