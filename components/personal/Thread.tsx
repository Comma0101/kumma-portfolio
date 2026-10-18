"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import type { Size } from "./Ink";
import { centerline, inkStroke, pointAt, type Pool } from "./ink";
import { anchor, threadX } from "./anchors";
import { ensoRing } from "./enso";
import { corner, fitPoints, handLine, steps, type Box, type Point } from "./pen";
import { blotRadius, chunksOf, marginSpans, scrolledArc, slice, within, type Chunk } from "./thread";
import { ease } from "./useBeat";
import styles from "./Front.module.css";


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
const spine = (
  { width }: Size,
  host: HTMLElement,
): { points: Point[]; split?: number; ends?: number[] } => {
  // The host covers the page exactly; the anchors live in the page itself.
  const front = host.parentElement ?? host;
  const name = anchor(front, "name");
  const opening = section(front, "opening");
  const catchUp = section(front, "catch");
  const stairs = section(front, "steps");
  const heading = anchor(front, "steps");
  const practice = section(front, "practice");
  const rules = section(front, "rules");
  if (!name || !opening || !catchUp || !stairs || !heading || !practice || !rules) {
    return { points: [] };
  }
  const x = threadX(front);
  const gutter = Math.max(16, window.innerWidth * 0.04);
  const bottom = (box: Box) => box.y + box.height;
  const points: Point[] = [];
  const ends: number[] = [];
  let seed = 100;
  // round: where the line turns to travel somewhere, it curves round
  // (radius in px) — a pen, not a frame. Returns where the turn begins.
  const to = (target: Point, wobble = 0.6, round = 0) => {
    seed += 1;
    const at = round > 0 ? corner(points, target, round) : points.length - 1;
    points.push(...handLine(points[points.length - 1], target, seed, wobble).slice(1));
    return at;
  };
  const end = () => ends.push(points.length - 1);

  // Opening: the taut underline — the page's horizon — then down the
  // paper's edge past the face, and dragged once, diagonally, under
  // everything and home to the margin, overshooting a little.
  const y = name.y + name.height * 0.98;
  // From the point where the pen landed.
  const outer = front.getBoundingClientRect();
  const dot = front.querySelector("[data-landing]")?.getBoundingClientRect();
  points.push([dot ? dot.left + dot.width / 2 - outer.left : name.x - 4, y]);
  to([name.x + name.width + 6, y - 5], 0.6);
  const home = bottom(opening) - 10;
  // Down close against the face's right edge — the line holds it — then
  // clear of everything under the horizon (on a phone, the words too).
  const face = front.querySelector('[data-thread="opening"] figure')?.getBoundingClientRect();
  const edge = face ? Math.min(width - 6, face.right - outer.left + 26) : width - Math.max(8, gutter * 0.45);
  const origin = outer.top;
  const under = [...front.querySelectorAll('[data-thread="opening"] figure, [data-thread="opening"] p')]
    .map((el) => el.getBoundingClientRect().bottom - origin)
    .reduce((a, b) => Math.max(a, b), y + 80);
  const past = under + 28;
  const split = to([edge, y + 90], 0.4, 46);
  to([edge - 2, Math.min(past, home - 40)], 0.4, 30);
  to([x + 40, home - 6], 0.8, 70);
  to([x - 7, home + 4], 0.4, 24);
  to([x, bottom(opening) + 2], 0.3, 10);
  end();

  // Understanding arrives first: the margin, nothing more.
  to([x, bottom(catchUp)], 0.5);
  end();

  // Three steps forward, two back — stepping off the last word, then down
  // from the last stair to the table below and back along its top rule:
  // the stairs lead into the practice.
  const top = heading.y + heading.height + 6;
  to([x, top], 0.5);
  const walk = fitPoints(steps({ seed: 6, cycles: 4 }), {
    x,
    y: top,
    width: width - x - gutter - 12,
    height: 210,
  });
  to(walk[0], 0.3);
  points.push(...walk.slice(1));
  const [far] = walk[walk.length - 1];
  const table = front.querySelector('[data-thread="practice"] ol')?.getBoundingClientRect();
  const rule = table ? table.top - front.getBoundingClientRect().top : bottom(stairs) + 40;
  to([far, rule], 0.3, 14);
  to([x + 24, rule], 0.15, 20);
  to([x, rule + 24], 0.3, 18);
  end();

  // Practice: a tally barb from the margin to each numeral — one stroke
  // out, one back, the way a margin is marked — each a little shorter,
  // a hand tiring, not a form.
  for (let i = 0; i < 4; i += 1) {
    const numeral = anchor(front, `tick-${i}`);
    if (!numeral) continue;
    const y = numeral.y + numeral.height * 0.5;
    to([x, y - 7], 0.4);
    points.push([x + (numeral.x - 6 - x) * (1 - 0.18 * i), y + 1]);
    points.push([x + 1, y + 7]);
  }
  to([x, bottom(practice)], 0.5);
  end();

  // The rules: the pen holds the margin. Price is not the pen.
  to([x, bottom(rules)], 0.5);
  end();

  // The reason: down the margin and along beneath the open circle, where
  // the pen lifts. The circle itself is a new stroke (Line), set down on
  // its own — that is how an ensō is made.
  const enso = ensoRing(front);
  if (enso) {
    to([x, Math.max(points[points.length - 1][1] + 1, enso.below)], 0.5);
    to([enso.cx, enso.below + 2], 0.8, 34);
  } else {
    to([x, bottom(rules) + 400], 0.5);
  }
  end();

  return { points, split, ends };
};

