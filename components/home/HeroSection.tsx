"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Button from "@/components/system/Button";
import styles from "./HeroSection.module.css";

const heroSignals = [
  ["KOTA", "call -> order"],
  ["ARCHON", "route -> worker"],
  ["Markets", "signal -> rule"],
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
          I build AI that runs in production, <em>not in demos.</em>
        </h1>
        <div data-hero-rise className={styles.systemProof}>
          <p className={styles.subtext}>
            Real-time voice, agent orchestration, and decision systems built
            around messy inputs, visible guardrails, and reliable outputs.
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
          <Button href="/build" variant="primary">
            Work with me →
          </Button>
          <Button href="#work" variant="ghost">
            See the systems →
          </Button>
        </div>
        <p data-hero-rise className={styles.availability}>
          I design and ship real-time voice and agent systems for teams that
          need them running in production — fixed-scope builds and consulting.
          Usually replies within a day.
        </p>
      </div>
    </section>
  );
}
