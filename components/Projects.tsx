'use client';
import { useState } from "react";
import styles from "../styles/projects.module.css";

// Define project interface
interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  links: {
    demo?: string;
    github?: string;
    article?: string;
  };
}

const Projects = () => {
  // Sample project data
  const [projects] = useState<Project[]>([
    {
      id: 1,
      title: "Neural Terrain Generation",
      description:
        "A procedural terrain generator using deep learning techniques. The system analyzes thousands of real-world terrain samples and generates realistic landscapes that can be used in game development or simulations.",
      image: "/images/collection1.jpg", // Updated path
      tags: ["Machine Learning", "Three.js", "WebGL", "Python"],
      links: {
        demo: "https://example.com/demo",
        github: "https://github.com/yourusername/terrain-gen",
      },
    },
    {
      id: 2,
      title: "Interactive Data Visualization",
      description:
        "An interactive dashboard for visualizing complex datasets. Features include real-time filtering, customizable charts, and data export capabilities.",
      image: "/images/collection2.jpg", // Updated path
      tags: ["D3.js", "React", "TypeScript", "Data Visualization"],
      links: {
        demo: "https://example.com/dataviz",
        github: "https://github.com/yourusername/data-viz",
        article: "https://medium.com/your-article",
      },
    },
    {
      id: 3,
      title: "AI Content Curator",
      description:
        "An AI-powered system that curates personalized content from various sources. Using natural language processing and user preferences, it delivers tailored recommendations.",
      image: "/images/collection1/img1.jpg", // Updated path
      tags: ["AI", "NLP", "Python", "React"],
      links: {
        github: "https://github.com/yourusername/ai-curator",
      },
    },
    {
      id: 4,
      title: "Audio Spectrum Analyzer",
      description:
        "A real-time audio spectrum analyzer that visualizes sound frequencies. Perfect for music producers and audio engineers looking to analyze audio characteristics.",
      image: "/images/collection1/img2.jpg", // Updated path
      tags: ["Web Audio API", "Canvas", "JavaScript"],
      links: {
        demo: "https://example.com/audio-analyzer",
        github: "https://github.com/yourusername/audio-analyzer",
      },
    },
    {
      id: 5,
      title: "Minimalist Task Manager",
      description:
        "A clean, distraction-free task management application focused on simplicity and efficiency. Features keyboard shortcuts and seamless synchronization across devices.",
      image: "/images/collection2/img1.jpg", // Updated path
      tags: ["React", "PWA", "IndexedDB", "Firebase"],
      links: {
        demo: "https://example.com/tasks",
        github: "https://github.com/yourusername/task-manager",
      },
    },
  ]);

  return (
    <div className={styles.projectsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Projects</h1>
      </div>

      <div className={styles.scrollContainer}>
        {projects.map((project, index) => (
          <div key={project.id} className={styles.projectItem}>
            <div className={styles.projectContent} data-index={index}>
              <div className={styles.projectImage}>
                <img
                  src={project.image}
                  alt={project.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/images/collection1.jpg"; // Updated fallback path
                  }}
                />
                <div className={styles.projectOverlay}></div>
              </div>

              <div className={styles.projectDetails}>
                <h2 className={styles.projectTitle}>{project.title}</h2>
                <div className={styles.tags}>
                  {project.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <p className={styles.projectDescription}>{project.description}</p>

                <div className={styles.projectLinks}>
                  {project.links.demo && (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      Live Demo
                    </a>
                  )}

                  {project.links.github && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      GitHub
                    </a>
                  )}

                  {project.links.article && (
                    <a
                      href={project.links.article}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      Read Article
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
