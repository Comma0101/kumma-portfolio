"use client";

import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import Image from "next/image";
import styles from "./SkillsSection.module.css";

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

interface Discipline {
    id: string;
    index: string;
    label: string;
    description: string;
    image: string;
}

const disciplines: Discipline[] = [
    {
        id: "creative-direction",
        index: "01",
        label: "Creative Direction",
        description:
            "Shaping voice, visual identity, and the emotional arc of digital products.",
        image: "/images/collection1.jpg",
    },
    {
        id: "visual-storytelling",
        index: "02",
        label: "Visual Storytelling",
        description:
            "Translating narrative into image, layout, and sequential experience.",
        image: "/images/collection2.jpg",
    },
    {
        id: "interface-design",
        index: "03",
        label: "Interface Design",
        description:
            "Building systems that think in components and respond with intention.",
        image: "/images/collection1/img1.jpg",
    },
    {
        id: "motion-time",
        index: "04",
        label: "Motion & Time",
        description:
            "Choreographing transition, scroll pacing, and spatial feedback.",
        image: "/images/collection1/img2.jpg",
    },
    {
        id: "photography",
        index: "05",
        label: "Photography",
        description:
            "Capturing light, texture, and atmosphere as a form of inquiry.",
        image: "/images/collection2/img1.jpg",
    },
    {
        id: "editorial-writing",
        index: "06",
        label: "Editorial & Writing",
        description:
            "Structuring thought into prose, copy, and typographic composition.",
        image: "/images/collection2/img2.jpg",
    },
];

const SkillsSection = () => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [hasEntered, setHasEntered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const sectionRef = useRef<HTMLElement>(null);

    // Scroll-triggered entrance
    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
                    setHasEntered(true);
                    observer.disconnect();
                }
            },
            { threshold: [0.1, 0.15, 0.25] }
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    // Track mouse for floating image
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    }, []);

    const activeDiscipline = activeId
        ? disciplines.find((d) => d.id === activeId) ?? null
        : null;

    return (
        <section
            id="skills"
            className={styles.skillsSection}
            ref={sectionRef}
            onMouseMove={handleMouseMove}
        >
            <div className={styles.skillsHeader}>
                <div className={styles.skillsHeaderTop}>
                    <p
                        className={`${styles.skillsEyebrow} ${spaceGrotesk.className}`}
                    >
                        Disciplines
                    </p>
                    <p
                        className={`${styles.skillsMeta} ${spaceGrotesk.className}`}
                    >
                        chapter / 04
                    </p>
                </div>
                <h2
                    className={`${styles.skillsTitle} ${cormorant.className}`}
                >
                    The Range of the Work
                </h2>
                <p
                    className={`${styles.skillsIntro} ${spaceGrotesk.className}`}
                >
                    A practice that moves between direction, design, image, and
                    language — each discipline shaping the others.
                </p>
            </div>

            <div className={styles.roster}>
                {disciplines.map((discipline, index) => {
                    const isActive = activeId === discipline.id;
                    const isMuted = activeId !== null && !isActive;

                    const rowClasses = [styles.rosterRow];
                    if (hasEntered) rowClasses.push(styles.rosterRowVisible);
                    if (isMuted) rowClasses.push(styles.rosterRowMuted);

                    return (
                        <div
                            key={discipline.id}
                            className={rowClasses.join(" ")}
                            style={
                                {
                                    "--row-delay": `${index * 80}ms`,
                                } as CSSProperties
                            }
                            onMouseEnter={() => setActiveId(discipline.id)}
                            onMouseLeave={() => setActiveId(null)}
                        >
                            <span
                                className={`${styles.rowIndex} ${spaceGrotesk.className}`}
                            >
                                {discipline.index}
                            </span>
                            <div className={styles.rowContent}>
                                <span
                                    className={`${styles.rowLabel} ${cormorant.className} ${
                                        isActive ? styles.rowLabelActive : ""
                                    }`}
                                >
                                    {discipline.label}
                                </span>
                                <span
                                    className={`${styles.rowDescription} ${spaceGrotesk.className} ${
                                        isActive
                                            ? styles.rowDescriptionVisible
                                            : ""
                                    }`}
                                >
                                    {discipline.description}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Floating hover image */}
            <div
                className={`${styles.floatingImage} ${
                    activeDiscipline ? styles.floatingImageVisible : ""
                }`}
                style={{
                    left: mousePos.x,
                    top: mousePos.y,
                }}
            >
                {activeDiscipline && (
                    <Image
                        src={activeDiscipline.image}
                        alt=""
                        width={240}
                        height={320}
                        unoptimized
                    />
                )}
            </div>
        </section>
    );
};

export default SkillsSection;
