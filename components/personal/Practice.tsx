"use client";

import Link from "next/link";
import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { threadX } from "./anchors";
import { handLine } from "./pen";
import { draw, reveal, useBeat } from "./useBeat";
import styles from "./Front.module.css";

const margin: Trace = ({ height }, host) => ({
  points: handLine([threadX(host), -2], [threadX(host), height + 2], 81, 0.5),
});

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
  const ref = useRef<HTMLElement>(null);
  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "practice-margin"), { duration: 1.6, position: 0 });
  });

  return (
    <section ref={ref} className={styles.practice} aria-labelledby="practice">
      <Ink trace={margin} mark="practice-margin" size={2.2} seed={81} className={styles.thread} />
      <h2 id="practice" className={styles.label}>
        Practice
      </h2>
      <ol>
        {practice.map((item, index) => (
          <li key={item.word}>
            <span className={styles.index}>0{index + 1}</span>
            <span className={styles.practiceWord}>{item.word}</span>
            <span className={styles.practiceLine}>
              {item.line}
              {item.href && (
                <Link href={item.href} className={styles.practiceLink}>
                  {item.cta} →
                </Link>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
