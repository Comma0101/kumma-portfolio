"use client";
import React from "react";
import styles from "../styles/projects.module.css";

const projectData = [
  {
    id: 1,
    title: "Project One",
    description: "A short description of the first project.",
    image: "/images/collection1/img1.jpg",
    link: "#",
  },
  {
    id: 2,
    title: "Project Two",
    description: "A short description of the second project.",
    image: "/images/collection1/img2.jpg",
    link: "#",
  },
  {
    id: 3,
    title: "Project Three",
    description: "A short description of the third project.",
    image: "/images/collection1/img3.jpg",
    link: "#",
  },
  {
    id: 4,
    title: "Project Four",
    description: "A short description of the fourth project.",
    image: "/images/collection2/img1.jpg",
    link: "#",
  },
  {
    id: 5,
    title: "Project Five",
    description: "A short description of the fifth project.",
    image: "/images/collection2/img2.jpg",
    link: "#",
  },
];

const Projects = () => {
  return (
    <div className={`${styles.projectsContainer} gsap-projects-container`}>
      {projectData.map((project) => (
        <div key={project.id} className={`${styles.projectCard} gsap-project-card`}>
          <img src={project.image} alt={project.title} className={styles.projectImage} loading="lazy" />
          <div className={styles.projectInfo}>
            <h3 className={styles.projectTitle}>{project.title}</h3>
            <p className={styles.projectDescription}>{project.description}</p>
            <a href={project.link} className={styles.projectLink}>
              View Project
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Projects;
