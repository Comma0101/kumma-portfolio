import Link from "next/link";
import SectionHeader from "@/components/system/SectionHeader";
import { engagements } from "./homeContent";
import styles from "./CapabilitiesSection.module.css";

export default function CapabilitiesSection() {
  return (
    <section
      className={styles.section}
      data-immersive-stage="capabilities"
    >
      <SectionHeader
        eyebrow="Ways to work together"
        title="Choose the smallest engagement that moves the system forward."
        intro="Start with the production constraint. The right shape may be a diagnosis, a scoped implementation, or recurring technical judgment."
      />
      <div className={styles.engagements}>
        {engagements.map((engagement, index) => (
          <article key={engagement.title} className={styles.engagement}>
            <div className={styles.engagementTitle}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{engagement.title}</h3>
            </div>
            <div className={styles.when}>
              <p className={styles.label}>Use when</p>
              <p>{engagement.when}</p>
            </div>
            <div className={styles.scope}>
              <p className={styles.description}>{engagement.description}</p>
              <p className={styles.label}>Concrete deliverables</p>
              <ul>
                {engagement.deliverables.map((deliverable) => (
                  <li key={deliverable}>{deliverable}</li>
                ))}
              </ul>
              <Link href={engagement.cta.href} className={styles.link}>
                {engagement.cta.label}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
