import Link from "next/link";
import type { ReactNode } from "react";
import { X_HANDLE, X_URL } from "./links";
import { typeClasses } from "./type";
import styles from "./Front.module.css";

// The inner pages' paper: the name small at the top as the way home, the
// follow beside it, and the colophon under the page.
export default function Shell({
  children,
  className,
  mainClassName,
  lang,
}: {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  lang?: string;
}) {
  return (
    <div className={`${styles.front} ${styles.workPage} ${typeClasses} ${className ?? ""}`} lang={lang}>
      <header className={styles.workHead}>
        <Link href="/" className={styles.workHome}>
          Kumma
        </Link>
        <a className={styles.follow} href={X_URL} rel="me">
          Follow <span>{X_HANDLE}</span> ↗
        </a>
      </header>

      {/* The layout already provides the page's <main>. */}
      <div className={mainClassName ?? styles.workBody}>{children}</div>

      <footer className={styles.colophonBlock}>
        <p className={styles.colophon}>
          <Link href="/">← Kumma</Link>
          <span>Los Angeles</span>
          <span>© {new Date().getFullYear()} Kumma Wu</span>
        </p>
      </footer>
    </div>
  );
}
