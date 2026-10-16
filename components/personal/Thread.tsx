"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import type { Trace } from "./Ink";
import { centerline, inkStroke, type Pool } from "./ink";
import { anchor, threadX } from "./anchors";
import { fitPoints, handLine, loop, steps, type Box, type Point } from "./pen";
import { arcAtTip, chunksOf, slice, within, type Chunk } from "./thread";
import { ease } from "./useBeat";
import styles from "./Front.module.css";

// A teacher's tick, the shape the line makes at each practice.
const tickShape: Point[] = [[0, 52], [30, 92], [100, 0]];

function section(front: HTMLElement, name: string): Box | null {
  const el = front.querySelector<HTMLElement>(`[data-thread="${name}"]`);
  if (!el) return null;
  const outer = front.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  return { x: rect.left - outer.left, y: rect.top - outer.top, width: rect.width, height: rect.height };
}

// The one red line, from the name's underline to the open circle beside
// the sutra. Every mark on the way is a detour of the same pen; each
// section's share of the line is one chunk.
const spine: Trace = ({ width }, host) => {
  // The host covers the page exactly; the anchors live in the page itself.
  const front = host.parentElement ?? host;
  const name = anchor(front, "name");
  const opening = section(front, "opening");
  const catchUp = section(front, "catch");
  const stairs = section(front, "steps");
  const heading = anchor(front, "steps");
  const practice = section(front, "practice");
  const rules = section(front, "rules");
  const clause = anchor(front, "not-form");
  const seen = anchor(front, "seen");
  if (!name || !opening || !catchUp || !stairs || !heading || !practice || !rules || !clause || !seen) {
    return { points: [] };
  }
  const x = threadX(front);
  const gutter = Math.max(16, window.innerWidth * 0.04);
  const bottom = (box: Box) => box.y + box.height;
  const points: Point[] = [];
  const ends: number[] = [];
  let seed = 100;
  const to = (target: Point, wobble = 0.6) => {
    seed += 1;
    points.push(...handLine(points[points.length - 1], target, seed, wobble).slice(1));
  };
  const end = () => ends.push(points.length - 1);

  // Opening: the taut underline, then down the right edge, under
  // everything, and back to the margin.
  const y = name.y + name.height * 0.98;
  points.push([name.x - 4, y]);
  to([name.x + name.width + 6, y - 5], 0.6);
  const split = points.length - 1;
  const edge = width - Math.max(14, width * 0.018);
  to([edge, y + 60], 1);
  to([edge - 8, bottom(opening) - 62], 1);
  to([width * 0.55, bottom(opening) - 22], 1);
  to([x + 30, bottom(opening) - 16], 1);
  to([x, bottom(opening) + 2], 0.5);
  end();

  // Understanding arrives first: the margin, nothing more.
  to([x, bottom(catchUp)], 0.5);
  end();

  // Three steps forward, two back — then down the far edge and home.
  const top = heading.y + heading.height + 28;
  to([x, top], 0.5);
  const walk = fitPoints(steps({ seed: 6, cycles: 4 }), {
    x,
    y: top,
    width: width - x - gutter - 12,
    height: 210,
  });
  to(walk[0], 0.3);
  points.push(...walk.slice(1));
  const right = walk[walk.length - 1][0];
  to([right + 4, bottom(stairs) - 60], 1);
  to([x + 30, bottom(stairs) - 14], 1);
  to([x, bottom(stairs) + 2], 0.5);
  end();

  // Practice: out from the margin to tick each numeral, and back.
  for (let i = 0; i < 4; i += 1) {
    const numeral = anchor(front, `tick-${i}`);
    if (!numeral) continue;
    const box: Box = {
      x: numeral.x + numeral.height * 0.1,
      y: numeral.y - numeral.height * 1.55,
      width: numeral.height * 1.9,
      height: numeral.height * 1.5,
    };
    const tick = fitPoints(tickShape, box);
    to([x, box.y + box.height * 0.52 - 8], 0.4);
    to(tick[0], 0.3);
    points.push(...tick.slice(1));
    to([x, box.y + box.height + 16], 0.4);
  }
  to([x, bottom(practice)], 0.5);
  end();

  // The rules: the pen holds the margin. Price is not the pen.
  to([x, bottom(rules)], 0.5);
  end();

  // The reason: out to an open circle beside 若見諸相非相, its opening
  // toward the text. The pen lifts here.
  const radius = Math.max(seen.width * 1.05, 46);
  const gap = seen.width * 0.45;
  const room = seen.x - gap - radius * 2 > x + 24;
  const cx = room ? seen.x - gap - radius : seen.x + seen.width / 2;
  const cy = room ? clause.y + clause.height * 0.42 : seen.y + seen.height + gap + radius;
  const ring = fitPoints(loop({ seed: 33, overshoot: -0.16, facing: room ? 0 : -Math.PI / 2 }), {
    x: cx - radius,
    y: cy - radius * 1.08,
    width: radius * 2,
    height: radius * 2.16,
  });
  // Come in beneath the circle and round to where it starts, so the
  // approach never crosses the ring.
  const below = cy + radius * 1.4;
  to([x, Math.max(points[points.length - 1][1] + 1, below)], 0.5);
  // Out past the circle's open side, then in to where the ring begins.
  to([cx + radius * 1.25, below - 4], 1);
  to(ring[0], 0.6);
  points.push(...ring.slice(1));
  end();

  return { points, split, ends };
};

