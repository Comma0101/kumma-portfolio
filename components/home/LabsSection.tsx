import Link from "next/link";
import SectionHeader from "@/components/system/SectionHeader";
import SystemViz from "@/components/system/SystemViz";
import { vizBySlug } from "@/components/viz/registry";
import { labWork } from "@/data/workProjects";
import styles from "./LabsSection.module.css";

export default function LabsSection() {
  return (
    <section className={styles.section} data-immersive-stage="labs">
      <SectionHeader
        eyebrow="Labs"
        title="Adjacent systems work, kept honest about its status."
        intro="These studies extend the same input-to-output discipline into interactive systems and data correctness."
      />
      <div className={styles.grid}>
        {labWork.map((project) => {
          const Visualization = vizBySlug[project.visualKey];

          return (
            <article key={project.slug} className={styles.card}>
              <div className={styles.heading}>
                <div className={styles.meta}>
                  <span>{project.no}</span>
                  <span>Status · {project.statusLabel}</span>
                </div>
                <h3>{project.title}</h3>
              </div>
              <div className={styles.summary}>
                <p>{project.summary}</p>
                <ul aria-label={`${project.title} tags`}>
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.visual}>
                <SystemViz
                  label={`${project.title} / system mechanism`}
                  live={project.status === "live"}
                >
                  <Visualization size="teaser" />
                </SystemViz>
              </div>
              <div className={styles.evidence}>
                <p className={styles.artifact}>{project.artifact}</p>
                <dl aria-label={`${project.title} evidence flow`}>
                  <div>
                    <dt>Input</dt>
                    <dd>{project.evidence.input}</dd>
                  </div>
                  <div>
                    <dt>Transform</dt>
                    <dd>{project.evidence.transform}</dd>
                  </div>
                  <div>
                    <dt>Output</dt>
                    <dd>{project.evidence.output}</dd>
                  </div>
                  <div>
                    <dt>Guardrail</dt>
                    <dd>{project.evidence.guardrail}</dd>
                  </div>
                </dl>
              </div>
              <Link href={project.href} className={styles.link}>
                Read the case study →
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
