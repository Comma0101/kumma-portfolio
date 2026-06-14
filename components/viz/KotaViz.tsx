"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { VizProps } from "./types";
import styles from "./primitives.module.css";

export default function KotaViz({ size = "detail" }: VizProps) {
  const reduce = useReducedMotion();

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 320 140"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="KOTA turns a restaurant phone call into a structured order"
      >
        {/* incoming call */}
        <circle cx="22" cy="70" r="6" className={styles.nodeActive}>
          {!reduce && (
            <animate
              attributeName="opacity"
              values="1;0.4;1"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <text x="22" y="92" textAnchor="middle" className={styles.label}>
          call
        </text>

        {/* waveform */}
        <motion.path
          className={styles.wave}
          d="M44 70 q6 -16 12 0 t12 0 t12 0 t12 0"
          initial={false}
          animate={
            reduce
              ? {}
              : {
                  d: [
                    "M44 70 q6 -16 12 0 t12 0 t12 0 t12 0",
                    "M44 70 q6 16 12 0 t12 0 t12 0 t12 0",
                    "M44 70 q6 -16 12 0 t12 0 t12 0 t12 0",
                  ],
                }
          }
          transition={reduce ? {} : { repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <text x="68" y="92" textAnchor="middle" className={styles.label}>
          audio
        </text>

        {/* streaming tokens */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={104 + i * 10}
            cy="70"
            r="2.5"
            fill="var(--sand)"
            initial={false}
            animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 0] }}
            transition={
              reduce
                ? {}
                : { repeat: Infinity, duration: 4, delay: i * 0.25, times: [0, 0.3, 0.6] }
            }
          />
        ))}
        <text x="114" y="92" textAnchor="middle" className={styles.label}>
          tokens
        </text>

        {/* intent node (active) */}
        <motion.circle
          cx="168"
          cy="70"
          r="9"
          className={styles.nodeActive}
          initial={false}
          animate={reduce ? { scale: 1 } : { scale: [1, 1.18, 1] }}
          transition={reduce ? {} : { repeat: Infinity, duration: 4, times: [0.5, 0.62, 0.74] }}
          style={{ transformOrigin: "168px 70px" }}
        />
        <text x="168" y="92" textAnchor="middle" className={styles.label}>
          intent
        </text>

        {/* connector */}
        <path d="M180 70 H214" className={styles.pathActive} />

        {/* order ticket */}
        <motion.g
          initial={false}
          animate={reduce ? { opacity: 1 } : { opacity: [0, 0, 1, 1] }}
          transition={reduce ? {} : { repeat: Infinity, duration: 4, times: [0, 0.7, 0.85, 1] }}
        >
          <rect x="216" y="44" width="92" height="52" rx="6" fill="var(--surface)" stroke="var(--line-strong)" />
          <text x="224" y="60" className={styles.label}>
            order
          </text>
          <text x="224" y="76" className={styles.value}>
            Orange chicken
          </text>
          <text x="300" y="76" textAnchor="end" className={styles.value} fill="var(--signal)">
            x2
          </text>
          <text x="224" y="90" className={styles.value}>
            Chow mein
          </text>
          <text x="300" y="90" textAnchor="end" className={styles.value} fill="var(--signal)">
            x1
          </text>
        </motion.g>
      </svg>
    </div>
  );
}
