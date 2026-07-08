import Link from "next/link";
import type { ReactNode } from "react";
import styles from "@/styles/patterns.module.css";

/**
 * Shared layout for a single engineering pattern page.
 *
 * Template order matches every pattern in the library:
 *   problem (two sentences) -> failure modes -> implementation notes with
 *   code -> related notes (optional) -> one-line CTA to /contact.
 *
 * The CTA is rendered automatically so every page ends the same way.
 */
export function PatternLayout({
  kicker,
  title,
  problem,
  children,
}: {
  kicker: string;
  title: string;
  problem: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className={styles.page}>
      <header className={styles.detailHeader}>
        <Link href="/patterns" className={styles.backButton}>
          &larr; Patterns
        </Link>
        <div>
          <span className={styles.badge}>{kicker}</span>
        </div>
        <h1 className={styles.detailTitle}>{title}</h1>
        <p className={styles.problem}>{problem}</p>
      </header>

      <div className={styles.body}>{children}</div>

      <footer className={styles.cta}>
        <span>Building this into a live phone agent and want a second set of eyes?</span>
        <Link href="/contact" className={styles.ctaLink}>
          Start a conversation &rarr;
        </Link>
      </footer>
    </article>
  );
}

/** A titled prose section within a pattern page. */
export function PatternSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

/** Failure-mode list: each item names the failure, then explains it. */
export function FailureModes({
  items,
}: {
  items: { name: string; detail: string }[];
}) {
  return (
    <ul className={styles.failureList}>
      {items.map((item) => (
        <li key={item.name}>
          <strong>{item.name}.</strong> {item.detail}
        </li>
      ))}
    </ul>
  );
}

/**
 * Illustrative code block. Content is illustrative pseudocode/TypeScript,
 * never a benchmark result. `caption` labels what the snippet shows.
 */
export function CodeBlock({
  caption,
  code,
}: {
  caption?: string;
  code: string;
}) {
  return (
    <>
      {caption ? <p className={styles.codeCaption}>{caption}</p> : null}
      <pre className={styles.pre}>
        <code>{code}</code>
      </pre>
    </>
  );
}

/** Related notes — internal links only, omitted entirely when empty. */
export function RelatedNotes({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <PatternSection title="Related notes">
      <ul className={styles.relatedList}>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.relatedLink}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </PatternSection>
  );
}
