"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import styles from "@/styles/projectDetail.module.css";
import type { Project } from "@/data/projectData";

gsap.registerPlugin(ScrollTrigger);

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const storyArcRef = useRef<HTMLDivElement>(null);
  const techStackRef = useRef<HTMLDivElement>(null);
  const philosophicalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      if (overviewRef.current) {
        gsap.fromTo(
          overviewRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: overviewRef.current,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (storyArcRef.current) {
        const cards = storyArcRef.current.querySelectorAll(
          `.${styles.arcCard}`
        );
        gsap.fromTo(
          cards,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: storyArcRef.current,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (techStackRef.current) {
        const items = techStackRef.current.querySelectorAll(
          `.${styles.stackItem}`
        );
        gsap.fromTo(
          items,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: techStackRef.current,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (philosophicalRef.current) {
        gsap.fromTo(
          philosophicalRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: philosophicalRef.current,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, []);

  const stackSummary =
    project.techStack?.map((t) => t.name).join(" · ") || "";

  return (
    <div className={styles.container}>
      {/* Hero */}
      <header ref={heroRef} className={styles.hero}>
        <p className={`${styles.eyebrow} ${spaceGrotesk.className}`}>
          Case Study
        </p>
        <h1 className={`${styles.title} ${cormorant.className}`}>
          {project.title}
        </h1>
        {project.subtitle && (
          <p className={`${styles.subtitle} ${cormorant.className}`}>
            {project.subtitle}
          </p>
        )}
        {project.tagline && (
          <p className={`${styles.tagline} ${spaceGrotesk.className}`}>
            {project.tagline}
          </p>
        )}
        {stackSummary && (
          <p className={`${styles.stackLine} ${spaceGrotesk.className}`}>
            {stackSummary}
          </p>
        )}
        {(project.websiteUrl || project.demoUrl) && (
          <div className={styles.actions}>
            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.actionLink} ${spaceGrotesk.className}`}
              >
                Visit Live Site &rarr;
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.actionLink} ${spaceGrotesk.className}`}
              >
                View Demo &rarr;
              </a>
            )}
          </div>
        )}
      </header>

      {/* Overview */}
      {project.overview && (
        <section ref={overviewRef} className={styles.overview}>
          <h2 className={`${styles.sectionLabel} ${spaceGrotesk.className}`}>
            {project.overview.headline}
          </h2>
          <p className={`${styles.overviewBody} ${spaceGrotesk.className}`}>
            {project.overview.content}
          </p>
        </section>
      )}

      {/* Narrative Arc */}
      {project.narrative && (
        <section ref={storyArcRef} className={styles.arc}>
          <h2 className={`${styles.sectionLabel} ${spaceGrotesk.className}`}>
            Narrative Arc
          </h2>
          <div className={styles.arcGrid}>
            <article className={styles.arcCard}>
              <p className={`${styles.arcIndex} ${spaceGrotesk.className}`}>01</p>
              <p className={`${styles.arcLabel} ${spaceGrotesk.className}`}>Context</p>
              <p className={`${styles.arcText} ${spaceGrotesk.className}`}>
                {project.narrative.context}
              </p>
            </article>
            <article className={styles.arcCard}>
              <p className={`${styles.arcIndex} ${spaceGrotesk.className}`}>02</p>
              <p className={`${styles.arcLabel} ${spaceGrotesk.className}`}>Decision</p>
              <p className={`${styles.arcText} ${spaceGrotesk.className}`}>
                {project.narrative.decision}
              </p>
            </article>
            <article className={styles.arcCard}>
              <p className={`${styles.arcIndex} ${spaceGrotesk.className}`}>03</p>
              <p className={`${styles.arcLabel} ${spaceGrotesk.className}`}>Outcome</p>
              <p className={`${styles.arcText} ${spaceGrotesk.className}`}>
                {project.narrative.outcome}
              </p>
            </article>
          </div>
          {project.narrative.impact && (
            <p className={`${styles.arcImpact} ${spaceGrotesk.className}`}>
              {project.narrative.impact}
            </p>
          )}
        </section>
      )}

      {/* Tech Stack */}
      {project.techStack && project.techStack.length > 0 && (
        <section ref={techStackRef} className={styles.stack}>
          <h2 className={`${styles.sectionLabel} ${spaceGrotesk.className}`}>
            Technical Breakdown
          </h2>
          <div className={styles.stackGrid}>
            {project.techStack.map((tech, i) => (
              <div key={i} className={styles.stackItem}>
                <h3 className={`${styles.stackName} ${spaceGrotesk.className}`}>
                  {tech.name}
                </h3>
                <p className={`${styles.stackDesc} ${spaceGrotesk.className}`}>
                  {tech.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Philosophical */}
      {project.philosophical && (
        <footer ref={philosophicalRef} className={styles.philosophical}>
          <blockquote className={`${styles.quote} ${cormorant.className}`}>
            &ldquo;{project.philosophical}&rdquo;
          </blockquote>
          <p className={`${styles.quoteAttrib} ${spaceGrotesk.className}`}>
            Notes from the build.
          </p>
        </footer>
      )}
    </div>
  );
}
