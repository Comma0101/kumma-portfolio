"use client";

import { useEffect, useId, useRef, useState } from "react";
import { inkStroke, type Emphasis, type Ink as InkShape } from "./ink";
import type { Profile } from "./brush";
import { chunksOf, type Chunk } from "./thread";
import type { Point } from "./pen";
import styles from "./Front.module.css";

export type Size = { width: number; height: number };

// A trace is the path the pen takes, in this mark's own pixels. It may
// read anchors from the host (the mark's parent) and may name a split
// (the index where the first gesture ends), chunk ends (point indices
// where each section's share of a long line stops), and a brush size in
// pixels when the mark's size follows its own geometry.
export type Trace = (
  size: Size,
  host: HTMLElement,
) => { points: Point[]; split?: number; ends?: number[]; size?: number };

type Props = {
  trace: Trace;
  mark: string;
  size?: number;
  seed?: number;
  flat?: boolean;
  still?: boolean;
  startPool?: boolean;
  endPool?: boolean;
  smoothing?: number;
  spacing?: number;
  press?: boolean;
  lift?: number;
  // A brush (see brush.ts): its pressure profile, how much pressure
  // widens it, where it runs dry, and stretches drawn slower.
  profile?: Profile;
  thinning?: number;
  dry?: number;
  emphasis?: Emphasis[];
  // Size as a fraction of the mark's smaller side, instead of pixels.
  scale?: number;
  className?: string;
};

function lengthTo(points: Point[], index: number) {
  let total = 0;
  for (let i = 1; i <= index && i < points.length; i += 1) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return total;
}

// One ballpoint mark. The variable-width ink is revealed through a mask
// whose centreline is drawn on (pathLength 1: offset 1 undrawn, 0 drawn,
// -1 lifted), so the stroke keeps its pressure while it draws.
export default function Ink({
  trace,
  mark,
  size = 2.6,
  seed = 1,
  flat,
  still,
  startPool,
  endPool,
  smoothing,
  spacing,
  press,
  lift,
  profile,
  thinning,
  dry,
  emphasis,
  scale,
  className,
}: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const mask = `ink-${useId().replace(/:/g, "")}`;
  const [shape, setShape] = useState<
    (InkShape & Size & { split: number; chunks?: Chunk[]; size: number }) | null
  >(null);

  useEffect(() => {
    const svg = ref.current;
    const host = svg?.parentElement;
    if (!svg || !host) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const { width, height } = svg.getBoundingClientRect();
      if (!width || !height) return;
      const { points, split, ends, size: traced } = trace({ width, height }, host);
      if (points.length < 2) return;
      const total = lengthTo(points, points.length - 1) || 1;
      const px = traced ?? (scale ? scale * Math.min(width, height) : size);
      setShape({
        ...inkStroke(points, {
          size: px,
          seed,
          flat,
          startPool,
          endPool,
          smoothing,
          spacing,
          press,
          lift,
          profile,
          thinning,
          dry,
          emphasis,
        }),
        size: px,
        width,
        height,
        split: split === undefined ? 1 : lengthTo(points, split) / total,
        chunks: ends ? chunksOf(points, ends) : undefined,
      });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(svg);
    observer.observe(host);
    document.fonts?.ready.then(schedule).catch(() => undefined);
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
    // Traces are authored once per mark.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg
      ref={ref}
      className={className ? `${styles.ink} ${className}` : styles.ink}
      viewBox={shape ? `0 0 ${shape.width} ${shape.height}` : "0 0 1 1"}
      aria-hidden="true"
      focusable="false"
      data-mark={mark}
      data-split={shape?.split ?? 1}
      data-pace={shape?.pace.join(",")}
      data-chunks={shape?.chunks ? JSON.stringify(shape.chunks) : undefined}
      data-still={still ? "" : undefined}
      style={shape ? undefined : { visibility: "hidden" }}
    >
      <defs>
        {/* The default mask region is the svg ±10%; marks run past their box. */}
        <mask id={mask} maskUnits="userSpaceOnUse" x="-100%" y="-100%" width="300%" height="300%">
          <path
            d={shape?.center ?? ""}
            pathLength={1}
            data-reveal
            fill="none"
            stroke="#fff"
            strokeWidth={(shape?.size ?? size) * 3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {shape?.dry.map((streak, index) => (
            <path
              key={index}
              d={streak.d}
              fill="none"
              stroke="#000"
              strokeWidth={streak.width}
              strokeLinecap="round"
            />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${mask})`}>
        <path d={shape?.outline ?? ""} />
        {shape?.pools.map((pool, index) => (
          <circle
            key={index}
            cx={pool.x}
            cy={pool.y}
            r={pool.r}
            className={pool.press ? styles.press : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
