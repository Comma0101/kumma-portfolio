"use client";
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "../styles/projects.module.css";
import { projects } from "@/data/projectData";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const Projects = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);

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

        // Background gradient transition
        const bgColor = i % 2 === 0 ? "#0D1A26" : "#1C0F1C";
        ScrollTrigger.create({
          trigger: panel,
          start: "top center",
          end: "bottom center",
          scrub: true,
          onUpdate: (self) => {
            if (containerRef.current && self.progress > 0.3 && self.progress < 0.7) {
              containerRef.current.style.backgroundColor = bgColor;
            }
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className={styles.projectsContainer}
      style={{ backgroundColor: "#0a0a0a", transition: "background-color 1.5s cubic-bezier(0.25, 1, 0.5, 1)" }}
    >
      <div className={styles.projectsWrapper}>
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
            const isServio = project.slug === "servio";
            const accentColor = index === 0 ? "cyan" : index === 1 ? "amber" : "violet";
            
            return (
              <div
                key={project.id}
                className={`${styles.projectPanel}`}
                data-accent={accentColor}
              >
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
                  <motion.div 
                    className={styles.projectVisual}
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: "0px 0px 40px rgba(255,255,255,0.08)" 
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

                    {/* Enhanced voice ripple for Servio */}
                    {isServio && (
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
