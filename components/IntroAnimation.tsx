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

    // Safety timeout - ensure animation completes even if GSAP fails
    const safetyTimeout = setTimeout(() => {
      if (!isIntroPlayed) {
        setIsIntroPlayed(true);
      }
    }, 6000); // 6 seconds max

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safetyTimeout);
        setIsIntroPlayed(true);
      },
    });

    tl.to(containerRef.current, {
      duration: 1,
      opacity: 0,
      pointerEvents: "none",
      zIndex: -1, // Move behind everything after fade
      ease: "power2.inOut",
      delay: 3, // Reduced from 5 to 3 seconds for faster reveal
    });

    return () => {
      clearTimeout(safetyTimeout);
      tl.kill();
    };
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
