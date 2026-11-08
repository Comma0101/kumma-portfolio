import Link from "next/link";
import ContributionMark from "./ContributionMark";
import styles from "./Encounter.module.css";

export default function Close() {
  return (
    <section className={styles.outward} aria-labelledby="encounter" data-encounter>
      <div className={styles.outwardMain}>
        <h2 id="encounter" className={styles.intention} aria-label="I want to meet the world with love.">
          <span className={styles.intentionLead}>I want to meet</span>
          <span className={styles.intentionWorld}>the world</span>
          <em className={styles.intentionLove}>with love.</em>
        </h2>

        <div className={styles.sharedField}>
          <span className={styles.sharedRule} aria-hidden="true" />
          <ContributionMark place="ending" />
        </div>
      </div>

      <div className={styles.invitation}>
        <p>If something here stays with you, I’d like to hear it.</p>
        <nav aria-label="Continue the conversation">
          <a href="mailto:dev@kumma.me">
            Write to me <span aria-hidden="true">↗</span>
          </a>
          <Link href="/notes">
            Writing <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
    </section>
  );
}
