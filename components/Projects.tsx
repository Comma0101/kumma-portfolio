"use client";
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "../styles/projects.module.css";
import { projects } from "@/data/projectData";
import Link from "next/link";
import MiniConstellation from "./MiniConstellation";

gsap.registerPlugin(ScrollTrigger);

const Projects = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const scrollLineRef = useRef<HTMLDivElement>(null);
  const scrollLineProgressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Bridge element animation - cinematic gradient flow
      if (bridgeRef.current) {
        gsap.fromTo(
          bridgeRef.current,
          {
            opacity: 0,
            scale: 0.95,
            filter: "blur(10px)"
          },
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.5,
            ease: "cubic-bezier(0.25, 1, 0.5, 1)",
            scrollTrigger: {
              trigger: bridgeRef.current,
              start: "top 90%",
              end: "top 60%",
              scrub: 1.2,
            },
          }
        );

        // Animated gradient within bridge
        gsap.to(bridgeRef.current, {
          backgroundPosition: "200% center",
          duration: 8,
          repeat: -1,
          ease: "linear",
        });
      }

      // Title animation - slower, more graceful
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "cubic-bezier(0.25, 1, 0.5, 1)",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
            end: "top 50%",
            scrub: 1.2,
          },
        }
      );

      // Scroll Line Animation
      if (scrollLineRef.current && scrollLineProgressRef.current) {
        gsap.fromTo(
          scrollLineProgressRef.current,
          { height: "0%" },
          {
            height: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top center",
              end: "bottom bottom",
              scrub: 0.5,
            },
          }
        );
      }

      // Project panels with parallax and fade effects
      const panels = gsap.utils.toArray<HTMLElement>(`.${styles.projectPanel}`);

      panels.forEach((panel, i) => {
        // Enhanced fade effect with smoother transitions
        ScrollTrigger.create({
          trigger: panel,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const opacity = 1 - Math.abs(progress - 0.5) * 2;
            gsap.to(panel, {
              opacity: Math.max(0.3, opacity),
              duration: 0.5,
              ease: "cubic-bezier(0.25, 1, 0.5, 1)"
            });
          },
        });

        // Connection Point Activation
        const connectionPoint = panel.querySelector(`.${styles.connectionPoint}`);
        if (connectionPoint) {
          ScrollTrigger.create({
            trigger: panel,
            start: "top center",
            end: "bottom center",
            onEnter: () => connectionPoint.classList.add(styles.active),
            onLeave: () => connectionPoint.classList.remove(styles.active),
            onEnterBack: () => connectionPoint.classList.add(styles.active),
            onLeaveBack: () => connectionPoint.classList.remove(styles.active),
          });
        }

        // Parallax effect for the visual
        const visual = panel.querySelector(`.${styles.projectVisual}`);
        if (visual) {
          gsap.to(visual, {
            yPercent: -15,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }

        // Background gradient transition - REMOVED to keep grid visible
        // The grid background from the parent container will now show through
        // We can add a subtle overlay if needed, but for now we prioritize the grid.
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className={styles.projectsContainer}
      style={{ transition: "background-color 1.5s cubic-bezier(0.25, 1, 0.5, 1)" }}
    >
      <div className={styles.projectsWrapper}>
        {/* Scroll Line */}
        <div ref={scrollLineRef} className={styles.scrollLineContainer}>
          <div className={styles.scrollLineBase} />
          <div ref={scrollLineProgressRef} className={styles.scrollLineProgress} />
        </div>
        {/* Emotional Bridge Element */}
        <div ref={bridgeRef} className={styles.emotionalBridge}>
          <div className={styles.bridgeGradient} />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
            viewport={{ once: true, amount: 0.8 }}
            className={styles.bridgeText}
          >
            Ideas take shape in code, color, and motion.
          </motion.p>
        </div>

        {/* Philosophical Bridge */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
          viewport={{ once: true, amount: 0.5 }}
          className={styles.philosophicalBridge}
        >
          Each project begins as a question — here are a few that found their answers.
        </motion.p>

        <h2 ref={titleRef} className={styles.projectsTitle}>
          Featured Projects
        </h2>

        <div className={styles.projectsPanels}>
          {projects.map((project, index) => {
            const isServiio = project.slug === "serviio";
            const accentColor = index === 0 ? "cyan" : index === 1 ? "amber" : "violet";

            // Fallback tech stack if not provided
            const techStackNames = project.techStack
              ? project.techStack.map(t => t.name)
              : ["React", "Next.js", "TypeScript", "GSAP", "Node.js"];

            const accentHex = index === 0 ? "#e0e0e0" : index === 1 ? "#c8c8c8" : "#b0b0b0";

            return (
              <div
                key={project.id}
                className={`${styles.projectPanel}`}
                data-accent={accentColor}
              >
                {/* Connection Point */}
                <div className={styles.connectionPoint} />
                {/* Text Side */}
                <motion.div
                  className={styles.projectTextSide}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 1.2,
                    ease: [0.25, 1, 0.5, 1]
                  }}
                  viewport={{ once: false, amount: 0.3 }}
                >
                  <motion.h3
                    initial={{ y: 60, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 1.0,
                      delay: index * 0.15,
                      ease: [0.25, 1, 0.5, 1]
                    }}
                    viewport={{ once: false, amount: 0.3 }}
                    className={styles.projectPanelTitle}
                    data-accent={accentColor}
                  >
                    {project.title}
                  </motion.h3>

                  {project.subtitle && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{
                        delay: 0.3 + (index * 0.15),
                        duration: 1.2,
                        ease: [0.25, 1, 0.5, 1]
                      }}
                      viewport={{ once: false, amount: 0.3 }}
                      className={styles.projectPanelSubtitle}
                    >
                      {project.subtitle}
                    </motion.p>
                  )}

                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{
                      delay: 0.5 + (index * 0.15),
                      duration: 1.2,
                      ease: [0.25, 1, 0.5, 1]
                    }}
                    viewport={{ once: false, amount: 0.3 }}
                    className={styles.projectPanelDescription}
                  >
                    {project.description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.7 + (index * 0.15),
                      duration: 1.0,
                      ease: [0.25, 1, 0.5, 1]
                    }}
                    viewport={{ once: false, amount: 0.3 }}
                    className={styles.projectLinks}
                  >
                    <Link
                      href={`/projects/${project.slug}`}
                      className={styles.projectPanelLink}
                      data-accent={accentColor}
                    >
                      <motion.span
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        View Project →
                      </motion.span>
                    </Link>

                    {/* Live Site Button for projects with websiteUrl */}
                    {project.websiteUrl && (
                      <motion.a
                        href={project.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.liveSiteButton}
                        data-accent={accentColor}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.span
                          className={styles.liveSiteIcon}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          ●
                        </motion.span>
                        <span className={styles.liveSiteText}>Visit Live Site</span>
                        <motion.svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={styles.externalIcon}
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </motion.svg>
                      </motion.a>
                    )}
                  </motion.div>
                </motion.div>

                {/* Visual Side */}
                <motion.div
                  className={styles.projectVisualSide}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 1.2,
                    ease: [0.25, 1, 0.5, 1]
                  }}
                  viewport={{ once: false, amount: 0.3 }}
                >
                  {/* Mini Constellation Overlay */}
                  <div className={styles.miniConstellationWrapper}>
                    <MiniConstellation technologies={techStackNames} accentColor={accentHex} />
                  </div>

                  <motion.div
                    className={styles.projectVisual}
                    data-accent={accentColor}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: `0px 0px 40px ${accentHex}40`
                    }}
                    transition={{
                      duration: 0.8,
                      ease: [0.25, 1, 0.5, 1]
                    }}
                  >
                    <motion.div
                      className={styles.projectVisualImage}
                      initial={{ scale: 1.1, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 1.5,
                        delay: index * 0.1,
                        ease: [0.25, 1, 0.5, 1]
                      }}
                      viewport={{ once: false, amount: 0.3 }}
                      style={{
                        backgroundImage: `url(/images/collection${Math.floor(index / 3) + 1}/img${(index % 3) + 1}.jpg)`,
                      }}
                    />

                    {/* Enhanced light pulse with accent color */}
                    <motion.div
                      className={`${styles.lightPulse} ${styles[`lightPulse${accentColor.charAt(0).toUpperCase() + accentColor.slice(1)}`]}`}
                      animate={{
                        opacity: [0, 0.2, 0],
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: [0.25, 1, 0.5, 1],
                      }}
                    />

                    {/* Enhanced voice ripple for Serviio */}
                    {isServiio && (
                      <>
                        <motion.div
                          className={styles.voiceRipple}
                          animate={{
                            scale: [1, 2.5, 1],
                            opacity: [0.3, 0, 0.3],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: [0.25, 1, 0.5, 1],
                          }}
                        />
                        <motion.div
                          className={styles.audioGlow}
                          animate={{
                            opacity: [0.05, 0.25, 0.05],
                            scale: [0.98, 1.02, 0.98],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: [0.25, 1, 0.5, 1],
                          }}
                        />
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Projects;
