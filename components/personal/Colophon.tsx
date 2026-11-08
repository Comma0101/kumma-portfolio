import Link from "next/link";
import Elsewhere from "./Elsewhere";
import { chapters } from "./chapters";
import styles from "./Front.module.css";

// After 道, only the quiet things: the page's eight chapters, how it was
// made, where else to go, and where it comes from.
export default function Colophon() {
  return (
    <footer className={styles.colophonBlock}>
      {/* Eight personal notes, repeated here as the page's contents. */}
      <nav className={styles.contents} aria-label="Chapters">
        <ol>
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              <a href={`#${chapter.id}`}>
                <span className={styles.contentsMark} lang="zh-Hant">
                  {chapter.mark}
                </span>
                <span className={styles.contentsLabel}>{chapter.label}</span>
                <span className={styles.contentsReflection}>{chapter.reflection}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <p className={styles.howDrawn}>
        Questions, observations, and intentions.
        <br />
        The marks remain; my understanding can change.
      </p>
      <p className={styles.howDrawn}>
        <Link href="/studies">How it is drawn →</Link>
      </p>
      <Elsewhere />
      <p className={styles.colophon}>
        <span>Los Angeles</span>
        <span>© {new Date().getFullYear()} Kumma Wu</span>
      </p>
    </footer>
  );
}
