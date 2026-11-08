"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { centerline } from "./ink";
import { handLine, type Box, type Point } from "./pen";
import { crossesOut } from "./strike";
import { createContribution, MAX_CONTRIBUTION_POINTS, type Contribution } from "./contribution";
import { useContribution } from "./Contribution";
import ChapterMark from "./ChapterMark";
import ThenNow from "./ThenNow";
import styles from "./Front.module.css";

type Stroke = {
  contribution: Contribution;
  placement: Box;
  maskWidth: number;
};

const MAX_STROKES = 6;

function placedStroke(contribution: Contribution, word: Box, size: number): Stroke {
  const { bounds } = contribution;
  return {
    contribution,
    placement: {
      x: (bounds.x - word.x) / word.height,
      y: (bounds.y - word.y) / word.height,
      width: bounds.width / word.height,
      height: bounds.height / word.height,
    },
    maskWidth: size * 4,
  };
}

export default function Agency() {
  const ref = useRef<HTMLElement>(null);
  const reRef = useRef<HTMLSpanElement>(null);
  const maskId = `agency-${useId().replace(/:/g, "")}`;
  const { setContribution } = useContribution();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [live, setLive] = useState<Stroke | null>(null);
  const [wordBox, setWordBox] = useState<Box | null>(null);
  const [struck, setStruck] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const done = useRef(false);
  const byPen = useRef(false);
  const settled = useRef(false);

  const measureWord = useCallback(() => {
    const root = ref.current;
    const word = reRef.current;
    if (!root || !word) return null;
    const host = root.getBoundingClientRect();
    const box = word.getBoundingClientRect();
    if (!box.height || !box.width) return null;
    const measured = {
      x: box.left - host.left,
      y: box.top - host.top,
      width: box.width,
      height: box.height,
    };
    setWordBox(measured);
    return measured;
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    setInteractive(true);
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const root = ref.current;
    const word = reRef.current;
    if (!root || !word) return;
    let frame = 0;
    let mounted = true;
    const schedule = () => {
      if (frame || !mounted) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measureWord();
      });
    };
    measureWord();
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    observer.observe(word);
    document.fonts.ready.then(schedule).catch(() => undefined);
    return () => {
      mounted = false;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [measureWord]);

  const retain = useCallback((stroke: Stroke) => {
    setStrokes((previous) => [...previous, stroke].slice(-MAX_STROKES));
    setContribution(stroke.contribution);
  }, [setContribution]);

  const commit = useCallback((withPen: boolean) => {
    if (done.current) return;
    if (withPen) {
      const word = measureWord();
      if (!word) return;
      const size = Math.max(4, word.height * 0.075);
      const y = word.y + word.height * 0.5;
      const points = handLine(
        [word.x - word.height * 0.06, y + 4],
        [word.x + word.width + word.height * 0.08, y - 6],
        31,
        0.5,
      );
      const contribution = createContribution(points, "pen", {
        size,
        seed: 31,
        emphasis: [{ from: 0, to: 1, weight: 1.4 }],
      });
      if (!contribution) return;
      retain(placedStroke(contribution, word, size));
    }
    byPen.current = withPen;
    done.current = true;
    setStruck(true);
  }, [measureWord, retain]);

  useEffect(() => {
    const root = ref.current;
    if (!root || !struck) return;
    const targets = {
      word: root.querySelector("[data-struck]"),
      source: root.querySelector("[data-source]"),
      pen: root.querySelector("[data-pen-reveal]"),
    };
    const context = gsap.context(() => {
      if (reducedMotion || settled.current) {
        settled.current = true;
        gsap.set(targets.word, { opacity: 0.16 });
        gsap.set(targets.source, { visibility: "visible" });
        if (targets.pen) gsap.set(targets.pen, { strokeDashoffset: 0 });
        return;
      }
      const timeline = gsap.timeline({ onComplete: () => { settled.current = true; } });
      if (byPen.current && targets.pen) {
        timeline.fromTo(targets.pen, { strokeDashoffset: 1 }, {
          strokeDashoffset: 0,
          duration: 0.42,
          ease: "power2.in",
        });
      }
      timeline.to(targets.word, { opacity: 0.16, duration: 0.7, ease: "power1.out" }, byPen.current ? ">0.05" : 0.1)
        .set(targets.source, { visibility: "visible" }, ">0.1");
    }, root);
    return () => context.revert();
  }, [struck, reducedMotion]);

  useEffect(() => {
    const root = ref.current;
    if (!interactive || !root) return;
    let points: Point[] = [];
    let word: Box | null = null;
    let pointer: number | null = null;
    let seed = 60 + strokes.length;
    let frame = 0;
    const local = (event: PointerEvent): Point => {
      const host = root.getBoundingClientRect();
      return [
        Math.max(0, Math.min(root.clientWidth, event.clientX - host.left)),
        Math.max(0, Math.min(root.clientHeight, event.clientY - host.top)),
      ];
    };
    const render = () => {
      if (!word) return null;
      const size = Math.max(4, word.height * 0.075);
      const contribution = createContribution(points, "reader", { size, seed });
      return contribution ? placedStroke(contribution, word, size) : null;
    };
    const release = () => {
      const captured = pointer;
      pointer = null;
      if (captured !== null && root.hasPointerCapture?.(captured)) root.releasePointerCapture(captured);
      window.cancelAnimationFrame(frame);
      frame = 0;
      setLive(null);
    };
    const onDown = (event: PointerEvent) => {
      if (done.current || pointer !== null || strokes.length >= MAX_STROKES || event.button !== 0) return;
      if ((event.target as Element).closest("button, a")) return;
      const measured = measureWord();
      if (!measured) return;
      const p = local(event);
      const nearWord = p[0] >= measured.x - measured.height * 0.8
        && p[0] <= measured.x + measured.width * 1.3
        && p[1] >= measured.y - measured.height * 0.4
        && p[1] <= measured.y + measured.height * 1.2;
      if (!nearWord) return;
      event.preventDefault();
      pointer = event.pointerId;
      word = measured;
      points = [p];
      root.setPointerCapture?.(pointer);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointer) return;
      const p = local(event);
      const last = points[points.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 2) return;
      if (points.length < MAX_CONTRIBUTION_POINTS) points.push(p);
      else points[MAX_CONTRIBUTION_POINTS - 1] = p;
      if (!frame) frame = window.requestAnimationFrame(() => {
        frame = 0;
        setLive(render());
      });
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== pointer || !word) return;
      const moved = points.reduce((distance, p) => Math.max(
        distance,
        Math.hypot(p[0] - points[0][0], p[1] - points[0][1]),
      ), 0);
      const stroke = render();
      release();
      if (moved < 6) {
        commit(true);
        return;
      }
      if (stroke) retain(stroke);
      seed += 1;
      if (crossesOut(points, word)) commit(false);
    };
    const onCancel = (event: PointerEvent) => {
      if (event.pointerId === pointer) release();
    };
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onCancel);
    root.addEventListener("lostpointercapture", onCancel);
    return () => {
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onCancel);
      root.removeEventListener("lostpointercapture", onCancel);
      if (pointer !== null && root.hasPointerCapture?.(pointer)) root.releasePointerCapture(pointer);
      window.cancelAnimationFrame(frame);
    };
  }, [interactive, strokes.length, measureWord, retain, commit]);

  const marks = live ? [...strokes, live] : strokes;

  return (
    <section
      ref={ref}
      className={styles.agency}
      aria-labelledby="agency"
      data-thread="agency"
      data-struck-state={struck ? "struck" : "open"}
      data-participation={interactive ? "ready" : undefined}
    >
      <p className={styles.label}>
        <ChapterMark char="主" label="Agency" />
      </p>
      <p className={styles.first}>Before I call a choice my own, I want to notice what is moving me.</p>
      <h2 id="agency" className={styles.agencyLine} data-interactive={interactive ? "" : undefined}>
        <span aria-hidden="true">
          <span
            ref={reRef}
            className={styles.struck}
            data-anchor="re"
            data-struck
            style={interactive && !struck ? { opacity: 1 } : undefined}
          >Re</span>
          acting.
        </span>
        <span className="sr-only">Reacting — strike out the “re” to leave “acting.”</span>
      </h2>
      {wordBox && marks.map((stroke, index) => {
        const { contribution, placement } = stroke;
        const { bounds } = contribution;
        const pen = contribution.source === "pen";
        const mask = `${maskId}-${index}`;
        return (
          <svg
            key={index}
            className={styles.readerInk}
            aria-hidden="true"
            focusable="false"
            viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
            preserveAspectRatio="xMidYMid meet"
            data-contribution-source={contribution.source}
            style={{
              inset: "auto",
              left: wordBox.x + placement.x * wordBox.height,
              top: wordBox.y + placement.y * wordBox.height,
              width: placement.width * wordBox.height,
              height: placement.height * wordBox.height,
            }}
          >
            {pen && (
              <defs>
                <mask id={mask} maskUnits="userSpaceOnUse" x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height}>
                  <path
                    d={centerline(contribution.points)}
                    pathLength={1}
                    strokeWidth={stroke.maskWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="1 1"
                    strokeDashoffset={reducedMotion ? 0 : 1}
                    data-pen-reveal
                    style={{ fill: "none", stroke: "white" }}
                  />
                </mask>
              </defs>
            )}
            <path d={contribution.d} mask={pen ? `url(#${mask})` : undefined} data-contribution-outline />
          </svg>
        );
      })}
      <p
        className={styles.agencyHint}
        data-hint
        hidden={!interactive}
        aria-hidden={struck ? "true" : undefined}
        style={{ opacity: struck ? 0 : 1 }}
      >
        Draw a line through the “Re”.{" "}
        <button type="button" className={styles.agencyButton} onClick={() => commit(true)} disabled={!interactive || struck}>
          Or let the pen do it
        </button>
      </p>
      <p className="sr-only" role="status">{struck ? "Acting. The earlier word and its mark stay on the page." : ""}</p>
      <p className={styles.agencyGloss} data-source>
        <span lang="zh-Hant">主體</span> Agency: to be the subject of your own sentence, not its object.
      </p>
      <ThenNow
        then="Habit and other people’s expectations can move me before I have asked whether I agree."
        now="I want to notice those influences, choose what I will act on, and answer for the consequences."
      />
    </section>
  );
}
