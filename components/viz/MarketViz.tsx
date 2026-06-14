"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { VizProps } from "./types";
import styles from "./primitives.module.css";

const PTS = [
  [20, 150],
  [80, 120],
  [140, 162],
  [200, 92],
  [260, 132],
  [320, 70],
  [380, 112],
  [440, 60],
  [490, 96],
];
const DUR = 6;

export default function MarketViz({ size = "detail" }: VizProps) {
  const reduce = useReducedMotion();
  const d = PTS.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  const xs = PTS.map((p) => p[0]);
  const ys = PTS.map((p) => p[1]);

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 500 220"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="A price path crossing calm and volatile regimes against a risk threshold"
      >
        <motion.rect
          x="0"
          y="0"
          width="200"
          height="220"
          fill="var(--sand)"
          initial={false}
          animate={reduce ? { opacity: 0.04 } : { opacity: [0.03, 0.07, 0.03] }}
          transition={reduce ? {} : { repeat: Infinity, duration: DUR, ease: "easeInOut" }}
        />
        <motion.rect
          x="300"
          y="0"
          width="200"
          height="220"
          fill="var(--signal)"
          initial={false}
          animate={reduce ? { opacity: 0.05 } : { opacity: [0.04, 0.1, 0.04] }}
          transition={reduce ? {} : { repeat: Infinity, duration: DUR, delay: 1.5, ease: "easeInOut" }}
        />
        <text x="14" y="24" className={styles.label}>calm</text>
        <text x="486" y="24" textAnchor="end" className={styles.label} fill="var(--signal)">volatile</text>

        <line x1="0" y1="105" x2="500" y2="105" stroke="var(--signal)" strokeWidth="1" strokeDasharray="4 5" opacity="0.6" />
        <text x="14" y="100" className={styles.label} fill="var(--signal)">risk</text>

        <motion.path
          d={d}
          className={styles.wave}
          initial={false}
          animate={reduce ? { pathLength: 1 } : { pathLength: [0, 1] }}
          transition={reduce ? {} : { duration: DUR, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
        />

        {!reduce && (
          <motion.circle
            r="4"
            fill="var(--signal)"
            initial={false}
            animate={{ cx: xs, cy: ys }}
            transition={{ duration: DUR, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
          />
        )}
      </svg>
    </div>
  );
}
