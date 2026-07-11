import Link from "next/link";
import type { WorkProject } from "@/data/workProjects";
import styles from "./ResearchProjectPreview.module.css";

const evidenceSteps = [
  { key: "input", label: "Input" },
  { key: "transform", label: "Transform" },
  { key: "output", label: "Output" },
  { key: "guardrail", label: "Guardrail" },
] as const;

interface ResearchProjectPreviewProps {
  project: WorkProject;
  limits: string;
}

export default function ResearchProjectPreview({
  project,
  limits,
}: ResearchProjectPreviewProps) {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Link className={styles.backLink} href="/work">
          <span aria-hidden="true">←</span>
          Work index
        </Link>

        <header className={styles.hero}>
          <div className={styles.projectMeta}>
            <p className={styles.status}>Status · {project.statusLabel}</p>
            <p>{project.artifact}</p>
          </div>
          <div>
            <h1>{project.title}</h1>
            <p className={styles.summary}>{project.summary}</p>
            <ul
              className={styles.tags}
              aria-label={`${project.title} technologies`}
            >
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        </header>

        <section className={styles.mechanism} aria-labelledby="mechanism-title">
          <header className={styles.sectionHeader}>
            <p>System mechanism</p>
            <h2 id="mechanism-title">What enters, changes, and leaves.</h2>
          </header>
          <dl className={styles.flow}>
            {evidenceSteps.map(({ key, label }, index) => (
              <div className={styles.flowStep} key={key}>
                <dt>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {label}
                </dt>
                <dd>{project.evidence[key]}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.limits} aria-labelledby="limits-title">
          <p className={styles.limitLabel}>Current boundary</p>
          <div>
            <h2 id="limits-title">What this prototype does not claim.</h2>
            <p>{limits}</p>
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="research-contact-title">
          <div>
            <p>Production question</p>
            <h2 id="research-contact-title">
              Need to test a difficult AI system boundary?
            </h2>
          </div>
          <Link className={styles.ctaLink} href="/contact">
            Start a project
            <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
