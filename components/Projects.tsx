"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "../styles/projects.module.css";
import { projects } from "@/data/projectData";

const truncate = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
};

const buildNarrative = (project: (typeof projects)[number]) => {
  const arcText = project.narrative
    ? `${project.narrative.context} ${project.narrative.decision} ${project.narrative.outcome}`
    : undefined;
  const baseText =
    arcText || project.overview?.content || project.details || project.description;

  return {
    title: project.title,
    subtitle: project.subtitle || project.tagline || project.description,
    body: truncate(baseText, 270),
    reflection: project.philosophical || project.narrative?.impact || "",
    stack:
      project.techStack?.map((tech) => tech.name).slice(0, 4).join(" · ") ||
      "React · Next.js · TypeScript · Motion Design",
    slug: project.slug,
    websiteUrl: project.websiteUrl,
  };
};

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = Array.from(
      section.querySelectorAll<HTMLElement>("[data-story-card]")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.storyCardVisible);
          } else {
            entry.target.classList.remove(styles.storyCardVisible);
          }
        });
      },
      {
        threshold: 0.24,
        rootMargin: "0px 0px -12% 0px",
      }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.storyProjectsSection}>
      <header className={styles.storyProjectsHeader}>
        <p className={styles.storyProjectsEyebrow}>Selected Work</p>
        <h2 className={styles.storyProjectsTitle}>Projects Told In Chapters</h2>
        <p className={styles.storyProjectsIntro}>
          Not a gallery of thumbnails, but a sequence of intentions. Each
          project is framed as context, decision, and outcome.
        </p>
      </header>

      <div className={styles.storyProjectsList}>
        {projects.map((project, index) => {
          const narrative = buildNarrative(project);
          const chapter = String(index + 1).padStart(2, "0");
          const imageUrl = `/images/collection${Math.floor(index / 3) + 1}/img${
            (index % 3) + 1
          }.jpg`;

          return (
            <article
              key={project.id}
              className={styles.storyCard}
              data-story-card="true"
            >
              <div className={styles.storyCardRail} aria-hidden="true">
                <span className={styles.storyCardChapter}>Chapter {chapter}</span>
                <span className={styles.storyCardDivider} />
              </div>

              <div className={styles.storyCardMain}>
                <p className={styles.storyCardKicker}>Case Study</p>
                <h3 className={styles.storyCardTitle}>{narrative.title}</h3>
                <p className={styles.storyCardSubtitle}>{narrative.subtitle}</p>
                <p className={styles.storyCardBody}>{narrative.body}</p>

                {narrative.reflection && (
                  <p className={styles.storyCardReflection}>
                    “{narrative.reflection}”
                  </p>
                )}

                <p className={styles.storyCardStack}>
                  <span>Stack</span>
                  {narrative.stack}
                </p>

                <div className={styles.storyCardActions}>
                  <Link
                    href={`/projects/${narrative.slug}`}
                    className={styles.storyCardLink}
                  >
                    Read Chapter
                  </Link>
                  {narrative.websiteUrl && (
                    <a
                      href={narrative.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.storyCardLinkGhost}
                    >
                      Visit Live
                    </a>
                  )}
                </div>
              </div>

              <div className={styles.storyCardVisualWrap}>
                <div
                  className={styles.storyCardVisual}
                  style={{ backgroundImage: `url(${imageUrl})` }}
                  role="img"
                  aria-label={`${narrative.title} visual preview`}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
