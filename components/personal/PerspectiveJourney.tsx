import Link from "next/link";
import PerspectiveOpening from "./PerspectiveOpening";
import { X_HANDLE, X_URL } from "./links";
import { typeClasses } from "./type";
import front from "./Front.module.css";
import styles from "./PerspectiveJourney.module.css";

export default function PerspectiveJourney() {
  return (
    <div className={`${front.front} ${typeClasses} ${styles.journey}`} data-paper>
      <PerspectiveOpening>
        <div className={styles.intro}>
          <p className={styles.byline}>Kumma Wu · Los Angeles</p>
          <h2>
            <span>What is it</span>
            <span>to be aware?</span>
          </h2>
          <p className={styles.introText}>
            I return to questions about consciousness: what experience is, how it relates to reality,
            and how awareness of my thoughts, emotions, and habits changes the way I live.
          </p>
          <p className={styles.introText}>
            I write and build software, and try to bring what I understand into everyday life.
          </p>
          <Link href="#view-reflection" className={styles.continue}>
            Continue <span aria-hidden="true">↓</span>
          </Link>
        </div>
      </PerspectiveOpening>

      <section id="view-reflection" className={styles.reflection} aria-label="From my writing">
        <figure>
          <blockquote cite="/notes/on-emotions">
            <p>
              I’ve come to realize that emotions aren’t enemies. They’re simply parts of ourselves—just
              the parts that are more honest, less rehearsed.
            </p>
          </blockquote>
          <figcaption>
            From{" "}
            <Link href="/notes/on-emotions" aria-label="Read On Emotions">
              <cite>On Emotions</cite> <span aria-hidden="true">↗</span>
            </Link>
            <span aria-hidden="true"> · </span>
            <time dateTime="2025-10-26">October 26, 2025</time>
          </figcaption>
        </figure>
      </section>

      <footer className={styles.footer}>
        <nav aria-label="More from Kumma">
          <Link href="/notes">Writing</Link>
          <Link href="/work">Work</Link>
          <a href="mailto:dev@kumma.me">Email</a>
          <a href={X_URL} rel="me">
            {X_HANDLE} <span aria-hidden="true">↗</span>
          </a>
        </nav>
        <p>Los Angeles</p>
      </footer>
    </div>
  );
}
