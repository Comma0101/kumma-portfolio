import Link from "next/link";
import { systemEvidence } from "@/data/systemEvidence";
import styles from "./ProofConsole.module.css";

export default function ProofConsole() {
  return (
    <section className={styles.section} aria-labelledby="proof-console-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>Operational proof</p>
          <h2 id="proof-console-title" className={styles.title}>
            Systems that convert messy inputs into reliable action.
          </h2>
        </div>
        <div className={styles.grid}>
          {systemEvidence.map((item) => {
            const content = (
              <>
                <span className={styles.status}>{item.status}</span>
                <strong>{item.label}</strong>
                <span className={styles.signal}>{item.signal}</span>
                <span className={styles.flow}>
                  {item.input} -&gt; {item.output}
                </span>
                <span className={styles.guardrail}>{item.guardrail}</span>
              </>
            );
            return item.external ? (
              <a
                key={item.slug}
                href={item.href}
                className={styles.card}
                target="_blank"
                rel="noreferrer"
              >
                {content}
              </a>
            ) : (
              <Link key={item.slug} href={item.href} className={styles.card}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
