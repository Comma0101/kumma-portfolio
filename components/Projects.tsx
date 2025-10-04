"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "../styles/projects.module.css";

gsap.registerPlugin(ScrollTrigger);

const projectData = [
  {
    id: 1,
    title: "Neural Interface",
    description: "AI-powered brain-computer interface for next-gen accessibility.",
    image: "/images/collection1/img1.jpg",
    link: "#",
    category: "AI/ML",
  },
  {
    id: 2,
    title: "Quantum Portfolio",
    description: "Real-time financial analytics with quantum algorithms.",
    image: "/images/collection1/img2.jpg",
    link: "#",
    category: "FinTech",
  },
  {
    id: 3,
    title: "Holographic UI",
    description: "Revolutionary 3D interface design system.",
    image: "/images/collection1/img3.jpg",
    link: "#",
    category: "Design",
  },
  {
    id: 4,
    title: "Meta Commerce",
    description: "Immersive shopping experience in virtual reality.",
    image: "/images/collection2/img1.jpg",
    link: "#",
    category: "Web3",
  },
  {
    id: 5,
    title: "BioSync Health",
    description: "Predictive health monitoring with wearable integration.",
    image: "/images/collection2/img2.jpg",
    link: "#",
    category: "HealthTech",
  },
  {
    id: 6,
    title: "Smart City Grid",
    description: "IoT-powered urban infrastructure management system.",
    image: "/images/collection2/img3.jpg",
    link: "#",
    category: "IoT",
  },
];

const Projects = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const projectsGridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Title entrance animation
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        scale: 0.8,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
        },
      });

      // Get all project cards
      const cards = gsap.utils.toArray<HTMLElement>(`.${styles.projectCard}`);

      // Stagger entrance animation for cards
      cards.forEach((card, index) => {
        const isEven = index % 2 === 0;
        
        // Entrance animation
        gsap.from(card, {
          y: 150,
          x: isEven ? -100 : 100,
          opacity: 0,
          scale: 0.8,
          rotation: isEven ? -5 : 5,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            end: "top 60%",
            scrub: 1,
          },
        });

        // Parallax effect - cards move at different speeds
        gsap.to(card, {
          y: isEven ? -80 : -120,
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });

        // Image parallax - moves slower than card for depth
        const image = card.querySelector(`.${styles.projectImage}`);
        if (image) {
          gsap.to(image, {
            y: 50,
            scale: 1.15,
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 3,
            },
          });
        }

        // Info section subtle parallax
        const info = card.querySelector(`.${styles.projectInfo}`);
        if (info) {
          gsap.to(info, {
            y: -20,
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          });
        }

        // Category badge animation
        const category = card.querySelector(`.${styles.projectCategory}`);
        if (category) {
          gsap.from(category, {
            x: -50,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
        }
      });

      // Background gradient animation
      gsap.to(containerRef.current, {
        background: "linear-gradient(180deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      });

      // Grid container subtle rotation for depth
      gsap.to(projectsGridRef.current, {
        rotateX: 2,
        scrollTrigger: {
          trigger: projectsGridRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={styles.projectsContainer}>
      <div className={styles.projectsWrapper}>
        <h2 ref={titleRef} className={styles.projectsTitle}>
          Featured Projects
        </h2>
        
        <div ref={projectsGridRef} className={styles.projectsGrid}>
          {projectData.map((project, index) => (
            <div
              key={project.id}
              className={`${styles.projectCard} ${
                index % 2 === 0 ? styles.cardLeft : styles.cardRight
              }`}
            >
              <div className={styles.projectImageContainer}>
                <img
                  src={project.image}
                  alt={project.title}
                  className={styles.projectImage}
                  loading="lazy"
                />
                <div className={styles.projectOverlay} />
              </div>
              
              <div className={styles.projectInfo}>
                <span className={styles.projectCategory}>{project.category}</span>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.projectDescription}>{project.description}</p>
                <a href={project.link} className={styles.projectLink}>
                  <span>Explore Project</span>
                  <svg
                    className={styles.arrowIcon}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M4 10H16M16 10L10 4M16 10L10 16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative elements for depth */}
      <div className={styles.decorativeCircle1} />
      <div className={styles.decorativeCircle2} />
      <div className={styles.decorativeCircle3} />
    </div>
  );
};

export default Projects;
