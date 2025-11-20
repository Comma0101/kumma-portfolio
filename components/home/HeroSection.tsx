"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./HeroSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subheadlineRef = useRef<HTMLHeadingElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);

    const splitTextToSpans = (text: string) => {
        const lines = text.split(".");
        return lines.map((line, lineIndex) => (
            <span key={lineIndex} className={styles.headlineLine}>
                {line.split("").map((char, charIndex) => (
                    <span key={charIndex} className={styles.letter}>
                        {char === " " ? "\u00A0" : char}
                    </span>
                ))}
            </span>
        ));
    };

    useGSAP(
        () => {
            const tl = gsap.timeline({
                defaults: { ease: "power4.out", duration: 2.5 },
            });

            if (headlineRef.current) {
                tl.from(headlineRef.current.querySelectorAll(`.${styles.letter}`), {
                    y: 120,
                    opacity: 0,
                    stagger: 0.08,
                    rotateX: -90,
                    transformOrigin: "center top",
                });
            }

            if (subheadlineRef.current) {
                tl.from(
                    subheadlineRef.current,
                    { y: 60, opacity: 0, duration: 2 },
                    "-=2"
                );
            }

            if (linksRef.current) {
                tl.from(linksRef.current, { opacity: 0, y: 30, duration: 1.5 }, "-=1.5");
            }

            // Scroll-triggered animations
            if (contentRef.current && containerRef.current) {
                gsap.to(contentRef.current, {
                    opacity: 0,
                    scale: 1.05,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "center center",
                        end: "bottom top",
                        scrub: 1,
                    },
                });
            }
        },
        { scope: containerRef }
    );

    const headlineText = "Digital Philosopher.Creative Engineer. Human Architect";
    const subheadlineText = "Art | Code | Innovation";

    return (
        <div id="home" ref={containerRef} className={styles.heroSection}>
            <div ref={contentRef} className={styles.content}>
                <h1 ref={headlineRef} className={styles.headline}>
                    {splitTextToSpans(headlineText)}
                </h1>
                <h2 ref={subheadlineRef} className={styles.subheadline}>
                    {subheadlineText}
                </h2>
                <div ref={linksRef} className={styles.links}></div>
            </div>
            <div className={styles.scrollIndicator}>Scroll ↓ to Begin</div>
        </div>
    );
};

export default HeroSection;
