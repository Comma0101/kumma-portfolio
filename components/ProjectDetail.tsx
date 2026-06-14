"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/data/projectData";
import { vizBySlug } from "@/components/viz/registry";
import styles from "@/styles/projectDetail.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectDetail({ project }: { project: Project }) {
  const root = useRef<HTMLDivElement>(null);
  const Viz = vizBySlug[project.slug];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className={styles.container}>
      <header className={styles.hero} data-reveal>
        {project.subtitle && <p className={styles.eyebrow}>{project.subtitle}</p>}
        <h1 className={styles.title}>{project.title}</h1>
        {project.tagline && <p className={styles.tagline}>{project.tagline}</p>}
      </header>

      {Viz && (
        <section className={styles.vizSection} data-reveal aria-hidden="true">
          <Viz size="detail" />
        </section>
      )}

      {project.details && (
        <section className={styles.block} data-reveal>
          <p className={styles.lead}>{project.details}</p>
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
