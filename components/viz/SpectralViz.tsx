"use client";

import { motion } from "framer-motion";
import type { VizProps } from "./types";
import { useHydratedReducedMotion } from "./useHydratedReducedMotion";
import { visualRegistry } from "./visualRegistry";
import styles from "./primitives.module.css";

const FFT_BANDS = [24, 48, 34, 72, 55, 31, 62, 42];
const PILLARS = [20, 36, 58, 31, 68, 44, 27];
const WAVEFORM = "M31 130C43 130 44 93 57 93S72 166 86 166S101 108 114 108S126 143 140 143S151 116 162 116";
const TERRAIN = "M342 171L365 148L386 157L408 113L430 137L451 91L473 125L497 103L523 141";

export default function SpectralViz({ size = "detail" }: VizProps) {
  const reduce = useHydratedReducedMotion();

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 550 270"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Local audio stays private while FFT analysis transforms its waveform into adaptive terrain pillars"
      >
        <path d="M175 130H211M309 130H342" className={styles.guide} />

        <g>
          <rect x="20" y="55" width="155" height="145" rx="8" className={styles.panel} />
          <path d="M31 130H163" className={styles.guide} />
          <path d={WAVEFORM} className={styles.wave} />
          <rect x="31" y="70" width="70" height="19" rx="9.5" className={styles.badge} />
          <text x="66" y="83" textAnchor="middle" className={styles.badgeText}>local only</text>
          <text x="98" y="223" textAnchor="middle" className={styles.label}>local audio / privacy</text>
          <text x="98" y="241" textAnchor="middle" className={styles.stageLabel}>browser boundary</text>
        </g>

        <g>
          <rect x="211" y="55" width="98" height="145" rx="8" className={styles.ghostPanel} />
          <path d="M222 178H298" className={styles.guideStrong} />
          {FFT_BANDS.map((height, index) => (
            <rect
              key={index}
              x={224 + index * 9}
              y={178 - height}
              width="5"
              height={height}
              rx="2.5"
              className={index === 3 || index === 6 ? styles.signalFill : styles.sandFill}
            />
          ))}
          <text x="260" y="223" textAnchor="middle" className={styles.label}>FFT / onset analysis</text>
          <text x="260" y="241" textAnchor="middle" className={styles.stageLabel}>signal profile</text>
        </g>

        <motion.g
          initial={false}
          animate={reduce ? { y: 0, opacity: 1 } : { y: [0, -3, 0], opacity: [0.84, 1, 0.84] }}
          transition={reduce ? {} : { duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d={TERRAIN} className={styles.terrain} />
          {PILLARS.map((height, index) => (
            <rect
              key={index}
              x={354 + index * 24}
              y={190 - height}
              width="9"
              height={height}
              rx="2"
              className={index === 4 ? styles.panelActive : styles.panel}
            />
          ))}
          <circle cx="386" cy="157" r="2.5" className={styles.sandFill} />
          <circle cx="451" cy="91" r="3" className={styles.signalFill} />
          <circle cx="497" cy="103" r="2.5" className={styles.sandFill} />
        </motion.g>
        <text x="432" y="223" textAnchor="middle" className={styles.label}>terrain / pillars</text>
        <text x="432" y="241" textAnchor="middle" className={styles.stageLabel}>adaptive quality · device limit</text>

        {!reduce && (
          <motion.path
            d={WAVEFORM}
            className={styles.signalPath}
            initial={false}
            animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut", times: [0, 0.72, 1] }}
          />
        )}
      </svg>
      <p className={styles.mobileCaption} aria-hidden="true">
        {visualRegistry["spectral-world"].reducedMotionLabel}
      </p>
    </div>
  );
}
