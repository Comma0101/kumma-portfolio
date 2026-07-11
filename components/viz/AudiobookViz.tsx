"use client";

import { motion } from "framer-motion";
import type { VizProps } from "./types";
import { useHydratedReducedMotion } from "./useHydratedReducedMotion";
import styles from "./primitives.module.css";

const RAW_LINES = [0, 1, 2, 3, 4];
const CHUNKS = [0, 1, 2];
const WAVE = [8, 15, 10, 22, 7, 18, 12, 25, 9, 16, 11, 20];

export default function AudiobookViz({ size = "detail" }: VizProps) {
  const reduce = useHydratedReducedMotion();

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 540 260"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Document text is normalized into queued chunks and assembled as an audiobook waveform timeline"
      >
        <path d="M104 130H456" className={styles.guide} />

        <g>
          <rect x="22" y="52" width="74" height="120" rx="5" className={styles.ghostPanel} />
          <rect x="30" y="44" width="74" height="120" rx="5" className={styles.panel} />
          <path d="M83 44v21h21" className={styles.guideStrong} />
          {RAW_LINES.map((line) => (
            <line
              key={line}
              x1="44"
              y1={79 + line * 13}
              x2={line === 4 ? "76" : "90"}
              y2={79 + line * 13}
              className={styles.textRule}
            />
          ))}
          <text x="67" y="191" textAnchor="middle" className={styles.label}>document</text>
          <text x="67" y="207" textAnchor="middle" className={styles.stageLabel}>raw marks</text>
        </g>

        <g>
          {CHUNKS.map((chunk) => (
            <rect
              key={chunk}
              x="144"
              y={79 + chunk * 33}
              width="78"
              height="23"
              rx="4"
              className={chunk === 1 ? styles.panelActive : styles.panel}
            />
          ))}
          <text x="183" y="191" textAnchor="middle" className={styles.label}>normalize / chunk</text>
          <text x="183" y="207" textAnchor="middle" className={styles.stageLabel}>ordered segments</text>
        </g>

        <g>
          <rect x="258" y="70" width="88" height="92" rx="8" className={styles.panel} />
          <path d="M278 91h48M278 112h48M278 133h48" className={styles.textRule} />
          <circle cx="271" cy="91" r="3" className={styles.signalFill} />
          <circle cx="271" cy="112" r="3" className={styles.sandFill} />
          <circle cx="271" cy="133" r="3" className={styles.steelFill} />
          <text x="302" y="191" textAnchor="middle" className={styles.label}>queue / TTS</text>
          <text x="302" y="207" textAnchor="middle" className={styles.stageLabel}>stale-job recovery</text>
        </g>

        <g>
          <rect x="388" y="60" width="126" height="112" rx="8" className={styles.panel} />
          <path d="M401 145H501" className={styles.guideStrong} />
          {WAVE.map((height, index) => (
            <line
              key={index}
              x1={405 + index * 8}
              y1={116 - height / 2}
              x2={405 + index * 8}
              y2={116 + height / 2}
              className={index % 3 === 0 ? styles.signalStroke : styles.sandStroke}
            />
          ))}
          <path d="M405 153h26M438 153h37M482 153h19" className={styles.timeline} />
          <text x="451" y="191" textAnchor="middle" className={styles.label}>audiobook / timeline</text>
          <text x="451" y="207" textAnchor="middle" className={styles.stageLabel}>assembled output</text>
        </g>

        {!reduce && (
          <motion.circle
            cx="104"
            cy="130"
            r="3.5"
            className={styles.signalFill}
            initial={false}
            animate={{ x: [0, 40, 118, 154, 242, 284], opacity: [0, 1, 1, 1, 1, 0] }}
            transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", times: [0, 0.1, 0.35, 0.55, 0.78, 1] }}
          />
        )}
      </svg>
    </div>
  );
}
