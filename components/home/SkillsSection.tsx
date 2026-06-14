"use client";

import { CSSProperties, useEffect, useRef } from "react";
import styles from "./SkillsSection.module.css";

const capabilities = [
  {
    title: "AI Systems",
    description:
      "Models become useful when the surrounding system is observable, recoverable, and grounded in the work it must perform.",
    items: [
      "Agent orchestration",
      "Tool routing",
      "RAG and context",
      "Voice workflows",
      "Evaluation",
    ],
    tools: "OpenAI / Claude / Deepgram / LangChain",
    featured: true,
  },
  {
    title: "Product Engineering",
    description:
      "Full-stack products that connect intelligent behavior to real-time human workflows.",
    items: ["React and Next.js", "TypeScript", "API design", "Realtime data"],
    tools: "Node.js / Supabase / PostgreSQL / AWS",
  },
  {
    title: "Interface & Motion",
    description:
      "Interaction and visual systems that make complex state legible without adding noise.",
    items: ["Interaction hierarchy", "Motion systems", "Data visualization"],
    tools: "GSAP / Three.js / Framer Motion / Figma",
  },
];

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll<HTMLElement>("[data-capability-card]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => card.classList.add(styles.cardVisible));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.cardVisible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" ref={sectionRef} className={styles.skillsSection}>
      <header className={styles.skillsHeader}>
        <h2>One practice, three operating layers.</h2>
        <p>
          I work across the system boundary, from model behavior and
          infrastructure to the interface people actually use.
        </p>
      </header>

      <div className={styles.capabilityGrid}>
        {capabilities.map((capability, index) => (
          <article
            key={capability.title}
            data-capability-card
            className={`${styles.capabilityCard} ${
              capability.featured ? styles.featuredCard : ""
            }`}
            style={{ "--card-delay": `${index * 90}ms` } as CSSProperties}
          >
            <div className={styles.cardSignal} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
            </div>
            <div>
              <ul>
                {capability.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className={styles.tools}>{capability.tools}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
