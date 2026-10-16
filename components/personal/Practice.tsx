import Link from "next/link";
import styles from "./Front.module.css";

const practice = [
  { word: "Trade", line: "Options. A craft, not a casino." },
  {
    word: "Build",
    line: "Software as leverage: voice agents, tools, systems.",
    href: "/projects",
    cta: "Systems I build",
  },
  {
    word: "Study",
    line: "Old texts, read slowly: the Diamond Sutra, the Daodejing, Zhuangzi, the Gospels, the Greeks.",
  },
  { word: "Draw", line: "Bamboo, geometry, negative space." },
];

export default function Practice() {
  return (
    <section className={styles.practice} aria-labelledby="practice" data-thread="practice">
      <h2 id="practice" className={styles.label}>
        Practice
      </h2>
      <ol>
        {practice.map((item, index) => (
          <li key={item.word}>
            <span className={styles.index} data-anchor={`tick-${index}`}>
              0{index + 1}
            </span>
            <span className={styles.practiceWord}>{item.word}</span>
            <span className={styles.practiceLine}>{item.line}</span>
            {item.href && (
              <Link href={item.href} className={styles.practiceLink}>
                {item.cta} →
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
