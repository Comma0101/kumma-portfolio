"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import MorphingLogo from "./MorphingLogo";
import styles from "../styles/introAnimation.module.css";
import { useAnimation } from "../context/AnimationContext";

const IntroAnimation = () => {
  const { isIntroPlayed, setIsIntroPlayed } = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isIntroPlayed) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsIntroPlayed(true);
      },
    });

    tl.to(containerRef.current, {
      duration: 1,
      opacity: 0,
      pointerEvents: "none",
      ease: "power2.inOut",
      delay: 5, // Wait for the morph to finish
    });
  }, [isIntroPlayed, setIsIntroPlayed]);

  if (isIntroPlayed) {
    return null;
  }

  return (
    <div ref={containerRef} className={styles.introContainer}>
      <MorphingLogo />
    </div>
  );
};

export default IntroAnimation;
