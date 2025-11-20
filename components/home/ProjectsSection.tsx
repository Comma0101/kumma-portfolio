"use client";
import Projects from "../Projects";
import styles from "../../styles/home.module.css";

const ProjectsSection = () => {
    return (
        <div id="projects" className={styles.projectsSection}>
            <Projects />
        </div>
    );
};

export default ProjectsSection;
