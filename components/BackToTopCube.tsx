"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "../styles/BackToTopCube.module.css";

const BackToTopCube = () => {
  const containerRef = useRef<HTMLButtonElement>(null);
  const cuboidRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!cuboidRef.current) return;

    // Continuous rotation animation
    gsap.to(cuboidRef.current, {
      rotateY: 360,
      duration: 8,
      repeat: -1,
      ease: "none",
    });

    // Subtle wobble
    gsap.fromTo(
      cuboidRef.current,
      {
        rotateX: 5,
        rotateZ: -2,
      },
      {
        rotateX: -5,
        rotateZ: 2,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      }
    );
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      ref={containerRef}
      className={`${styles.backToTopContainer} ${isVisible ? styles.visible : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <div ref={cuboidRef} className={styles.cuboid}>
        <div className={`${styles.face} ${styles.faceFront}`}>
          <span className={styles.arrow}>↑</span>
        </div>
        <div className={`${styles.face} ${styles.faceBack}`}>
          <span className={styles.arrow}>↑</span>
        </div>
        <div className={`${styles.face} ${styles.faceTop}`}>
          <span className={styles.arrow}>↑</span>
        </div>
        <div className={`${styles.face} ${styles.faceBottom}`}>
          <span className={styles.arrow}>↑</span>
        </div>
        <div className={`${styles.face} ${styles.faceLeft}`}>
          <span className={styles.arrow}>↑</span>
        </div>
        <div className={`${styles.face} ${styles.faceRight}`}>
          <span className={styles.arrow}>↑</span>
        </div>
      </div>
    </button>
  );
};

export default BackToTopCube;
