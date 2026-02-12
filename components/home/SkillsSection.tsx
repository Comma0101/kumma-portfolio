"use client";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import TechConstellation from "../TechConstellation";
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

const SkillsSection = () => {
    return (
        <section id="skills" className={styles.skillsSection}>
            <div className={styles.skillsHeader}>
                <p className={`${styles.skillsEyebrow} ${spaceGrotesk.className}`}>
                    Knowledge Graph
                </p>
                <h2 className={`${styles.skillsTitle} ${cormorant.className}`}>
                    The Systems Behind The Craft
                </h2>
                <p className={`${styles.skillsIntro} ${spaceGrotesk.className}`}>
                    A map of capabilities and how they connect in practice across
                    interface design, development, and delivery.
                </p>
            </div>
            <TechConstellation />
        </section>
    );
};

export default SkillsSection;
