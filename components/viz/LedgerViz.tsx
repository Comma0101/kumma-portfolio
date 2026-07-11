"use client";

import { motion } from "framer-motion";
import type { VizProps } from "./types";
import { useHydratedReducedMotion } from "./useHydratedReducedMotion";
import { visualRegistry } from "./visualRegistry";
import styles from "./primitives.module.css";

const RAW_ROWS = ["fill, buy", "option, sell", "equity, buy", "fill, sell"];

export default function LedgerViz({ size = "detail" }: VizProps) {
  const reduce = useHydratedReducedMotion();

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 560 280"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Raw CSV fills are normalized and paired by FIFO or contract into an inspectable ledger"
      >
        <path d="M169 133H217M337 133H382" className={styles.guide} />

        <g>
          <rect x="20" y="52" width="149" height="164" rx="8" className={styles.panel} />
          <path d="M20 82H169M58 82V216M121 82V216" className={styles.guide} />
          <text x="31" y="72" className={styles.stageLabel}>raw CSV rows / fills</text>
          {RAW_ROWS.map((row, index) => {
            const [kind, side] = row.split(", ");
            const y = 104 + index * 27;
            return (
              <g key={row + index}>
                <text x="31" y={y} className={styles.value}>{kind}</text>
                <text x="69" y={y} className={styles.value}>{side}</text>
                <text x="153" y={y} textAnchor="end" className={styles.label}>row {index + 1}</text>
                {index < RAW_ROWS.length - 1 && <line x1="20" y1={y + 10} x2="169" y2={y + 10} className={styles.guide} />}
              </g>
            );
          })}
          <text x="94" y="241" textAnchor="middle" className={styles.label}>messy input</text>
        </g>

        <g>
          <rect x="217" y="75" width="120" height="116" rx="10" className={styles.ghostPanel} />
          <path d="M241 100H313L300 133L313 166H241L254 133Z" className={styles.gate} />
          <text x="277" y="121" textAnchor="middle" className={styles.label}>normalize</text>
          <text x="277" y="143" textAnchor="middle" className={styles.strongText}>pair gate</text>
          <text x="277" y="162" textAnchor="middle" className={styles.stageLabel}>FIFO / contract</text>
          <text x="277" y="221" textAnchor="middle" className={styles.label}>closed-quantity check</text>
          <text x="277" y="239" textAnchor="middle" className={styles.stageLabel}>correctness guardrail</text>
        </g>

        <g>
          <rect x="382" y="52" width="158" height="164" rx="8" className={styles.panel} />
          <path d="M382 82H540M414 82V216" className={styles.guide} />
          <text x="393" y="72" className={styles.stageLabel}>inspectable ledger</text>

          <circle cx="398" cy="108" r="5" className={styles.signalFill} />
          <text x="425" y="105" className={styles.strongText}>MATCHED</text>
          <text x="425" y="121" className={styles.stageLabel}>closed pair · rows 1 + 4</text>
          <line x1="382" y1="137" x2="540" y2="137" className={styles.guide} />

          <rect x="393" y="159" width="10" height="10" rx="1" className={styles.openMarker} />
          <text x="425" y="164" className={styles.strongText}>REMAINING</text>
          <text x="425" y="180" className={styles.stageLabel}>open quantity · row 3</text>
          <path d="M425 193H522" className={styles.dashedRule} />
          <text x="461" y="241" textAnchor="middle" className={styles.label}>balanced / inspectable</text>
        </g>

        {!reduce && (
          <g>
            <motion.circle
              cx="154"
              cy="104"
              r="4"
              className={styles.signalFill}
              initial={false}
              animate={{ x: [0, 123, 254], y: [0, 29, 29], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.16, 0.8, 1] }}
            />
            <motion.circle
              cx="154"
              cy="185"
              r="4"
              className={styles.sandFill}
              initial={false}
              animate={{ x: [0, 123, 254], y: [0, -52, -52], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.16, 0.8, 1] }}
            />
          </g>
        )}
      </svg>
      <p className={styles.mobileCaption} aria-hidden="true">
        {visualRegistry["ledger"].reducedMotionLabel}
      </p>
    </div>
  );
}
