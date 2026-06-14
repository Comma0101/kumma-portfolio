"use client";

import { CSSProperties, useEffect, useRef } from "react";
import Link from "next/link";
import { projects } from "@/data/projectData";
import styles from "./ProjectsShowcase.module.css";

function KotaVisual() {
  return (
    <div className={`${styles.projectVisual} ${styles.kotaVisual}`}>
      <div className={styles.visualToolbar}>
        <span>KOTA / Active call</span>
        <b>Voice to action</b>
      </div>
      <div className={styles.kotaFlow}>
        {["Listen", "Resolve", "Execute"].map((item) => (
          <div key={item}>
            <i aria-hidden="true" />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div className={styles.kotaTicket}>
        <span>Structured ticket</span>
        <p>Orange chicken <b>x2</b></p>
        <p>Chow mein <b>x1</b></p>
      </div>
    </div>
  );
}

function ArchonVisual() {
  return (
    <div className={`${styles.projectVisual} ${styles.archonVisual}`}>
      <div className={styles.agentGrid}>
        {["Tools", "Memory", "Evaluator", "Context"].map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className={styles.archonCore}>
        <i aria-hidden="true" />
        <strong>Coordinator</strong>
        <small>Route / trace / recover</small>
      </div>
    </div>
  );
}

function DecisionVisual() {
  const rows = [
    ["Setup quality", "Consistent"],
    ["Risk discipline", "Controlled"],
    ["Execution review", "In focus"],
  ];

  return (
    <div className={`${styles.projectVisual} ${styles.decisionVisual}`}>
      <div className={styles.visualToolbar}>
        <span>Decision journal</span>
        <b>Process over outcome</b>
      </div>
      <div className={styles.decisionRows}>
        {rows.map(([label, status], index) => (
          <div key={label}>
            <span>{label}</span>
            <i style={{ "--bar-width": `${84 - index * 13}%` } as CSSProperties} />
            <b>{status}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

const visuals = [KotaVisual, ArchonVisual, DecisionVisual];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const cards = section.querySelectorAll<HTMLElement>("[data-project-card]");

    if (reducedMotion) {
      cards.forEach((card) => card.classList.add(styles.projectCardVisible));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.projectCardVisible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" ref={sectionRef} className={styles.projectsSection}>
      <header className={styles.projectsHeader}>
        <p className={styles.eyebrow}>Selected Work</p>
        <h2>Systems built for real operations.</h2>
        <p>
          Three products that turn ambiguous inputs into observable, useful
          decisions.
        </p>
      </header>

      <div className={styles.projectsGrid}>
        {projects.map((project, index) => {
          const Visual = visuals[index] ?? DecisionVisual;
          const stack = project.techStack?.slice(0, 3).map((tech) => tech.name);

          return (
            <article
              key={project.id}
              data-project-card
              className={`${styles.projectCard} ${
                index === 0 ? styles.featuredCard : styles.supportingCard
              }`}
              style={{ "--card-delay": `${index * 100}ms` } as CSSProperties}
            >
              <div className={styles.projectCopy}>
                <div>
                  <p className={styles.projectType}>
                    {index === 0 ? "Flagship system" : "Case study"}
                  </p>
                  <h3>{project.title}</h3>
                  <p className={styles.projectSubtitle}>
                    {project.subtitle || project.description}
                  </p>
                  <p className={styles.projectDescription}>
                    {project.description}
                  </p>
                </div>

                <div>
                  {stack && (
                    <ul className={styles.stackList} aria-label="Core capabilities">
                      {stack.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href={`/projects/${project.slug}`}
                    className={styles.projectLink}
                  >
                    View Case Study <span aria-hidden="true">-&gt;</span>
                  </Link>
                </div>
              </div>
              <Visual />
            </article>
          );
        })}
      </div>
    </section>
  );
}
