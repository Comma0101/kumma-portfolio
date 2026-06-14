"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Button from "@/components/system/Button";
import styles from "./HeroSection.module.css";

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
          Independent systems builder · Los Angeles
        </p>
        <h1 data-hero-rise className={styles.title}>
          I build intelligent systems <em>for the real world.</em>
        </h1>
        <p data-hero-rise className={styles.subtext}>
          Real-time AI, agent infrastructure, and operational products. Built to
          run past the prototype.
        </p>
        <div data-hero-rise className={styles.actions}>
          <Button href="#work" variant="primary">
            View systems →
          </Button>
          <Button href="#contact" variant="ghost">
            Contact
          </Button>
        </div>
      </div>
    </section>
  );
}
