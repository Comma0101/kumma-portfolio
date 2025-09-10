"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import styles from "../styles/home.module.css";
import { getAccessTokenFromCode } from "../app/api/PocketApi";
import ThreeScene from "../components/ThreeScene";

const Home = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const coderOverlayRef = useRef<HTMLDivElement>(null);

  console.log(getAccessTokenFromCode);

  // Helper function to split the headline text into individual spans
  const splitTextToSpans = (text: string) => {
    return text.split("").map((char, i) => (
      <span key={i} className={styles.letter}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    if (
      containerRef.current &&
      contentRef.current &&
      headlineRef.current &&
      subheadlineRef.current &&
      linksRef.current &&
      coderOverlayRef.current
    ) {
      // Overall container appears with a subtle scale & fade.
      tl.from(containerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 1,
      });

      // Animate the coder overlay into view (kept subtle).
      tl.from(
        coderOverlayRef.current,
        {
          x: 100,
          y: -50,
          opacity: 0,
          rotation: 5,
          duration: 1.2,
        },
        "-=0.8"
      );

      // Animate each letter of the headline with a staggered drop‑in.
      const letters = headlineRef.current.querySelectorAll(`.${styles.letter}`);
      tl.from(
        letters,
        {
          opacity: 0,
          y: -50,
          rotationX: 90,
          duration: 0.8,
          stagger: 0.05,
          ease: "back.out(1.7)",
        },
        "-=1"
      );

      // Animate the subheadline coming into view.
      tl.from(
        subheadlineRef.current,
        { opacity: 0, y: 30, duration: 1, ease: "power3.out" },
        "-=0.5"
      );

      // Animate the call-to-action links with a subtle scale effect.
      const links = linksRef.current.querySelectorAll(
        `.${styles.interactiveLink}`
      );
      tl.from(
        links,
        {
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          stagger: 0.2,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      );
    }
  }, []);

  // Poster-style headline and subheadline texts
  const headlineText = "CREATIVE CODER";
  const subheadlineText = "Art | Code | Innovation";

  return (
    <div ref={containerRef} className={styles.homeContainer}>
      {/* Subtle coder overlay in the background */}
      <div ref={coderOverlayRef} className={styles.coderOverlay}>
        <pre className={styles.codeSnippet}>
          {`// Code is poetry
const dream = () => "Create Magic";`}
        </pre>
      </div>
      <div ref={contentRef} className={styles.content}>
        <h1 ref={headlineRef} className={styles.headline}>
          {splitTextToSpans(headlineText)}
        </h1>
        <h2 ref={subheadlineRef} className={styles.subheadline}>
          {subheadlineText}
        </h2>
        <div ref={linksRef} className={styles.links}>
          <Link href="/artfulcode" className={styles.interactiveLink}>Artful Code</Link>
          <Link href="/gallery" className={styles.interactiveLink}>Gallery</Link>
          <Link href="/blog" className={styles.interactiveLink}>Blog</Link>
          <Link href="/projects" className={styles.interactiveLink}>Projects</Link>
          <ThreeScene />
        </div>
      </div>
    </div>
  );
};

export default Home;
