"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Button from "@/components/system/Button";
import styles from "./HeroSection.module.css";

const heroSignals = [
  ["KOTA", "call -> order"],
  ["ARCHON", "route -> worker"],
  ["Stress suite", "scenario -> score"],
] as const;

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-hero-rise]", {
        y: 26,
        opacity: 0,
        duration: 0.8,
        stagger: 0.09,
        ease: "power3.out",
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="home" className={styles.hero}>
      <div className={styles.inner}>
        <p data-hero-rise className={styles.eyebrow}>
          Real-time voice · agent systems · Los Angeles
        </p>
        <h1 data-hero-rise className={styles.title}>
          Real-time voice AI, built and <em>broken in public.</em>
        </h1>
        <div data-hero-rise className={styles.systemProof}>
          <p className={styles.subtext}>
            I design and ship voice agents that survive real phone calls —
            streaming speech, agent orchestration, and the guardrails between
            them. Call the line and try to break it.
          </p>
          <ul className={styles.signalRail} aria-label="Operational signals">
            {heroSignals.map(([name, flow]) => (
              <li key={name} className={styles.signalItem}>
                <span className={styles.signalName}>{name}</span>
                <span className={styles.signalFlow}>{flow}</span>
              </li>
            ))}
          </ul>
        </div>
        <div data-hero-rise className={styles.actions}>
          <Button href="/call" variant="primary">
            Call the line →
          </Button>
          <Button href="/contact" variant="ghost">
            Bring me a problem →
          </Button>
        </div>
        <p data-hero-rise className={styles.availability}>
          Independent voice AI systems builder, Los Angeles. Available for
          audits, builds, and advisory. Usually replies within a day.
        </p>
      </div>
    </section>
  );
}
