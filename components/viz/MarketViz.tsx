"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { VizProps } from "./types";
import styles from "./primitives.module.css";

export default function MarketViz({ size = "detail" }: VizProps) {
  const reduce = useReducedMotion();
  const bars = Array.from({ length: 24 });

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 320 140"
        preserveAspectRatio="none"
        role="img"
        aria-label="Market regime field shifting between calm and volatile states"
      >
        {bars.map((_, i) => (
          <motion.rect
            key={i}
            x={6 + i * 13}
            width="6"
            rx="2"
            fill="var(--sand)"
            initial={false}
            animate={reduce ? { height: 30, y: 70 } : { height: [20, 60, 30], y: [80, 40, 70] }}
            transition={reduce ? {} : { repeat: Infinity, duration: 5, delay: i * 0.08, ease: "easeInOut" }}
          />
        ))}
        <motion.line
          x1="0"
          x2="320"
          stroke="var(--signal)"
          strokeWidth="1.5"
          initial={false}
          animate={reduce ? { y1: 70, y2: 70 } : { y1: [80, 40, 70], y2: [80, 40, 70] }}
          transition={reduce ? {} : { repeat: Infinity, duration: 5, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
