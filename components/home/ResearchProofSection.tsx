import Link from "next/link";
import SectionHeader from "@/components/system/SectionHeader";
import { researchProof } from "./homeContent";
import styles from "./ResearchProofSection.module.css";

export default function ResearchProofSection() {
  return (
    <section className={styles.section} data-immersive-stage="research">
      <SectionHeader
        eyebrow="Research proof"
        title="Inspect the methodology before the conversation."
        intro="These public artifacts show how I frame, test, and explain production-AI decisions. They are evidence of method and judgment, not borrowed social proof."
      />
      <div className={styles.grid}>
        {researchProof.map((item) => (
          <Link key={item.label} href={item.href} className={styles.card}>
            <div className={styles.meta}>
              <span className={styles.label}>{item.label}</span>
              <span className={styles.status}>Status · {item.status}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <span className={styles.action}>Inspect the artifact →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
