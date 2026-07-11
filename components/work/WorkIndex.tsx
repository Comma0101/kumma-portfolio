import Link from "next/link";
import SystemViz from "@/components/system/SystemViz";
import { vizBySlug } from "@/components/viz/registry";
import {
  featuredWork,
  labWork,
  type WorkProject,
} from "@/data/workProjects";
import styles from "./WorkIndex.module.css";

const evidenceSteps = [
  { key: "input", label: "Input" },
  { key: "transform", label: "Transform" },
  { key: "output", label: "Output" },
  { key: "guardrail", label: "Guardrail" },
] as const;

function MechanismFallback({ project }: { project: WorkProject }) {
  return (
    <div className={styles.mechanismFallback} aria-hidden="true">
      <div className={styles.mechanismNode}>
        <span className={styles.mechanismLabel}>Input</span>
        <span className={styles.mechanismValue}>
          {project.evidence.input}
        </span>
      </div>
      <div className={styles.mechanismBridge}>
        <span>Transform</span>
        <span className={styles.mechanismArrow}>→</span>
        <span>Guardrail</span>
      </div>
      <div className={styles.mechanismNode}>
        <span className={styles.mechanismLabel}>Output</span>
        <span className={styles.mechanismValue}>
          {project.evidence.output}
        </span>
      </div>
    </div>
  );
}

function ProjectMechanism({ project }: { project: WorkProject }) {
  const Visualization = vizBySlug[project.visualKey];

  return (
    <div className={styles.visual}>
      <SystemViz
        label={`${project.title} / system mechanism`}
        live={project.status === "live"}
      >
        {Visualization ? (
          <Visualization size="teaser" />
        ) : (
          <MechanismFallback project={project} />
        )}
      </SystemViz>
    </div>
  );
}

function ProjectCard({ project }: { project: WorkProject }) {
  return (
    <li className={styles.projectItem}>
      <Link
        className={styles.card}
        href={project.href}
        aria-label={`View ${project.title}: ${project.artifact}`}
      >
        <article>
          <div className={styles.cardHeader}>
            <div className={styles.cardIdentity}>
              <span className={styles.projectNo}>{project.no}</span>
              <h3>{project.title}</h3>
            </div>
            <span className={styles.cardArrow} aria-hidden="true">
              ↗
            </span>
          </div>

          <div className={styles.cardMeta}>
            <p className={styles.status}>Status · {project.statusLabel}</p>
            <p className={styles.artifact}>Artifact · {project.artifact}</p>
          </div>

          <p className={styles.summary}>{project.summary}</p>

          <ul className={styles.tags} aria-label={`${project.title} technologies`}>
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>

          <ProjectMechanism project={project} />

          <dl className={styles.evidence}>
            {evidenceSteps.map(({ key, label }) => (
              <div className={styles.evidenceItem} key={key}>
                <dt>{label}</dt>
                <dd>{project.evidence[key]}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.cardAction}>Open the case study</p>
        </article>
      </Link>
    </li>
  );
}

function ProjectSection({
  eyebrow,
  title,
  description,
  projects,
  variant,
}: {
  eyebrow: string;
  title: string;
  description: string;
  projects: readonly WorkProject[];
  variant: "featured" | "labs";
}) {
  const headingId = `${variant}-work-heading`;

  return (
    <section className={styles.workSection} aria-labelledby={headingId}>
      <header className={styles.sectionHeader}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <div>
          <h2 id={headingId}>{title}</h2>
          <p>{description}</p>
        </div>
      </header>

      <ul
        className={`${styles.projectGrid} ${
          variant === "featured" ? styles.featuredGrid : styles.labGrid
        }`}
      >
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </ul>
    </section>
  );
}

export default function WorkIndex() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Selected production systems / 2024—now</p>
          <h1>Production AI systems for the constraints your product actually has.</h1>
          <p className={styles.intro}>
            These systems are designed to survive messy real inputs, latency
            budgets, changing constraints, and failure—not just polished demos.
            Each case study makes the mechanism and the guardrail visible.
          </p>
        </header>

        <ProjectSection
          eyebrow="01 / Selected systems"
          title="Featured work"
          description="Deployed products and active systems where model behavior meets an operational workflow."
          projects={featuredWork}
          variant="featured"
        />

        <ProjectSection
          eyebrow="02 / Working experiments"
          title="Labs"
          description="Focused investigations into real-time graphics and data correctness, documented with the same production discipline."
          projects={labWork}
          variant="labs"
        />

        <section className={styles.cta} aria-labelledby="work-contact-heading">
          <div>
            <p className={styles.eyebrow}>Have a difficult system boundary?</p>
            <h2 id="work-contact-heading">
              Bring me a production AI problem.
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
