"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import MorphingLogo from "./MorphingLogo";
import styles from "../styles/introAnimation.module.css";
import { useAnimation } from "../context/AnimationContext";

const IntroAnimation = () => {
  const { isIntroPlayed, setIsIntroPlayed } = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Skip intro animation on stories page
  const shouldShowIntro = pathname !== "/stories" && !isIntroPlayed;

  useEffect(() => {
    if (!shouldShowIntro || isIntroPlayed) return;

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
  }, [shouldShowIntro, isIntroPlayed, setIsIntroPlayed]);

  if (!shouldShowIntro) {
    return null;
  }

  return (
    <div ref={containerRef} className={styles.introContainer}>
      <MorphingLogo />
    </div>
  );
};

export default IntroAnimation;
