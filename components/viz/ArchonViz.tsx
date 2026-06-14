"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { VizProps } from "./types";
import styles from "./primitives.module.css";

const CX = 260;
const CY = 150;
const R = 110;

const NODES = [
  { label: "tools", a: -90 },
  { label: "memory", a: -34 },
  { label: "context", a: 34 },
  { label: "router", a: 90 },
  { label: "evaluator", a: 146 },
  { label: "recover", a: 214 },
];

const DATA = NODES.map((n, i) => {
  const r = (n.a * Math.PI) / 180;
  const px = CX + R * Math.cos(r);
  const py = CY + R * Math.sin(r);
  const mx = (CX + px) / 2;
  const my = (CY + py) / 2;
  const dx = px - CX;
  const dy = py - CY;
  const len = Math.hypot(dx, dy) || 1;
  const bow = (i % 2 === 0 ? 1 : -1) * 26;
  const ctrlx = mx + (-dy / len) * bow;
  const ctrly = my + (dx / len) * bow;
  const d = `M${CX} ${CY} Q${ctrlx.toFixed(1)} ${ctrly.toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)}`;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const t of [0, 0.16, 0.32, 0.48, 0.64, 0.8, 0.9, 1]) {
    const mt = 1 - t;
    xs.push(+(mt * mt * CX + 2 * mt * t * ctrlx + t * t * px).toFixed(1));
    ys.push(+(mt * mt * CY + 2 * mt * t * ctrly + t * t * py).toFixed(1));
  }
  const lr = R + 17;
  const lx = CX + lr * Math.cos(r);
  const ly = CY + lr * Math.sin(r) + 3;
  const anchor = px < CX - 6 ? "end" : px > CX + 6 ? "start" : "middle";
  return { ...n, px, py, d, xs, ys, lx, ly, anchor };
});

const DUR = 2.6;

export default function ArchonViz({ size = "detail" }: VizProps) {
  const reduce = useReducedMotion();

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 520 320"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Archon: a coordinator routing signals to tools, memory, context, router, evaluator, and recovery"
      >
        {!reduce && (
          <motion.circle
            cx={CX}
            cy={CY}
            r="148"
            fill="none"
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray="2 12"
            initial={false}
            animate={{ rotate: 360 }}
            transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />
        )}

        {DATA.map((n) => (
          <path key={`c-${n.label}`} d={n.d} fill="none" stroke="var(--line-strong)" strokeWidth="1" opacity="0.5" />
        ))}

        {DATA.map((n, i) => (
          <g key={n.label}>
            <motion.circle
              cx={n.px}
              cy={n.py}
              r="8"
              stroke="var(--sand)"
              strokeWidth="1"
              initial={false}
              animate={reduce ? { fill: "var(--surface)" } : { fill: ["var(--surface)", "var(--surface)", "var(--signal)", "var(--surface)"] }}
              transition={reduce ? {} : { duration: DUR, repeat: Infinity, delay: i * 0.42, times: [0, 0.74, 0.88, 1], ease: "easeInOut" }}
            />
            <text x={n.lx} y={n.ly} textAnchor={n.anchor} className={styles.label}>
              {n.label}
            </text>
          </g>
        ))}

        {!reduce &&
          DATA.map((n, i) => (
            <motion.circle
              key={`p-${n.label}`}
              r="3.4"
              fill="var(--signal)"
              initial={false}
              animate={{ cx: n.xs, cy: n.ys, opacity: [0, 1, 1, 0] }}
              transition={{
                duration: DUR,
                repeat: Infinity,
                delay: i * 0.42,
                ease: "easeInOut",
                opacity: { duration: DUR, repeat: Infinity, delay: i * 0.42, ease: "easeInOut", times: [0, 0.1, 0.82, 1] },
              }}
            />
          ))}

        {!reduce &&
          [0, 1].map((k) => (
            <motion.circle
              key={`aura-${k}`}
              cx={CX}
              cy={CY}
              r="24"
              fill="none"
              stroke="var(--signal)"
              strokeWidth="1"
              initial={false}
              animate={{ r: [24, 46], opacity: [0.4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: k * 1.5 }}
            />
          ))}

        <circle cx={CX} cy={CY} r="24" fill="var(--canvas)" stroke="var(--sand)" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r="4" fill="var(--signal)" />
        <text x={CX} y={CY - 36} textAnchor="middle" className={styles.label} fill="var(--paper)">coordinator</text>
        <text x={CX} y={CY + 46} textAnchor="middle" className={styles.label}>route, trace, recover</text>
      </svg>
    </div>
  );
}
