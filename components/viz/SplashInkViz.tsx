"use client";

import { motion } from "framer-motion";
import type { VizProps } from "./types";
import { useHydratedReducedMotion } from "./useHydratedReducedMotion";
import styles from "./primitives.module.css";

const DEPTH_POINTS = [
  [210, 93, 2],
  [232, 75, 3],
  [253, 105, 2.5],
  [274, 68, 2],
  [289, 116, 3.5],
  [220, 139, 2.5],
  [250, 151, 3],
  [282, 148, 2],
] as const;

const SPLATS = [
  [366, 154, 11, 5],
  [389, 125, 17, 7],
  [421, 143, 21, 8],
  [442, 103, 14, 6],
  [470, 131, 25, 9],
  [493, 89, 16, 6],
  [503, 154, 13, 5],
  [403, 84, 10, 4],
] as const;

export default function SplashInkViz({ size = "detail" }: VizProps) {
  const reduce = useHydratedReducedMotion();

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 560 280"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Flat ink image is sampled into depth points and lifted into Gaussian splat layers"
      >
        <path d="M150 135H202M302 135H347" className={styles.guide} />

        <g>
          <rect x="22" y="45" width="128" height="170" rx="7" className={styles.panel} />
          <path
            d="M34 183C50 159 48 118 67 103C85 90 94 65 107 58C104 90 125 111 136 145C120 133 107 132 97 145C87 158 68 159 59 194"
            className={styles.inkContour}
          />
          <path d="M42 184C64 176 82 184 99 168C111 157 128 170 139 161" className={styles.inkWash} />
          <circle cx="58" cy="91" r="9" className={styles.inkMark} />
          <circle cx="118" cy="185" r="6" className={styles.inkMarkQuiet} />
          <text x="86" y="238" textAnchor="middle" className={styles.label}>ink / image plane</text>
          <text x="86" y="255" textAnchor="middle" className={styles.stageLabel}>flat source</text>
        </g>

        <g>
          <rect x="202" y="45" width="100" height="170" rx="7" className={styles.ghostPanel} />
          <path d="M212 185L292 185M220 55v140M250 55v140M280 55v140" className={styles.depthGrid} />
          {DEPTH_POINTS.map(([cx, cy, radius], index) => (
            <g key={`${cx}-${cy}`}>
              <line x1={cx} y1={cy} x2={cx} y2="185" className={styles.depthLine} />
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                className={index % 3 === 0 ? styles.signalFill : styles.sandFill}
              />
            </g>
          ))}
          <text x="252" y="238" textAnchor="middle" className={styles.label}>depth / point init</text>
          <text x="252" y="255" textAnchor="middle" className={styles.stageLabel}>sampled field</text>
        </g>

        <g>
          <path d="M349 190L512 62M349 190H529" className={styles.depthAxis} />
          <path d="M372 175L505 76M391 190L528 88" className={styles.depthGrid} />
          {SPLATS.map(([cx, cy, rx, ry], index) => (
            <ellipse
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              className={index % 3 === 1 ? styles.splatActive : styles.splat}
              transform={`rotate(-18 ${cx} ${cy})`}
            />
          ))}
          <circle cx="376" cy="171" r="2.5" className={styles.signalFill} />
          <circle cx="436" cy="116" r="3" className={styles.sandFill} />
          <circle cx="497" cy="82" r="2.5" className={styles.signalFill} />
          <text x="438" y="238" textAnchor="middle" className={styles.label}>lifted splat layers</text>
          <text x="438" y="255" textAnchor="middle" className={styles.stageLabel}>research prototype</text>
        </g>

        {!reduce && (
          <motion.g
            initial={false}
            animate={{ x: [0, 74, 148], y: [0, -12, -30], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.78, 1] }}
          >
            <circle cx="259" cy="127" r="3" className={styles.signalFill} />
            <circle cx="269" cy="139" r="2" className={styles.sandFill} />
            <circle cx="249" cy="145" r="2.5" className={styles.steelFill} />
          </motion.g>
        )}
      </svg>
    </div>
  );
}
