"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import { useTransition } from "../../context/TransitionContext";
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
    capabilities: string[];
    tools?: string;
}

const disciplines: Discipline[] = [
    {
        id: "creative-direction",
        index: "01",
        label: "Creative Direction",
        description:
            "Shaping voice, visual identity, and the emotional arc of digital products.",
        capabilities: [
            "Concept framing",
            "Product narrative",
            "Brand positioning",
            "Experience vision",
            "Aesthetic systems",
        ],
    },
    {
        id: "visual-storytelling",
        index: "02",
        label: "Visual Storytelling",
        description:
            "Translating narrative into image, layout, and sequential experience.",
        capabilities: [
            "Art direction",
            "Editorial layouts",
            "Narrative sequencing",
            "Image language",
            "Campaign thinking",
        ],
    },
    {
        id: "interface-design",
        index: "03",
        label: "Interface Design",
        description:
            "Building systems that think in components and respond with intention.",
        capabilities: [
            "UX architecture",
            "Interaction systems",
            "Component thinking",
            "Design systems",
            "Conversion-aware UI",
        ],
    },
    {
        id: "motion-time",
        index: "04",
        label: "Motion & Time",
        description:
            "Choreographing transition, scroll pacing, and spatial feedback.",
        capabilities: [
            "Motion rhythm",
            "Transitional storytelling",
            "Interaction timing",
            "Spatial pacing",
            "Cinematic web feel",
        ],
    },
    {
        id: "product-engineering",
        index: "05",
        label: "Product Engineering",
        description:
            "Architecting resilient frontends and connecting systems functionally.",
        capabilities: [
            "Frontend architecture",
            "Realtime systems",
            "API integration",
            "State management",
            "Production debugging",
        ],
        tools: "React, Next.js, TypeScript, Tailwind, Supabase",
    },
    {
        id: "ai-systems",
        index: "06",
        label: "AI Agent Systems",
        description:
            "Designing logic networks where language models act as operators.",
        capabilities: [
            "Voice agent workflows",
            "Tool orchestration",
            "Prompt & system design",
            "Automation pipelines",
            "Human-in-the-loop ops",
        ],
        tools: "OpenAI/Gemini, Twilio, Deepgram, LangChain",
    },
    {
        id: "systems-thinking",
        index: "07",
        label: "Systems Thinking",
        description:
            "Optimizing complex feedback loops into performant architecture.",
        capabilities: [
            "Decision frameworks",
            "Behavioral loops",
            "Execution protocols",
            "Data-driven iteration",
            "Performance optimization",
        ],
    },
    {
        id: "photography",
        index: "08",
        label: "Photography",
        description:
            "Capturing light, texture, and atmosphere as a form of inquiry.",
        capabilities: [
            "Composition",
            "Mood framing",
            "Texture & light",
            "Documentary eye",
            "Visual archive building",
        ],
    },
];

const SkillsSection = () => {
    const { triggerTransition } = useTransition();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [hasEntered, setHasEntered] = useState(false);
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

    const handleReadManifesto = (e: React.MouseEvent) => {
        e.preventDefault();
        triggerTransition();
    };

    return (
        <section
            id="skills"
            className={styles.skillsSection}
            ref={sectionRef}
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
                    Operating Range
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
                            onMouseLeave={() => setActiveId(null)}
                        >
                            <div
                                className={styles.rowHeader}
                                onMouseEnter={() => setActiveId(discipline.id)}
                            >
                                <span
                                    className={`${styles.rowIndex} ${spaceGrotesk.className}`}
                                >
                                    {discipline.index}
                                </span>
                                <div className={styles.rowContent}>
                                    <span
                                        className={`${styles.rowLabel} ${cormorant.className} ${isActive ? styles.rowLabelActive : ""
                                            }`}
                                    >
                                        {discipline.label}
                                    </span>
                                    <span
                                        className={`${styles.rowDescription} ${spaceGrotesk.className} ${isActive
                                            ? styles.rowDescriptionVisible
                                            : ""
                                            }`}
                                    >
                                        {discipline.description}
                                    </span>
                                </div>
                            </div>

                            <div
                                className={`${styles.expandedContent} ${isActive ? styles.expandedContentVisible : ""}`}
                            >
                                <div className={styles.capabilitiesWrapper}>
                                    <ul className={`${styles.capabilitiesList} ${spaceGrotesk.className}`}>
                                        {discipline.capabilities.map((cap, i) => (
                                            <li key={i}>{cap}</li>
                                        ))}
                                    </ul>
                                    {discipline.tools && (
                                        <div className={`${styles.toolsStack} ${spaceGrotesk.className}`}>
                                            <span className={styles.toolsLabel}>Selected tools:</span> {discipline.tools}
                                        </div>
                                    )}
                                    <button
                                        className={`${styles.manifestoLink} ${spaceGrotesk.className}`}
                                        onClick={handleReadManifesto}
                                    >
                                        Read the philosophy behind the build ↓
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section >
    );
};

export default SkillsSection;
