"use client";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import { useTransition } from "../../context/TransitionContext";
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

const quoteText =
  "I build systems that operate. Not just models, but living architectures where agents reason, orchestration finds reliability, and small decisions compound into trust. Each system starts as a constraint, then becomes infrastructure you can depend on.";

const accentWords = new Set([
  "operate",
  "agents",
  "orchestration",
  "constraint",
  "infrastructure",
  "systems",
  "trust",
]);

const intentWords = new Set(["i", "build", "systems", "that", "operate"]);
const rippleWords = new Set(["small", "decisions", "compound", "into", "trust"]);
const placeWords = new Set(["becomes", "infrastructure", "you", "can", "depend", "on"]);

type MotionRole = "intent" | "pulse" | "ripple" | "question" | "place" | null;

type QuoteWord = {
  text: string;
  isAccent: boolean;
  motionRole: MotionRole;
  motionOrder?: number;
};

type WordStyle = CSSProperties & {
  "--word-index": number;
  "--motion-order"?: number;
};

const normalizeWord = (word: string) =>
  word.toLowerCase().replace(/[^a-z]/g, "");

const AboutSection = () => {
  const { isComplete } = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasScrolledIntoView, setHasScrolledIntoView] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          setHasScrolledIntoView(true);
        }
      },
      {
        threshold: [0.1, 0.15, 0.25],
        rootMargin: "0px 0px -10% 0px"
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // The animation triggers if the user scrolls to it normally OR if they arrive via the transition tunnel
  useEffect(() => {
    if (hasScrolledIntoView || isComplete) {
      setHasActivated(true);
    }
  }, [hasScrolledIntoView, isComplete]);

  const quoteWords = useMemo<QuoteWord[]>(() => {
    const words = quoteText.split(" ");
    const questionIndex = words.findIndex((word) =>
      normalizeWord(word).includes("question")
    );

    let intentOrder = 0;
    let pulseOrder = 0;
    let rippleOrder = 0;
    let placeOrder = 0;

    return words.map((word, index) => {
      const normalized = normalizeWord(word);
      const isQuestion = normalized.includes("question");
      const isAfterQuestion = questionIndex !== -1 && index > questionIndex;
      const isIntent = index <= 4 && intentWords.has(normalized);
      const isRipple = rippleWords.has(normalized);
      const isPlace = isAfterQuestion && placeWords.has(normalized);
      const isAccent = accentWords.has(normalized) || isQuestion;

      let motionRole: MotionRole = null;
      let motionOrder: number | undefined;

      if (isQuestion) {
        motionRole = "question";
      } else if (isPlace) {
        motionRole = "place";
        motionOrder = placeOrder++;
      } else if (isRipple) {
        motionRole = "ripple";
        motionOrder = rippleOrder++;
      } else if (isIntent) {
        motionRole = "intent";
        motionOrder = intentOrder++;
      } else if (isAccent) {
        motionRole = "pulse";
        motionOrder = pulseOrder++;
      }

      return {
        text: word,
        isAccent,
        motionRole,
        motionOrder,
      };
    });
  }, []);

  return (
    <section
      id="about"
      ref={containerRef}
      className={`${styles.aboutSection} ${hasActivated ? styles.aboutActive : ""}`}
    >
      <div className={styles.aboutHeader}>
        <p className={`${styles.aboutEyebrow} ${spaceGrotesk.className}`}>Thesis</p>
        <p className={`${styles.aboutMeta} ${spaceGrotesk.className}`}>
          Systems practice
        </p>
      </div>

      <div className={styles.aboutWrapper}>
        <h2 className={`${styles.aboutQuote} ${cormorant.className}`}>
          {quoteWords.map((word, i) => {
            const motionClass =
              word.motionRole === "intent"
                ? styles.aboutIntentWord
                : word.motionRole === "pulse"
                  ? styles.aboutPulseWord
                  : word.motionRole === "ripple"
                    ? styles.aboutRippleWord
                    : word.motionRole === "question"
                      ? styles.aboutQuestionWord
                      : word.motionRole === "place"
                        ? styles.aboutPlaceWord
                        : "";

            const wordStyle: WordStyle = {
              "--word-index": i,
            };

            if (word.motionOrder !== undefined) {
              wordStyle["--motion-order"] = word.motionOrder;
            }

            return (
              <span
                key={`${word.text}-${i}`}
                className={`${styles.aboutQuoteWord} ${word.isAccent ? styles.aboutAccentWord : ""
                  } ${motionClass}`}
                style={wordStyle}
              >
                {word.text}
              </span>
            );
          })}
        </h2>
      </div>
    </section>
  );
};

export default AboutSection;
