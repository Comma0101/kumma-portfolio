"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Button from "@/components/system/Button";
import { heroContent, productionBoundaries } from "./homeContent";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const titleLead = heroContent.title.slice(
    0,
    -heroContent.titleEmphasis.length,
  );

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
    <section
      ref={ref}
      id="home"
      className={styles.hero}
      data-immersive-stage="hero"
    >
      <div className={styles.inner}>
        <p data-hero-rise className={styles.eyebrow}>
          {heroContent.eyebrow}
        </p>
        <h1 data-hero-rise className={styles.title}>
          {titleLead}
          <em>{heroContent.titleEmphasis}</em>
        </h1>
        <div data-hero-rise className={styles.systemProof}>
          <p className={styles.subtext}>{heroContent.subtext}</p>
          <ul
            className={styles.signalRail}
            aria-label="Three production AI boundaries"
          >
            {productionBoundaries.map((boundary) => (
              <li key={boundary.label} className={styles.signalItem}>
                <span className={styles.signalName}>{boundary.label}</span>
                <span className={styles.signalFlow}>
                  {boundary.explanation}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div data-hero-rise className={styles.actions}>
          <Button href={heroContent.primaryCta.href} variant="primary">
            {heroContent.primaryCta.label}
          </Button>
          <Button href={heroContent.secondaryCta.href} variant="ghost">
            {heroContent.secondaryCta.label}
          </Button>
        </div>
        <p data-hero-rise className={styles.availability}>
          {heroContent.availability}
        </p>
      </div>
    </section>
  );
}
