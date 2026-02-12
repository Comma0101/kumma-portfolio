"use client";
import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import gsap from "gsap";
import MorphingLogo from "./MorphingLogo";
import styles from "../styles/introAnimation.module.css";
import { useAnimation } from "../context/AnimationContext";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const IntroAnimation = () => {
  const { isIntroPlayed, setIsIntroPlayed } = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef(false);
  const pathname = usePathname();

  const shouldShowIntro = pathname !== "/stories" && !isIntroPlayed;

  const finishIntro = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setIsIntroPlayed(true);
  }, [setIsIntroPlayed]);

  const handleSkip = useCallback(() => {
    if (!containerRef.current) {
      finishIntro();
      return;
    }

    gsap.killTweensOf(containerRef.current);
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.45,
      ease: "power2.out",
      pointerEvents: "none",
      onComplete: finishIntro,
    });
  }, [finishIntro]);

  useEffect(() => {
    if (!shouldShowIntro || isIntroPlayed) return;
    const container = containerRef.current;
    if (!container) {
      finishIntro();
      return;
    }

    doneRef.current = false;
    const isCompact = window.matchMedia("(max-width: 680px)").matches;
    const holdOffset = isCompact ? 2.55 : 3.0;

    const safetyTimeout = setTimeout(() => {
      finishIntro();
    }, 7000);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      const quickFade = gsap.to(container, {
        duration: 0.35,
        opacity: 0,
        pointerEvents: "none",
        ease: "power2.out",
        onComplete: finishIntro,
      });

      return () => {
        clearTimeout(safetyTimeout);
        quickFade.kill();
      };
    }

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        clearTimeout(safetyTimeout);
        finishIntro();
      },
    });

    if (copyRef.current) {
      tl.fromTo(
        copyRef.current.children,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: isCompact ? 0.68 : 0.8,
          stagger: 0.1,
        },
        0.15
      );
    }

    if (skipRef.current) {
      tl.fromTo(
        skipRef.current,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45 },
        0.95
      );
    }

    if (copyRef.current) {
      tl.to(
        copyRef.current,
        {
          y: -18,
          opacity: 0,
          duration: isCompact ? 0.66 : 0.8,
          ease: "power2.inOut",
        },
        holdOffset
      );
    }

    tl.to(
      container,
      {
        duration: isCompact ? 0.72 : 0.86,
        opacity: 0,
        pointerEvents: "none",
        ease: "power2.inOut",
      },
      holdOffset + 0.2
    );

    return () => {
      clearTimeout(safetyTimeout);
      tl.kill();
    };
  }, [shouldShowIntro, isIntroPlayed, finishIntro]);

  if (!shouldShowIntro) {
    return null;
  }

  return (
    <div ref={containerRef} className={styles.introContainer}>
      <MorphingLogo />
      <div className={styles.introScrim} aria-hidden="true"></div>

      <div ref={copyRef} className={styles.introCopy}>
        <p className={`${styles.introEyebrow} ${spaceGrotesk.className}`}>
          KUMMA / Digital Atelier
        </p>
        <h1 className={`${styles.introTitle} ${cormorant.className}`}>
          Between Logic And Light
        </h1>
        <p className={`${styles.introLead} ${spaceGrotesk.className}`}>
          Interfaces built as living essays, where code, motion, and meaning
          move as one sequence.
        </p>
      </div>

      <button
        ref={skipRef}
        type="button"
        className={`${styles.skipButton} ${spaceGrotesk.className}`}
        onClick={handleSkip}
      >
        Skip Intro
      </button>
    </div>
  );
};

export default IntroAnimation;
