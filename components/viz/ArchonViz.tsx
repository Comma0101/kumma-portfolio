"use client";
import { motion } from "framer-motion";
import type { VizProps } from "./types";
import { useHydratedReducedMotion } from "./useHydratedReducedMotion";
import styles from "./primitives.module.css";

const CX = 260;
const CY = 150;
const R = 110;

const NODES = [
  { label: "workers", a: -90 },
  { label: "tools", a: -34 },
  { label: "memory", a: 34 },
  { label: "models", a: 90 },
  { label: "channels", a: 146 },
  { label: "safety", a: 214 },
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

const ROUTE_POINTS = [DATA[0], DATA[2], DATA[5]].flatMap((node, index) => {
  const outbound = node.xs.map((x, pointIndex) => ({
    x: x - CX,
    y: node.ys[pointIndex] - CY,
  }));
  const roundTrip = [...outbound, ...[...outbound].reverse().slice(1)];

  return index === 0 ? roundTrip : roundTrip.slice(1);
});
const ROUTE_X = ROUTE_POINTS.map((point) => point.x);
const ROUTE_Y = ROUTE_POINTS.map((point) => point.y);
const DUR = 6.6;

export default function ArchonViz({ size = "detail" }: VizProps) {
  const reduce = useHydratedReducedMotion();

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg
        className={styles.svg}
        viewBox="0 0 520 320"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Archon: a coordinator routing signals to tools, memory, context, router, evaluator, and recovery"
      >
        {DATA.map((n) => (
          <path key={`c-${n.label}`} d={n.d} fill="none" stroke="var(--line-strong)" strokeWidth="1" opacity="0.5" />
        ))}

        {DATA.map((n) => (
          <g key={n.label}>
            <circle
              cx={n.px}
              cy={n.py}
              r="8"
              fill="var(--surface)"
              stroke="var(--sand)"
              strokeWidth="1"
            />
            <text x={n.lx} y={n.ly} textAnchor={n.anchor} className={styles.label}>
              {n.label}
            </text>
          </g>
        ))}

        {!reduce && (
          <>
            <motion.circle
              cx={CX}
              cy={CY}
              r="3.4"
              fill="var(--signal)"
              initial={false}
              animate={{ x: ROUTE_X, y: ROUTE_Y, opacity: [0, 1, 1, 0] }}
              transition={{ duration: DUR, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
              cx={CX}
              cy={CY}
              r="24"
              fill="none"
              stroke="var(--signal)"
              strokeWidth="1"
              initial={false}
              animate={{ scale: [1, 1.8, 1], opacity: [0.35, 0, 0] }}
              transition={{ duration: DUR, repeat: Infinity, ease: "easeOut", times: [0, 0.36, 1] }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            />
          </>
        )}

        <circle cx={CX} cy={CY} r="24" fill="var(--canvas)" stroke="var(--sand)" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r="4" fill="var(--signal)" />
        <text x={CX} y={CY - 36} textAnchor="middle" className={styles.label} fill="var(--paper)">coordinator</text>
        <text x={CX} y={CY + 46} textAnchor="middle" className={styles.label}>route, trace, recover</text>
      </svg>
    </div>
  );
}
