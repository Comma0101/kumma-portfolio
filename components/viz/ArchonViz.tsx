"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { VizProps } from "./types";
import styles from "./primitives.module.css";

const CX = 250;
const CY = 140;
const R = 96;
const NODES = [
  { label: "tools", a: -90 },
  { label: "memory", a: -30 },
  { label: "context", a: 30 },
  { label: "router", a: 90 },
  { label: "evaluator", a: 150 },
  { label: "recover", a: 210 },
];
const D = 6;
const step = D / NODES.length;

function pos(a: number) {
  const r = (a * Math.PI) / 180;
  return { x: CX + R * Math.cos(r), y: CY + R * Math.sin(r) };
}

export default function ArchonViz({ size = "detail" }: VizProps) {
  const reduce = useReducedMotion();

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 500 280"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Archon routes signals between a coordinator and its tools, memory, context, router, evaluator, and recovery"
      >
        {NODES.map((n) => {
          const p = pos(n.a);
          return (
            <line key={`l-${n.label}`} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="var(--line)" strokeWidth="1" />
          );
        })}

        {NODES.map((n, i) => {
          const p = pos(n.a);
          return (
            <g key={n.label}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r="7"
                stroke="var(--sand)"
                strokeWidth="1"
                initial={false}
                animate={reduce ? { fill: "var(--surface)" } : { fill: ["var(--surface)", "var(--signal)", "var(--surface)"] }}
                transition={reduce ? {} : { duration: step, times: [0, 0.5, 1], repeat: Infinity, repeatDelay: D - step, delay: i * step }}
              />
              <text x={p.x} y={p.y + (p.y < CY ? -12 : 18)} textAnchor="middle" className={styles.label}>
                {n.label}
              </text>
            </g>
          );
        })}

        {!reduce &&
          NODES.map((n, i) => {
            const p = pos(n.a);
            return (
              <motion.circle
                key={`d-${n.label}`}
                r="3.5"
                fill="var(--signal)"
                initial={false}
                animate={{ cx: [CX, p.x, CX], cy: [CY, p.y, CY], opacity: [0, 1, 0] }}
                transition={{ duration: step, times: [0, 0.5, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: D - step, delay: i * step }}
              />
            );
          })}

        <circle cx={CX} cy={CY} r="22" fill="var(--canvas)" stroke="var(--sand)" strokeWidth="1.5" />
        {!reduce && (
          <motion.circle
            cx={CX}
            cy={CY}
            r="22"
            fill="none"
            stroke="var(--signal)"
            strokeWidth="1"
            initial={false}
            animate={{ r: [22, 36], opacity: [0.5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <text x={CX} y={CY - 1} textAnchor="middle" className={styles.label} fill="var(--paper)">coordinator</text>
        <text x={CX} y={CY + 13} textAnchor="middle" className={styles.label}>route · trace · recover</text>
      </svg>
    </div>
  );
}
