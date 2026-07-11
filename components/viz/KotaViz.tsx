"use client";
import { motion } from "framer-motion";
import type { VizProps } from "./types";
import { useHydratedReducedMotion } from "./useHydratedReducedMotion";
import styles from "./primitives.module.css";

const D = 5.6;
const BARS = [7, 14, 10, 18, 8, 15, 11, 6];

export default function KotaViz({ size = "detail" }: VizProps) {
  const reduce = useHydratedReducedMotion();

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 500 240"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="KOTA turns a restaurant phone call into a structured order"
      >
        {/* baseline connector */}
        <line x1="44" y1="120" x2="318" y2="120" stroke="var(--line)" strokeWidth="1" />
        {!reduce && (
          <motion.circle
            cx="44"
            r="3"
            fill="var(--signal)"
            cy="120"
            initial={false}
            animate={{ x: [0, 274, 302], opacity: [0, 1, 1, 0] }}
            transition={{ repeat: Infinity, duration: D, times: [0, 0.08, 0.84, 1], ease: "easeInOut" }}
          />
        )}

        {/* call */}
        <circle cx="44" cy="120" r="9" className={styles.nodeActive} />
        <text x="44" y="150" textAnchor="middle" className={styles.label}>call</text>

        {/* audio bars */}
        {BARS.map((height, i) => (
          <rect
            key={`${height}-${i}`}
            x={92 + i * 7}
            y={120 - height / 2}
            width="3"
            height={height}
            rx="1.5"
            fill="var(--sand)"
          />
        ))}
        <text x="116" y="150" textAnchor="middle" className={styles.label}>audio</text>

        {/* tokens */}
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={i}
            cx={178 + i * 11}
            cy="120"
            r="2.4"
            fill="var(--steel)"
          />
        ))}
        <text x="200" y="150" textAnchor="middle" className={styles.label}>tokens</text>

        {/* intent */}
        <circle
          cx="290"
          cy="120"
          r="11"
          className={styles.nodeActive}
        />
        <text x="290" y="150" textAnchor="middle" className={styles.label}>intent · menu</text>

        <line x1="301" y1="120" x2="345" y2="120" stroke="var(--line-strong)" strokeWidth="1" />

        {/* order ticket */}
        <motion.g
          initial={false}
          animate={reduce ? { opacity: 1 } : { opacity: [0.45, 0.45, 1, 1] }}
          transition={reduce ? {} : { repeat: Infinity, duration: D, times: [0, 0.66, 0.82, 1] }}
        >
          <rect x="346" y="56" width="150" height="128" rx="8" fill="var(--surface)" stroke="var(--line-strong)" />
          <text x="362" y="78" className={styles.label}>order ticket</text>
          <line x1="346" y1="90" x2="496" y2="90" stroke="var(--line)" />
          <text x="362" y="111" className={styles.value} fontSize="12.5">Orange chicken</text>
          <text x="480" y="111" textAnchor="end" className={styles.value} fontSize="12.5" fill="var(--signal)">x2</text>
          <text x="362" y="133" className={styles.value} fontSize="12.5">Chow mein</text>
          <text x="480" y="133" textAnchor="end" className={styles.value} fontSize="12.5" fill="var(--signal)">x1</text>
          <line x1="346" y1="148" x2="496" y2="148" stroke="var(--line)" />
          <text x="362" y="170" className={styles.label}>confidence</text>
          <text x="480" y="170" textAnchor="end" className={styles.label} fill="var(--sand)">high</text>
        </motion.g>
      </svg>
    </div>
  );
}
