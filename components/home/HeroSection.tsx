"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import styles from "./HeroSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

const heroLines = [
    {
        index: "01",
        text: "Digital Philosopher",
        tone: "editorial",
    },
    {
        index: "02",
        text: "Creative Engineer",
        tone: "display",
    },
    {
        index: "03",
        text: "Human Architect",
        tone: "editorial",
    },
];

const HeroSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const kickerRef = useRef<HTMLParagraphElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subheadlineRef = useRef<HTMLParagraphElement>(null);

    useGSAP(
        () => {
            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
            });

            tl.from(kickerRef.current, {
                y: 20,
                opacity: 0,
                duration: 0.85,
            });

            tl.from(
                headlineRef.current?.querySelectorAll(`.${styles.headlineRow}`) || [],
                {
                    y: 92,
                    opacity: 0,
                    filter: "blur(7px)",
                    duration: 1.18,
                    stagger: 0.17,
                },
                "-=0.12"
            );

            tl.from(
                headlineRef.current?.querySelectorAll(`.${styles.lineIndex}`) || [],
                {
                    x: -18,
                    opacity: 0,
                    duration: 0.7,
                    stagger: 0.15,
                },
                "-=1.0"
            );

            tl.from(
                subheadlineRef.current,
                {
                    y: 26,
                    opacity: 0,
                    duration: 1,
                },
                "-=0.86"
            );

            if (contentRef.current && containerRef.current) {
                gsap.to(contentRef.current, {
                    opacity: 0.2,
                    yPercent: -10,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "62% center",
                        end: "bottom top",
                        scrub: 0.85,
                    },
                });
            }
        },
        { scope: containerRef }
    );

    const subheadlineText =
        "I shape interfaces where narrative, type, and interaction speak as one system.";

    return (
        <div id="home" ref={containerRef} className={styles.heroSection}>
            <div ref={contentRef} className={styles.content}>
                <p ref={kickerRef} className={`${styles.kicker} ${spaceGrotesk.className}`}>
                    KUMMA / Portfolio / 2026
                </p>
                <h1 ref={headlineRef} className={styles.headline}>
                    {heroLines.map((line) => (
                        <span key={line.index} className={styles.headlineRow}>
                            <span
                                className={`${styles.lineIndex} ${spaceGrotesk.className}`}
                                aria-hidden="true"
                            >
                                {line.index}
                            </span>
                            <span
                                className={`${styles.lineText} ${
                                    line.tone === "editorial"
                                        ? `${styles.editorialTone} ${cormorant.className}`
                                        : styles.displayTone
                                }`}
                            >
                                {line.text}
                            </span>
                        </span>
                    ))}
                </h1>
                <p ref={subheadlineRef} className={`${styles.subheadline} ${spaceGrotesk.className}`}>
                    {subheadlineText}
                </p>
            </div>
            <div className={styles.scrollIndicator}>Scroll ↓ to Begin</div>
        </div>
    );
};

export default HeroSection;
