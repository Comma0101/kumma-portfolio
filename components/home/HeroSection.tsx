"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Button from "@/components/system/Button";
import KotaCallDemo from "./KotaCallDemo";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-hero-rise]", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="home" className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p data-hero-rise className={styles.eyebrow}>
            AI systems engineer · Los Angeles
          </p>
          <h1 data-hero-rise className={styles.title}>
            I build AI systems that <em>act in the real world.</em>
          </h1>
          <p data-hero-rise className={styles.subtext}>
            Real-time voice agents and multi-model orchestration. KOTA, shown
            here, turns restaurant calls into kitchen-ready orders.
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
        <div data-hero-rise className={styles.demo}>
          <KotaCallDemo />
        </div>
      </div>
    </section>
  );
}
