import Link from "next/link";
import Elsewhere from "./Elsewhere";
import { chapters } from "./chapters";
import styles from "./Front.module.css";

// After 道, only the quiet things: the page's eight chapters, how it was
// made, where else to go, and where it comes from.
export default function Colophon() {
  return (
    <footer className={styles.colophonBlock}>
      <nav className={styles.chapters} aria-label="Chapters" lang="zh-Hant">
        {chapters.map((chapter) => (
          <a key={chapter.id} href={`#${chapter.id}`} title={chapter.label} aria-label={chapter.label}>
            {chapter.mark}
          </a>
        ))}
      </nav>
      <p className={styles.howDrawn}>
        A life in eight characters, and one line through them — drawn once, while you watch, by a hand that
        cannot erase. <Link href="/studies">How it is drawn →</Link>
      </p>
      <Elsewhere />
      <p className={styles.colophon}>
        <span>Los Angeles</span>
        <span>© {new Date().getFullYear()} Kumma Wu</span>
      </p>
    </footer>
  );
}
