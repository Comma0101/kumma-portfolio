"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../styles/logo3D.module.css";

gsap.registerPlugin(ScrollTrigger);

const Logo3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cuboidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !cuboidRef.current) return;

    // Set initial state
    gsap.set(cuboidRef.current, {
      rotateX: -90,
      opacity: 0,
    });

    // Animate to final state
    gsap.to(cuboidRef.current, {
      rotateX: 0,
      opacity: 1,
      duration: 1,
      ease: "power4.out",
      delay: 0.3,
    });

    // Subtle continuous wobble
    gsap.fromTo(
      cuboidRef.current,
      {
        rotateY: 3,
        rotateZ: -2,
      },
      {
        rotateY: -3,
        rotateZ: 2,
        duration: 2.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      }
    );

    // Scroll-triggered rotation
    gsap.to(cuboidRef.current, {
      rotateX: -360,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "+=5000", // Rotate over 5000px of scrolling
        scrub: 2,
      },
    });
  }, []);

  return (
    <div ref={containerRef} className={styles.logoContainer}>
      <div ref={cuboidRef} className={styles.logoCuboid}>
        <div className={`${styles.face} ${styles.faceFront}`}>
          <span className={styles.logoText}>KUMMA</span>
        </div>
        <div className={`${styles.face} ${styles.faceBack}`}>
          <span className={styles.logoText}>KUMMA</span>
        </div>
        <div className={`${styles.face} ${styles.faceTop}`}>
          <span className={styles.logoText}>KUMMA</span>
        </div>
        <div className={`${styles.face} ${styles.faceBottom}`}>
          <span className={styles.logoText}>KUMMA</span>
        </div>
      </div>
    </div>
  );
};

export default Logo3D;
