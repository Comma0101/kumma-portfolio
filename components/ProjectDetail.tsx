"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "@/styles/projects.module.css";
import type { Project } from "@/data/projectData";

gsap.registerPlugin(ScrollTrigger);

const IconMap = {
  microphone: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  brain: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" strokeWidth="2"/>
      <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  globe: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2"/>
    </svg>
  ),
  receipt: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 7h8M8 11h8M8 15h5" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  cloud: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

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
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
      );

      // Overview animation
      if (overviewRef.current) {
        gsap.fromTo(
          overviewRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: overviewRef.current,
              start: "top 80%",
              end: "top 50%",
              scrub: 1,
            },
          }
        );
      }

      // Tech stack cards animation
      if (techStackRef.current) {
        const cards = techStackRef.current.querySelectorAll(`.${styles.techCard}`);
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: techStackRef.current,
              start: "top 75%",
              end: "top 40%",
              scrub: 1.5,
            },
          }
        );
      }

      // Story arc animation
      if (storyArcRef.current) {
        const narrativeCards = storyArcRef.current.querySelectorAll(
          `.${styles.storyArcCard}`
        );

        gsap.fromTo(
          narrativeCards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: storyArcRef.current,
              start: "top 78%",
              end: "top 48%",
              scrub: 1,
            },
          }
        );
      }

      // Philosophical section animation
      if (philosophicalRef.current) {
        gsap.fromTo(
          philosophicalRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: philosophicalRef.current,
              start: "top 70%",
              end: "top 40%",
              scrub: 1,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.projectDetailContainer}>
      {/* Hero Section */}
      <div ref={heroRef} className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{project.title}</h1>
            {project.subtitle && (
              <h2 className={styles.heroSubtitle}>{project.subtitle}</h2>
            )}
            {project.tagline && (
              <p className={styles.heroTagline}>{project.tagline}</p>
            )}
            {(project.websiteUrl || project.demoUrl || project.caseStudyUrl) && (
              <div className={styles.heroCTA}>
                {project.websiteUrl && (
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.ctaButton}
                  >
                    Visit Live Site
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} className={`${styles.ctaButton} ${styles.ctaSecondary}`}>
                    View Demo
                  </a>
                )}
                {project.caseStudyUrl && (
                  <a href={project.caseStudyUrl} className={`${styles.ctaButton} ${styles.ctaSecondary}`}>
                    Read Case Study
                  </a>
                )}
              </div>
            )}
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.waveform}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={styles.wave} style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      {project.overview && (
        <div ref={overviewRef} className={styles.overview}>
          <h3 className={styles.overviewHeadline}>{project.overview.headline}</h3>
          <p className={styles.overviewContent}>{project.overview.content}</p>
        </div>
      )}

      {/* Story Arc Section */}
      {project.narrative && (
        <section ref={storyArcRef} className={styles.storyArc}>
          <h3 className={styles.sectionTitle}>Narrative Arc</h3>
          <div className={styles.storyArcGrid}>
            <article className={styles.storyArcCard}>
              <p className={styles.storyArcLabel}>Context</p>
              <p className={styles.storyArcText}>{project.narrative.context}</p>
            </article>
            <article className={styles.storyArcCard}>
              <p className={styles.storyArcLabel}>Decision</p>
              <p className={styles.storyArcText}>{project.narrative.decision}</p>
            </article>
            <article className={styles.storyArcCard}>
              <p className={styles.storyArcLabel}>Outcome</p>
              <p className={styles.storyArcText}>{project.narrative.outcome}</p>
            </article>
          </div>
          {project.narrative.impact && (
            <p className={styles.storyArcImpact}>{project.narrative.impact}</p>
          )}
        </section>
      )}

      {/* Tech Stack Section */}
      {project.techStack && (
        <div ref={techStackRef} className={styles.techStack}>
          <h3 className={styles.sectionTitle}>Technical Breakdown</h3>
          <div className={styles.techGrid}>
            {project.techStack.map((tech, index) => (
              <div key={index} className={styles.techCard}>
                <div className={styles.techIcon}>
                  {IconMap[tech.icon as keyof typeof IconMap]}
                </div>
                <h4 className={styles.techName}>{tech.name}</h4>
                <p className={styles.techDescription}>{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Philosophical Section */}
      {project.philosophical && (
        <div ref={philosophicalRef} className={styles.philosophical}>
          <blockquote className={styles.philosophicalQuote}>
            {project.philosophical}
          </blockquote>
          <p className={styles.philosophicalTag}>
            — Notes from the build.
          </p>
        </div>
      )}
    </div>
  );
}