type Piece = { d: string; box: Box; chunk: Chunk };
// pace: the hand's timing over the whole line (see ink.ts pace()).
type Shape = { outline: string; pools: Pool[]; pieces: Piece[]; split: number; pace: number[] };

const SIZE = 3;

function bounds(points: Point[], pad: number): Box {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of points) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return { x: x0 - pad, y: y0 - pad, width: x1 - x0 + pad * 2, height: y1 - y0 + pad * 2 };
}

// The reader is the hand: how much of the line is drawn follows where the
// reader is on the page (a point 72% down the screen). Ink once written
// stays written; scrolling back does not unwrite it. The opening draws
// itself on arrival.
//
// One outline is built for the whole page and shared; it is shown through
// one small window per section, each with its own reveal mask, so a frame
// repaints only the piece being drawn, never the whole page.
export default function Thread() {
  const ref = useRef<HTMLDivElement>(null);
  const id = `spine-${useId().replace(/:/g, "")}`;
  const [shape, setShape] = useState<Shape | null>(null);
  const shapeRef = useRef<Shape | null>(null);
  shapeRef.current = shape;

  useEffect(() => {
    const host = ref.current;
    const front = host?.parentElement;
    if (!host || !front) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      const { points, split, ends } = spine({ width, height }, host);
      if (points.length < 2 || !ends) return;
      const ink = inkStroke(points, { size: SIZE, seed: 3, endPool: true, smoothing: 2, spacing: 6 });
      const chunks = chunksOf(points, ends);
      const splitArc = split === undefined ? 0 : chunksOf(points, [split, points.length - 1])[0].to;
      setShape({
        outline: ink.outline,
        pools: ink.pools,
        split: splitArc,
        pace: ink.pace,
        pieces: chunks.map((chunk) => {
          const part = slice(ink.line, chunk.from, chunk.to);
          return { d: centerline(part), box: bounds(part, SIZE * 6), chunk };
        }),
      });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(front);
    document.fonts?.ready.then(schedule).catch(() => undefined);
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const host = ref.current;
    const front = host?.parentElement;
    if (!host || !front || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const state = { opening: 0, drawn: 0 };
    const shown: number[] = [];
    const apply = () => {
      const current = shapeRef.current;
      if (!current) return;
      const arc = Math.max(state.opening, state.drawn);
      const paths = host.querySelectorAll<SVGPathElement>("[data-reveal]");
      current.pieces.forEach((piece, i) => {
        const p = Number(within(piece.chunk, arc).toFixed(4));
        if (shown[i] === p || !paths[i]) return;
        shown[i] = p;
        paths[i].style.strokeDashoffset = String(1 - p);
      });
    };

    // The opening: the tangle (in Opening) lifts, the underline snaps taut,
    // then the line walks down the right edge and back to the margin.
    const tl = gsap.timeline({ delay: 1.55, onUpdate: apply });
    tl.to(state, { opening: () => shapeRef.current?.split ?? 0, duration: 0.45, ease: ease.impulse });
    tl.to(
      state,
      { opening: () => shapeRef.current?.pieces[0]?.chunk.to ?? 0, duration: 1.8, ease: ease.hand },
      ">0.35",
    );

    const tick = () => {
      const current = shapeRef.current;
      if (!current) return;
      const tip = window.innerHeight * 0.72 - front.getBoundingClientRect().top;
      const target = arcAtTip(
        current.pieces.map((piece) => piece.chunk),
        current.pace,
        tip,
      );
      if (target > state.drawn + 1e-4) {
        state.drawn = Math.min(target, state.drawn + Math.max(0.0005, (target - state.drawn) * 0.12));
        apply();
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      tl.kill();
    };
  }, []);

  return (
    <div ref={ref} className={styles.spineHost} aria-hidden="true">
      <svg className={styles.spineDefs} focusable="false">
        <defs>
          <g id={`${id}-ink`} fill="currentColor" fillOpacity={0.93}>
            <path d={shape?.outline ?? ""} />
            {shape?.pools.map((pool, index) => (
              <circle key={index} cx={pool.x} cy={pool.y} r={pool.r} />
            ))}
          </g>
        </defs>
      </svg>
      {shape?.pieces.map((piece, i) => (
        <svg
          key={i}
          className={styles.spinePiece}
          style={{ left: piece.box.x, top: piece.box.y, width: piece.box.width, height: piece.box.height }}
          viewBox={`${piece.box.x} ${piece.box.y} ${piece.box.width} ${piece.box.height}`}
          focusable="false"
        >
          <defs>
            <mask
              id={`${id}-m${i}`}
              maskUnits="userSpaceOnUse"
              x={piece.box.x}
              y={piece.box.y}
              width={piece.box.width}
              height={piece.box.height}
            >
              <path
                d={piece.d}
                pathLength={1}
                data-reveal
                fill="none"
                stroke="#fff"
                strokeWidth={SIZE * 3.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </mask>
          </defs>
          <use href={`#${id}-ink`} mask={`url(#${id}-m${i})`} />
        </svg>
      ))}
    </div>
  );
}