type Piece = { d: string; box: Box; chunk: Chunk };
// pace: the hand's timing over the whole line (see ink.ts pace()).
// line: the stroke's samples, to find where the pen tip is.
type Shape = {
  gaps: string;
  outline: string;
  pools: Pool[];
  pieces: Piece[];
  split: number;
  pace: number[];
  line: Point[];
};

const SIZE = 3.6;

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
      const ink = inkStroke(points, {
        size: SIZE,
        seed: 3,
        smoothing: 2,
        spacing: 6,
        breath: 0.16,
        // The horizon under the name is pressed hardest: the page's line.
        emphasis: [{ from: 0, to: split === undefined ? 0 : chunksOf(points, [split, points.length - 1])[0].to, weight: 1.55 }],
        // The thread lifts off slowly beneath the circle.
        lift: 22,
        skips: true,
      });
      const chunks = chunksOf(points, ends);
      // Where the line runs down the margin, for the navigation to rest on.
      host.dataset.margin = marginSpans(ink.line, threadX(front))
        .map(([a, b]) => `${Math.round(a)},${Math.round(b)}`)
        .join(" ");
      const splitArc = split === undefined ? 0 : chunksOf(points, [split, points.length - 1])[0].to;
      setShape({
        gaps: ink.gaps,
        outline: ink.outline,
        pools: ink.pools,
        split: splitArc,
        pace: ink.pace,
        line: ink.line,
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
      let changed = false;
      current.pieces.forEach((piece, i) => {
        const p = Number(within(piece.chunk, arc).toFixed(4));
        if (shown[i] === p || !paths[i]) return;
        shown[i] = p;
        changed = true;
        paths[i].style.strokeDashoffset = String(1 - p);
      });
      // Tell the page where the pen is (the navigation rides the tip).
      if (changed) {
        const [tx, ty] = pointAt(current.line, arc);
        front.dispatchEvent(
          new CustomEvent("kumma:tip", {
            detail: { x: tx, y: ty, onMargin: Math.abs(tx - threadX(front)) < 30 },
          }),
        );
      }
    };

    // The opening: once the coil (in Opening) pulls taut, the underline is
    // taut, holds still, then walks down the right edge and back.
    const tl = gsap.timeline({ paused: true, onUpdate: apply });
    // The coil (Opening) has just pulled straight: the underline is there.
    tl.to(state, { opening: () => shapeRef.current?.split ?? 0, duration: 0.04, ease: "none" });
    // The point where the pen landed recoils once as the line pulls taut:
    // the only overshoot on the page.
    const landing = front.querySelector("[data-landing]");
    if (landing) {
      tl.to(landing, { scale: 0.82, duration: 0.07, ease: "power2.in" }, 0.02);
      tl.to(landing, { scale: 1, duration: 0.22, ease: "power4.out" }, 0.09);
    }
    tl.to(
      state,
      { opening: () => shapeRef.current?.pieces[0]?.chunk.to ?? 0, duration: 1.15, ease: ease.hand },
      ">0.35",
    );
    const play = () => tl.play();
    front.addEventListener("kumma:lifted", play, { once: true });
    // Arrived mid-page, or the opening never ran: do not wait for it.
    const fallback = window.setTimeout(play, 3200);

    // Each section's own tempo: how closely the ink follows the reader.
    // The body catches up slowly; tally barbs are struck; the approach
    // to the reason is unhurried.
    const tempo = [0.12, 0.04, 0.2, 0.45, 0.12, 0.05];

    // Where the reader pauses, the resting pen bleeds into the paper, and
    // the pool stays: by the end the line is a record of the reader's own
    // attention. Pausing again near a pool deepens it.
    const rest = { scroll: window.scrollY, since: performance.now(), blot: null as HTMLElement | null };
    const blots: { x: number; y: number; r: number; el: HTMLElement }[] = [];
    const bleed = (current: Shape, moving: boolean) => {
      const now = performance.now();
      if (moving || state.drawn <= 0) {
        rest.since = now;
        rest.blot = null;
        return;
      }
      const r = blotRadius((now - rest.since) / 1000);
      if (!r) return;
      const [x, y] = pointAt(current.line, Math.max(state.opening, state.drawn));
      const top = front.getBoundingClientRect().top + y;
      if (top < 0 || top > window.innerHeight) return;
      let blot = blots.find((b) => Math.hypot(b.x - x, b.y - y) < 14);
      if (!blot) {
        if (blots.length >= 24) return;
        const el = document.createElement("span");
        el.className = styles.blot;
        // An irregular edge: ink follows the paper's fibres, not a compass.
        const k = () => 44 + Math.round(Math.random() * 12);
        el.style.borderRadius = `${k()}% ${100 - k()}% ${k()}% ${100 - k()}% / ${k()}% ${k()}% ${100 - k()}% ${100 - k()}%`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        host.appendChild(el);
        blot = { x, y, r: 0, el };
        blots.push(blot);
      }
      if (r > blot.r + 0.05) {
        blot.r = r;
        blot.el.style.width = blot.el.style.height = `${(r * 2).toFixed(1)}px`;
      }
    };

    const tick = () => {
      const current = shapeRef.current;
      if (!current) return;
      const tip = window.innerHeight * 0.72 - front.getBoundingClientRect().top;
      const target = scrolledArc(
        current.pieces.map((piece) => piece.chunk),
        current.pace,
        tip,
      );
      // The pen only ever moves forward (ink once written stays); the
      // reader is still only when neither the pen nor the page moves.
      const writing = target > state.drawn + 1e-4;
      const moving = writing || Math.abs(window.scrollY - rest.scroll) > 0.5;
      rest.scroll = window.scrollY;
      if (writing) {
        const at = current.pieces.findIndex((piece) => state.drawn < piece.chunk.to);
        const rate = tempo[at] ?? 0.12;
        state.drawn = Math.min(target, state.drawn + Math.max(0.0005, (target - state.drawn) * rate));
        apply();
      }
      bleed(current, moving);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      blots.forEach((b) => b.el.remove());
      front.removeEventListener("kumma:lifted", play);
      window.clearTimeout(fallback);
      tl.kill();
    };
  }, []);

  return (
    <div ref={ref} className={styles.spineHost} aria-hidden="true">
      <svg className={styles.spineDefs} focusable="false">
        <defs>
          {/* Paper tooth: where the ball rides over the paper's valleys,
              ink does not reach. Painted into every ballpoint's mask. */}
          <pattern id="kumma-tooth" patternUnits="userSpaceOnUse" width="64" height="64">
            <image href="/kumma/tooth.png" width="64" height="64" />
          </pattern>
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
                stroke="url(#kumma-tooth)"
                strokeWidth={SIZE * 3.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d={shape.gaps} fill="none" stroke="#000" strokeWidth={1.2} />
            </mask>
          </defs>
          <use href={`#${id}-ink`} mask={`url(#${id}-m${i})`} />
        </svg>
      ))}
    </div>
  );
}
