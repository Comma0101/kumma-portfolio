"use client";
import React from "react";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import styles from "@/styles/projectDetail.module.css";
import customStyles from "@/styles/customProject.module.css";
import type { Project } from "@/data/projectData";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function ArchonDetail({ project }: { project: Project }) {
  const stackSummary = project.techStack?.map((t) => t.name).join(" · ") || "";
  
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <p className={`${styles.eyebrow} ${spaceGrotesk.className}`}>Case Study / 02</p>
        <h1 className={`${styles.title} ${cormorant.className}`}>{project.title}</h1>
        <p className={`${styles.subtitle} ${cormorant.className}`}>{project.subtitle}</p>
        <p className={`${styles.tagline} ${spaceGrotesk.className}`}>{project.tagline}</p>
        <p className={`${styles.stackLine} ${spaceGrotesk.className}`}>{stackSummary}</p>
      </header>

      <section className={styles.overview}>
        <h2 className={`${styles.sectionLabel} ${spaceGrotesk.className}`}>Why It Exists</h2>
        <p className={`${styles.overviewBody} ${spaceGrotesk.className}`}>
          {project.narrative?.context}
          <br /><br />
          Real-world AI tasks consistently break under naive single-chain logic. Tool usage, persistent state, complex routing, and execution feedback require deterministic structure. Archon solves the problem that orchestration is the fundamental bottleneck to production reliability.
        </p>
      </section>

      <section className={customStyles.architectureBlock}>
        <h3 className={`${customStyles.archTitle} ${spaceGrotesk.className}`}>Core Design Principles</h3>
        <div className={customStyles.archGrid}>
          <div className={customStyles.archNode}>
            <div className={`${customStyles.nodeLabel} ${spaceGrotesk.className}`}>Explicit Routing</div>
            <div className={`${customStyles.nodeDesc} ${spaceGrotesk.className}`}>Determines which sub-agent owns a task execution domain.</div>
          </div>
          <div className={customStyles.archNode}>
            <div className={`${customStyles.nodeLabel} ${spaceGrotesk.className}`}>Modular Agents</div>
            <div className={`${customStyles.nodeDesc} ${spaceGrotesk.className}`}>Small, highly scoped behaviors executing isolated system tasks.</div>
          </div>
          <div className={customStyles.archNode}>
            <div className={`${customStyles.nodeLabel} ${spaceGrotesk.className}`}>Memory Persistence</div>
            <div className={`${customStyles.nodeDesc} ${spaceGrotesk.className}`}>Inter-agent context sharing across multi-step execution chains.</div>
          </div>
          <div className={customStyles.archNode}>
            <div className={`${customStyles.nodeLabel} ${spaceGrotesk.className}`}>Execution Graphs</div>
            <div className={`${customStyles.nodeDesc} ${spaceGrotesk.className}`}>Directed cyclical task flows mapping out reasoning traces.</div>
          </div>
        </div>
      </section>

      <section className={styles.overview}>
        <h2 className={`${styles.sectionLabel} ${spaceGrotesk.className}`}>System Architecture & Relevance</h2>
        <p className={`${styles.overviewBody} ${spaceGrotesk.className}`}>
          {project.overview?.content}
          <br /><br />
          {project.narrative?.impact}
        </p>
      </section>

      <section className={styles.arc}>
        <h2 className={`${styles.sectionLabel} ${spaceGrotesk.className}`}>Example Use Cases</h2>
        <div className={styles.arcGrid}>
          <article className={styles.arcCard}>
            <p className={`${styles.arcLabel} ${spaceGrotesk.className}`}>Autonomous Data Pipes</p>
            <p className={`${styles.arcText} ${spaceGrotesk.className}`}>Agents crawling unstructured sources, validating schemas, and committing to DB.</p>
          </article>
          <article className={styles.arcCard}>
            <p className={`${styles.arcLabel} ${spaceGrotesk.className}`}>Feedback Loop Engine</p>
            <p className={`${styles.arcText} ${spaceGrotesk.className}`}>Self-correction workflows where outputs are evaluated by parallel agents.</p>
          </article>
          <article className={styles.arcCard}>
            <p className={`${styles.arcLabel} ${spaceGrotesk.className}`}>Multi-Tool Negotiation</p>
            <p className={`${styles.arcText} ${spaceGrotesk.className}`}>Complex actions requiring APIs, local scripting, and human-in-the-loop approvals.</p>
          </article>
        </div>
      </section>

      {project.techStack && (
        <section className={styles.stack}>
          <h2 className={`${styles.sectionLabel} ${spaceGrotesk.className}`}>System Components</h2>
          <div className={styles.stackGrid}>
            {project.techStack.map((tech, i) => (
              <div key={i} className={styles.stackItem}>
                <h3 className={`${styles.stackName} ${spaceGrotesk.className}`}>{tech.name}</h3>
                <p className={`${styles.stackDesc} ${spaceGrotesk.className}`}>{tech.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className={styles.philosophical}>
        <blockquote className={`${styles.quote} ${cormorant.className}`}>
          &ldquo;{project.philosophical}&rdquo;
        </blockquote>
      </footer>
    </div>
  );
}
