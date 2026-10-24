import Link from "next/link";
import Elsewhere from "./Elsewhere";
import { chapters } from "./chapters";
import styles from "./Front.module.css";

// After 道, only the quiet things: the page's eight chapters, how it was
// made, where else to go, and where it comes from.
export default function Colophon() {
  return (
    <footer className={styles.colophonBlock}>
      {/* The page's contents: the eight characters and what each one shows —
          the whole life again, compressed to eight lines. */}
      <nav className={styles.contents} aria-label="Chapters">
        <ol>
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              <a href={`#${chapter.id}`}>
                <span className={styles.contentsMark} lang="zh-Hant">
                  {chapter.mark}
                </span>
                <span className={styles.contentsLabel}>{chapter.label}</span>
                <span className={styles.contentsReading}>{chapter.reading}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <p className={styles.howDrawn}>
        A life in eight characters, and one line through them — drawn once, while you watch, by a hand that
        cannot erase. The readings of the characters follow the <i>Shuowen Jiezi</i>, the oldest dictionary of
        them (c. 100 CE). <Link href="/studies">How it is drawn →</Link>
      </p>
      <Elsewhere />
      <p className={styles.colophon}>
        <span>Los Angeles</span>
        <span>© {new Date().getFullYear()} Kumma Wu</span>
      </p>
    </footer>
  );
}
