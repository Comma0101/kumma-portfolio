"use client";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import styles from "./AboutSection.module.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const AboutSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasActivated, setHasActivated] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.28) {
          setHasActivated(true);
        }
      },
      {
        threshold: [0.2, 0.28, 0.4],
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const quoteText =
    "I build systems that feel. Not just interfaces, but living frames where code shapes light, motion finds meaning, and small choices ripple into experience. Each project starts as a question—then becomes a place you can walk through.";
  const words = quoteText.split(" ");
  const accentWords = new Set([
    "feel",
    "light",
    "motion",
    "question",
    "place",
    "systems",
    "experience",
  ]);

  return (
    <section
      id="about"
      ref={containerRef}
      className={`${styles.aboutSection} ${hasActivated ? styles.aboutActive : ""}`}
    >
      <div className={styles.aboutHeader}>
        <p className={`${styles.aboutEyebrow} ${spaceGrotesk.className}`}>Manifesto</p>
        <p className={`${styles.aboutMeta} ${spaceGrotesk.className}`}>
          chapter / 02
        </p>
      </div>

      <div className={styles.aboutWrapper}>
        <h2 className={`${styles.aboutQuote} ${cormorant.className}`}>
          {words.map((word, i) => {
            const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
            const isAccent = accentWords.has(normalized);
            return (
              <span
                key={`${word}-${i}`}
                className={`${styles.aboutQuoteWord} ${
                  isAccent ? styles.aboutAccentWord : ""
                }`}
                style={{ "--word-index": i } as CSSProperties}
              >
                {word}
              </span>
            );
          })}
        </h2>
      </div>
    </section>
  );
};

export default AboutSection;
