"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Ink, { type Trace } from "./Ink";
import { anchor } from "./anchors";
import { inkStroke } from "./ink";
import { handLine, type Point } from "./pen";
import { crossesOut } from "./strike";
import ChapterMark from "./ChapterMark";
import ThenNow from "./ThenNow";
import { draw, reveal, useBeat } from "./useBeat";
import styles from "./Front.module.css";

// 主: agency is an edit, and the reader makes it. Drag a line through the
// "Re" of "Reacting." and your own stroke is the ink; tap it (or press the
// button) and the pen strikes it for you. Either way the struck letters
// stay on the paper, faded — a hand that cannot erase, only decide — and
// only then does the present arrive under the past. Scroll past without
// acting and "Reacting." stays as it is.
const strike: Trace = (_, host) => {
  const re = anchor(host, "re");
  if (!re) return { points: [] };
  // Across the letters' middle, rising a little as a hand does.
  const y = re.y + re.height * 0.5;
  return {
    points: handLine([re.x - re.height * 0.06, y + 4], [re.x + re.width + re.height * 0.08, y - 6], 31, 0.5),
    size: Math.max(4, re.height * 0.075),
    emphasis: [{ from: 0, to: 1, weight: 1.4 }],
  };
};

type Stroke = { d: string };
const MAX_STROKES = 6;

export default function Agency() {
  const ref = useRef<HTMLElement>(null);
  const reRef = useRef<HTMLSpanElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [live, setLive] = useState<Stroke | null>(null);
  const [struck, setStruck] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const done = useRef(false);

  // The invitation appears a beat after the word does.
  useBeat(ref, (root, tl) => {
    tl.to(root.querySelector("[data-hint]"), { opacity: 1, duration: 0.8, ease: "power1.out" }, 0.9);
  });

  useEffect(() => {
    // With reduced motion the page arrives finished: struck, glossed, now.
    setInteractive(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // What follows the decision, however it was made.
  const commit = (byPen: boolean) => {
    const root = ref.current;
    if (!root || done.current) return;
    done.current = true;
    setStruck(true);
    const tl = gsap.timeline();
    if (byPen) draw(tl, reveal(root, "strike"), { duration: 0.42, ease: "power2.in", position: 0 });
    tl.to(root.querySelector("[data-struck]"), { opacity: 0.16, duration: 0.7, ease: "power1.out" }, byPen ? ">0.05" : 0.1)
      .to(root.querySelector("[data-hint]"), { opacity: 0, duration: 0.4 }, "<")
      .set(root.querySelector("[data-source]"), { visibility: "visible" }, ">0.1")
      .to(root.querySelector("[data-now]"), { opacity: 1, duration: 1.1, ease: "power1.out" }, ">0.5");
  };

  useEffect(() => {
    const root = ref.current;
    const re = reRef.current;
    if (!interactive || !root || !re) return;
    let points: Point[] = [];
    let down: Point | null = null;
    let id = -1;
    let seed = 60;
    const local = (event: PointerEvent): Point => {
      const box = root.getBoundingClientRect();
      return [event.clientX - box.left, event.clientY - box.top];
    };
    const area = () => {
      const box = root.getBoundingClientRect();
      const r = re.getBoundingClientRect();
      return { x: r.left - box.left, y: r.top - box.top, width: r.width, height: r.height };
    };
    const render = (line: Point[]) => {
      const { height } = area();
      if (line.length < 2) return null;
      const ink = inkStroke(line, { size: Math.max(4, height * 0.075), seed, smoothing: 2, lift: 2 });
      return { d: ink.outline };
    };
    const onDown = (event: PointerEvent) => {
      if (done.current || strokes.length >= MAX_STROKES) return;
      const p = local(event);
      const a = area();
      // Begin anywhere near the word's start: the margin, the R, the e.
      if (p[0] < a.x - a.height * 0.8 || p[0] > a.x + a.width * 1.3 || p[1] < a.y - a.height * 0.4 || p[1] > a.y + a.height * 1.2) return;
      // A stroke, not a text selection or an image drag.
      event.preventDefault();
      id = event.pointerId;
      down = p;
      points = [p];
      root.setPointerCapture?.(id);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== id || !down) return;
      const p = local(event);
      const last = points[points.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 2) return;
      points.push(p);
      setLive(render(points));
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== id || !down) return;
      const start = down;
      down = null;
      id = -1;
      const moved = points.reduce((max, p) => Math.max(max, Math.hypot(p[0] - start[0], p[1] - start[1])), 0);
      setLive(null);
      // A tap is a request: the pen strikes for you.
      if (moved < 6) {
        commit(true);
        return;
      }
      const drawn = render(points);
      seed += 1;
      // Whatever was drawn stays; it counts once it crosses the word out.
      if (drawn) setStrokes((all) => [...all, drawn]);
      if (crossesOut(points, area())) commit(false);
    };
    const onCancel = () => {
      down = null;
      id = -1;
      setLive(null);
    };
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onCancel);
    return () => {
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onCancel);
    };
    // Re-bound when a stroke is added, so the count is current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, strokes.length]);

  return (
    <section
      ref={ref}
      className={styles.agency}
      aria-labelledby="agency"
      data-thread="agency"
      data-struck-state={struck ? "struck" : "open"}
    >
      <p className={styles.label}>
        <ChapterMark char="主" label="Agency" />
      </p>
      <p className={styles.first}>Before I call a choice my own, I want to notice what is moving me.</p>
      <h2 id="agency" className={styles.agencyLine} data-interactive={interactive ? "" : undefined}>
        <span aria-hidden="true">
          <span ref={reRef} className={styles.struck} data-anchor="re" data-struck>
            Re
          </span>
          acting.
        </span>
        <span className="sr-only">Reacting — strike out the “re” to leave “acting.”</span>
      </h2>
      <Ink trace={strike} mark="strike" size={5} seed={31} lift={2} className={styles.thread} />
      {/* The reader's own strokes: whatever is drawn stays. */}
      <svg className={styles.readerInk} aria-hidden="true" focusable="false">
        {strokes.map((stroke, index) => (
          <path key={index} d={stroke.d} />
        ))}
        {live && <path d={live.d} />}
      </svg>
      <p className={styles.agencyHint} data-hint aria-hidden={struck ? "true" : undefined}>
        Draw a line through the “Re”.{" "}
        <button type="button" className={styles.agencyButton} onClick={() => commit(true)} disabled={struck}>
          Or let the pen do it
        </button>
      </p>
      <p className={styles.agencyGloss} data-source>
        <span lang="zh-Hant">主體</span> Agency: to be the subject of your own sentence, not its object.
      </p>
      <ThenNow
        waitFor="act"
        then="Habit and other people’s expectations can move me before I have asked whether I agree."
        now="I want to notice those influences, choose what I will act on, and answer for the consequences."
      />
    </section>
  );
}
