"use client";
// Projects.tsx
import { useState } from "react";
import styles from "../styles/artfulcode.module.css";
import { projects } from "./artfulData";
import { FC } from "react";
const Artfulcode: FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalProjects = projects.length;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : totalProjects - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < totalProjects - 1 ? prevIndex + 1 : 0
    );
  };

  return (
    <div className={styles.projectsContainer}>
      <div
        className={styles.gallery}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {projects.map((project, index) => (
          <div key={project.id} className={styles.projectItem}>
            {index === currentIndex && <project.canvasComponent />}
            <div className={styles.projectTitle}>{project.title}</div>
          </div>
        ))}
      </div>
      <button
        className={styles.prevButton}
        onClick={handlePrev}
        aria-label="Previous Project"
      >
        &#10094;
      </button>
      <button
        className={styles.nextButton}
        onClick={handleNext}
        aria-label="Next Project"
      >
        &#10095;
      </button>
    </div>
  );
};

export default Artfulcode;
