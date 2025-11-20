"use client";
import TechConstellation from "../TechConstellation";
import styles from "./SkillsSection.module.css";

const SkillsSection = () => {
    return (
        <div id="skills" className={styles.skillsSection}>
            <TechConstellation />
        </div>
    );
};

export default SkillsSection;
