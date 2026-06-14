"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { VizProps } from "./types";
import styles from "./primitives.module.css";

const NODES = [
  { x: 60, y: 30, label: "tools" },
  { x: 260, y: 30, label: "memory" },
  { x: 40, y: 80, label: "context" },
  { x: 280, y: 80, label: "router" },
  { x: 160, y: 122, label: "recover" },
];
const CX = 160;
const CY = 70;

export default function ArchonViz({ size = "detail" }: VizProps) {
  const reduce = useReducedMotion();

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 320 150"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Archon coordinates tools, memory, context, routing, and recovery"
      >
        {NODES.map((n, i) => (
          <g key={n.label}>
            <motion.path
              d={`M${CX} ${CY} L${n.x} ${n.y}`}
              className={styles.path}
              initial={false}
              animate={
                reduce
                  ? {}
                  : { stroke: ["var(--line-strong)", "var(--signal)", "var(--line-strong)"] }
              }
              transition={
                reduce
                  ? {}
                  : {
                      repeat: Infinity,
                      duration: NODES.length * 1.1,
                      times: [
                        i / NODES.length,
                        (i + 0.4) / NODES.length,
                        (i + 0.8) / NODES.length,
                      ],
                    }
              }
            />
            <circle cx={n.x} cy={n.y} r="6" className={styles.node} />
            <text x={n.x} y={n.y - 10} textAnchor="middle" className={styles.label}>
              {n.label}
            </text>
          </g>
        ))}
        <circle cx={CX} cy={CY} r="14" className={styles.node} stroke="var(--sand)" />
        <text x={CX} y={CY + 3} textAnchor="middle" className={styles.label} fill="var(--paper)">
          core
        </text>
      </svg>
    </div>
  );
}
