import Link from "next/link";
import type { ReactNode } from "react";
import TrackedLink from "@/components/analytics/TrackedLink";
import type { CaseStudyContent } from "@/data/caseStudyContent";
import type { WorkProject } from "@/data/workProjects";
import styles from "./CaseStudyShell.module.css";

const evidenceSteps = [
  { key: "input", label: "Input" },
  { key: "transform", label: "Transform" },
  { key: "output", label: "Output" },
  { key: "guardrail", label: "Guardrail" },
] as const;

interface CaseStudyShellProps {
  project: WorkProject;
  study: CaseStudyContent;
  visual: ReactNode;
}

export default function CaseStudyShell({
  project,
  study,
  visual,
}: CaseStudyShellProps) {
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
            <h1>{study.title}</h1>
            <p className={styles.outcome}>{study.outcome}</p>
            <ul
              className={styles.tags}
              aria-label={`${study.title} technologies`}
            >
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        </header>

        <section
          className={styles.visual}
          aria-label={`${study.title} mechanism visualization`}
        >
          {visual}
        </section>

        <section className={styles.context} aria-labelledby="problem-title">
          <header className={styles.sectionHeader}>
            <p>Problem and constraint</p>
            <h2 id="problem-title">Why this is hard on purpose.</h2>
          </header>
          <div className={styles.contextColumns}>
            <div>
              <h3>The problem</h3>
              <p>{study.problem}</p>
            </div>
            <div>
              <h3>The operational constraint</h3>
              <p>{study.constraint}</p>
            </div>
          </div>
        </section>

        <section className={styles.flowSection} aria-labelledby="flow-title">
          <header className={styles.sectionHeader}>
            <p>System mechanism</p>
            <h2 id="flow-title">What enters, changes, and leaves.</h2>
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

        <section
          className={styles.mechanism}
          aria-labelledby="architecture-title"
        >
          <header className={styles.sectionHeader}>
            <p>Architecture</p>
            <h2 id="architecture-title">How the system actually works.</h2>
          </header>
          <p className={styles.mechanismLead}>{study.mechanism}</p>
          <ol className={styles.stages}>
            {study.architecture.map((stage, index) => (
              <li className={styles.stage} key={stage.name}>
                <h3>
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {stage.name}
                </h3>
                <p>{stage.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.limits} aria-labelledby="limits-title">
          <p className={styles.limitLabel}>Failure modes and limits</p>
          <div>
            <h2 id="limits-title">What this system does not claim.</h2>
            <ul className={styles.limitList}>
              {study.limits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.artifact} aria-labelledby="artifact-title">
          <p className={styles.limitLabel}>Artifact</p>
          <div>
            <h2 id="artifact-title">What exists and can be inspected.</h2>
            <p>{study.artifact}</p>
          </div>
        </section>

        <section className={styles.related} aria-labelledby="related-title">
          <header className={styles.sectionHeader}>
            <p>Related proof</p>
            <h2 id="related-title">Where this work connects.</h2>
          </header>
          <ul className={styles.relatedList}>
            {study.related.map((item) => (
              <li key={item.href}>
                <Link className={styles.relatedLink} href={item.href}>
                  <span className={styles.relatedLabel}>
                    {item.label}
                    <span aria-hidden="true">→</span>
                  </span>
                  <span className={styles.relatedNote}>{item.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.cta} aria-labelledby="case-contact-title">
          <div>
            <p>Production question</p>
            <h2 id="case-contact-title">Build a system like this.</h2>
          </div>
          <TrackedLink
            className={styles.ctaLink}
            href="/contact"
            event="project_start"
            source="case-study"
          >
            Start a project
            <span aria-hidden="true">↗</span>
          </TrackedLink>
        </section>
      </div>
    </div>
  );
}
