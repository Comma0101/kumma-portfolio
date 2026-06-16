"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/data/projectData";
import { vizBySlug } from "@/components/viz/registry";
import Button from "@/components/system/Button";
import styles from "@/styles/projectDetail.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectDetail({ project }: { project: Project }) {
  const root = useRef<HTMLDivElement>(null);
  const Viz = vizBySlug[project.slug];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    }, root);
    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={root} className={styles.container}>
      <header className={styles.hero} data-reveal>
        {project.subtitle && <p className={styles.eyebrow}>{project.subtitle}</p>}
        <h1 className={styles.title}>{project.title}</h1>
        {project.tagline && <p className={styles.tagline}>{project.tagline}</p>}
        {(project.websiteUrl || project.repoUrl || project.demoUrl) && (
          <div className={styles.actions}>
            {project.websiteUrl && (
              <Button href={project.websiteUrl} variant="ghost" external>
                Visit live site →
              </Button>
            )}
            {project.repoUrl && (
              <Button href={project.repoUrl} variant="ghost" external>
                View on GitHub →
              </Button>
            )}
            {project.demoUrl && (
              <Button href={project.demoUrl} variant="ghost" external>
                View demo →
              </Button>
            )}
          </div>
        )}
      </header>

      {project.outcome && (
        <p className={styles.outcome} data-reveal>
          {project.outcome}
        </p>
      )}

      {project.metrics && project.metrics.length > 0 && (
        <section className={styles.metrics} data-reveal>
          {project.metrics.map((m) => (
            <div key={m.label} className={styles.metric}>
              <span
                className={`${styles.metricValue} ${m.accent ? styles.metricAccent : ""}`}
              >
                {m.value}
              </span>
              <span className={styles.metricLabel}>{m.label}</span>
            </div>
          ))}
        </section>
      )}

      {Viz && (
        <section className={styles.vizSection} data-reveal aria-hidden="true">
          <Viz size="detail" />
        </section>
      )}

      {project.overview && (
        <section className={styles.block} data-reveal>
          <h2 className={styles.h2}>{project.overview.headline}</h2>
          <p className={styles.body}>{project.overview.content}</p>
        </section>
      )}

      {project.narrative && (
        <section className={styles.block} data-reveal>
          <h2 className={styles.h2}>Key decisions</h2>
          <div className={styles.arc}>
            <div>
              <span className={styles.arcNo}>01</span>
              <h3 className={styles.arcLabel}>Context</h3>
              <p className={styles.body}>{project.narrative.context}</p>
            </div>
            <div>
              <span className={styles.arcNo}>02</span>
              <h3 className={styles.arcLabel}>Decision</h3>
              <p className={styles.body}>{project.narrative.decision}</p>
            </div>
            <div>
              <span className={styles.arcNo}>03</span>
              <h3 className={styles.arcLabel}>Outcome</h3>
              <p className={styles.body}>{project.narrative.outcome}</p>
            </div>
          </div>
          {project.narrative.impact && (
            <p className={styles.impact}>{project.narrative.impact}</p>
          )}
        </section>
      )}

      {project.techStack && project.techStack.length > 0 && (
        <section className={styles.block} data-reveal>
          <h2 className={styles.h2}>How it is built</h2>
          <ul className={styles.stack}>
            {project.techStack.map((t) => (
              <li key={t.name}>
                <strong>{t.name}</strong>
                <span>{t.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {project.philosophical && (
        <section className={styles.quoteWrap} data-reveal>
          <blockquote className={styles.quote}>{project.philosophical}</blockquote>
        </section>
      )}
    </div>
  );
}
