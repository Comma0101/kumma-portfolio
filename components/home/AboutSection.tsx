"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./AboutSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const AboutSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quoteRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        console.log("[AboutSection] mounted", quoteRef.current);
    }, []);

    useGSAP(
        () => {
            const quoteElement = quoteRef.current;
            if (!quoteElement) return;

            const wordNodes = quoteElement.querySelectorAll<HTMLElement>(
                `.${styles.aboutQuoteWord}`
            );
            if (!wordNodes.length) return;

            gsap.set(wordNodes, { "--weight": 80, color: "#c0c0c0" });

            wordNodes.forEach((word, index) => {
                gsap.to(word, {
                    "--weight": 320,
                    color: "#ff4d4d",
                    duration: 0.6,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: word,
                        start: "top 85%",
                        end: "top 45%",
                        scrub: true,
                        markers: false,
                    },
                });
            });
        },
        { scope: containerRef }
    );

    const quoteText =
        "I build systems that feel. Not just interfaces, but living frames where code shapes light, motion finds meaning, and small choices ripple into experience. Each project starts as a question—then becomes a place you can walk through.";

    return (
        <div
            id="about"
            ref={containerRef}
            className={styles.aboutSection}
        >
            <div className={styles.aboutWrapper}>
                <h2 ref={quoteRef} className={styles.aboutQuote}>
                    {quoteText.split(" ").map((word, i) => (
                        <span
                            key={i}
                            className={styles.aboutQuoteWord}
                            style={{ display: "inline-block", marginRight: "0.2em" }}
                        >
                            {word}
                        </span>
                    ))}
                </h2>
            </div>
        </div>
    );
};

export default AboutSection;
