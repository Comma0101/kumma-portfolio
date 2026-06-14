"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero-copy]", {
          y: 28,
          opacity: 0,
          duration: 0.8,
          stagger: 0.09,
        })
        .from(
          "[data-hero-preview]",
          { y: 24, opacity: 0, scale: 0.98, duration: 0.9 },
          0.18,
        )
        .from(
          "[data-pipeline-stage]",
          { x: -12, opacity: 0, duration: 0.45, stagger: 0.08 },
          0.55,
        );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="home" className={styles.hero}>
      <div className={styles.heroShell}>
        <div className={styles.heroCopy}>
          <p data-hero-copy className={styles.eyebrow}>
            KUMMA / AI Systems
          </p>
          <h1 data-hero-copy className={styles.heroTitle}>
            AI systems,
            <span>made operational.</span>
          </h1>
          <p data-hero-copy className={styles.heroDescription}>
            Real-time agents, product interfaces, and reliable infrastructure
            for complex operational work.
          </p>
          <div data-hero-copy className={styles.heroActions}>
            <a href="#projects" className={styles.primaryAction}>
              View Work
            </a>
            <a href="#contact" className={styles.secondaryAction}>
              Contact
            </a>
          </div>
        </div>

        <div
          data-hero-preview
          className={styles.systemPreview}
          aria-label="KOTA voice ordering workflow preview"
        >
          <div className={styles.previewHeader}>
            <div>
              <span className={styles.previewKicker}>KOTA</span>
              <p>Voice workflow</p>
            </div>
            <span className={styles.liveStatus}>Live system</span>
          </div>

          <div className={styles.transcript}>
            <span>Customer transcript</span>
            <p>&ldquo;Two orange chicken, one chow mein.&rdquo;</p>
          </div>

          <div className={styles.pipeline}>
            {["Speech", "Intent", "Order"].map((stage, index) => (
              <div data-pipeline-stage className={styles.pipelineStage} key={stage}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{stage}</strong>
              </div>
            ))}
          </div>

          <div className={styles.orderData}>
            <div>
              <span>Item</span>
              <strong>Orange chicken</strong>
              <b>x2</b>
            </div>
            <div>
              <span>Side</span>
              <strong>Chow mein</strong>
              <b>x1</b>
            </div>
          </div>

          <div className={styles.previewFooter}>
            <span>Customer call</span>
            <div aria-hidden="true" />
            <span>Kitchen action</span>
          </div>
        </div>
      </div>
    </section>
  );
}
