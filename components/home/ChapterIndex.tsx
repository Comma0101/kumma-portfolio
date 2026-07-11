"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/system/SectionHeader";
import SystemViz from "@/components/system/SystemViz";
import { vizBySlug } from "@/components/viz/registry";
import { featuredWork } from "@/data/workProjects";
import styles from "./ChapterIndex.module.css";

interface StaticMechanismProps {
  readonly input: string;
  readonly output: string;
}

function StaticMechanism({ input, output }: StaticMechanismProps) {
  return (
    <div className={styles.mechanismFallback} aria-hidden="true">
      <span>{input}</span>
      <span className={styles.mechanismArrow}>→</span>
      <span>{output}</span>
    </div>
  );
}

export default function ChapterIndex() {
  const ref = useRef<HTMLElement>(null);
  const [revealReady, setRevealReady] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const elements = root.querySelectorAll<HTMLElement>("[data-reveal]");

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      elements.forEach((element) => element.classList.add(styles.shown));
      return;
    }

    let rowObserver: IntersectionObserver | null = null;
    const startReveal = () => {
      setRevealReady(true);
      rowObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(styles.shown);
              rowObserver?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 },
      );
      elements.forEach((element) => rowObserver?.observe(element));
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          startReveal();
          sectionObserver.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.01 },
    );

    sectionObserver.observe(root);
    return () => {
      sectionObserver.disconnect();
      rowObserver?.disconnect();
    };
  }, []);

  return (
    <section
      ref={ref}
      id="work"
      className={styles.section}
      data-immersive-stage="featured-work"
    >
      <SectionHeader
        eyebrow="Featured work"
        title="Production systems, with the mechanism exposed."
        intro="Each case study shows the input, transformation, output, and guardrail—not an unsupported outcome claim."
      />
      <div className={`${styles.rows} ${revealReady ? styles.jsReveal : ""}`}>
        {featuredWork.map((project) => {
          const Visualization = vizBySlug[project.visualKey];
          const evidence = [
            { label: "Input", value: project.evidence.input },
            { label: "Transform", value: project.evidence.transform },
            { label: "Output", value: project.evidence.output },
            { label: "Guardrail", value: project.evidence.guardrail },
          ] as const;

          return (
            <article
              key={project.slug}
              data-reveal
              data-immersive-anchor={project.slug}
              className={`${styles.row} ${styles[project.layout]}`}
            >
              <div className={styles.copy}>
                <div className={styles.projectMeta}>
                  <span className={styles.no}>{project.no}</span>
                  <span className={styles.status}>{project.statusLabel}</span>
                </div>
                <h3 className={styles.title}>{project.title}</h3>
                <p className={styles.blurb}>{project.summary}</p>
                <ul className={styles.tags} aria-label={`${project.title} tags`}>
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div
                  className={styles.evidence}
                  aria-label={`${project.title} evidence flow`}
                >
                  <p className={styles.artifact}>{project.artifact}</p>
                  <dl className={styles.evidenceFlow}>
                    {evidence.map((item) => (
                      <div key={item.label} className={styles.evidenceStep}>
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className={styles.links}>
                  <Link href={project.href} className={styles.link}>
                    Read the case study →
                  </Link>
                  {project.primaryAction && (
                    <Link
                      href={project.primaryAction.href}
                      className={styles.linkSecondary}
                    >
                      {project.primaryAction.label}
                    </Link>
                  )}
                </div>
              </div>

              <SystemViz
                label={`${project.no} / ${project.title}`}
                live={project.status === "live"}
                className={styles.viz}
              >
                {Visualization ? (
                  <Visualization size="teaser" />
                ) : (
                  <StaticMechanism
                    input={project.evidence.input}
                    output={project.evidence.output}
                  />
                )}
              </SystemViz>
            </article>
          );
        })}
      </div>
    </section>
  );
}
