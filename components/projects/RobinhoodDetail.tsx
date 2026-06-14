"use client";
import React from "react";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import styles from "@/styles/projectDetail.module.css";
import customStyles from "@/styles/customProject.module.css";
import type { Project } from "@/data/projectData";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function RobinhoodDetail({ project }: { project: Project }) {
  const stackSummary = project.techStack?.map((t) => t.name).join(" · ") || "";
  
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <p className={`${styles.eyebrow} ${spaceGrotesk.className}`}>Case Study / 03</p>
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
          Trading performance is noisy. Raw PnL is insufficient because it conflates good decisions with lucky outcomes.
          Traders need structured feedback loops: behavior, setup quality, and risk discipline must be explicitly measurable objects within a feedback system.
        </p>
      </section>

      <section className={styles.overview}>
        <h2 className={`${styles.sectionLabel} ${spaceGrotesk.className}`}>System Design & Logic</h2>
        <p className={`${styles.overviewBody} ${spaceGrotesk.className}`}>
          {project.overview?.content}
          <br /><br />
          {project.narrative?.decision}
        </p>
      </section>
      
      <section className={customStyles.dashboardLayout}>
        <div className={customStyles.dashMetric}>
          <span className={`${customStyles.metricLabel} ${spaceGrotesk.className}`}>Decision Quality Score</span>
          <span className={`${customStyles.metricValue} ${spaceGrotesk.className}`}>84.2%</span>
        </div>
        <div className={customStyles.dashMetric}>
          <span className={`${customStyles.metricLabel} ${spaceGrotesk.className}`}>Process Execution</span>
          <span className={`${customStyles.metricValue} ${spaceGrotesk.className}`}>+0.42 EV</span>
        </div>
        <div className={customStyles.dashMetric}>
          <span className={`${customStyles.metricLabel} ${spaceGrotesk.className}`}>Behavioral Slippage</span>
          <span className={`${customStyles.metricValue} ${spaceGrotesk.className}`}>-1.2%</span>
        </div>
        
        <div className={customStyles.dashPanel}>
          <div className={`${customStyles.panelLabel} ${spaceGrotesk.className}`}>Rolling A+ Setup Confidence</div>
          <div className={customStyles.panelChart}></div>
          <div className={`${customStyles.panelSub} ${spaceGrotesk.className}`}>
            Win/Loss correlation by conviction category (Last 30 Days)
          </div>
        </div>
      </section>

      <section className={styles.arc}>
        <h2 className={`${styles.sectionLabel} ${spaceGrotesk.className}`}>Core Thesis</h2>
        <p className={`${styles.arcImpact} ${spaceGrotesk.className}`}>
          {project.narrative?.outcome} <br /><br />
          {project.narrative?.impact}
        </p>
      </section>

      {project.techStack && (
        <section className={styles.stack}>
          <h2 className={`${styles.sectionLabel} ${spaceGrotesk.className}`}>Measurement Stack</h2>
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
