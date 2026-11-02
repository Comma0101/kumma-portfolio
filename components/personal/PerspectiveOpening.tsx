/*
THESIS: The same ink becomes a different experience as the view changes.
OWN-WORLD: Existing warm paper, vermilion, Junicode and Sprat; no new imagery.
STORY: Encounter a curve, discover the face, then meet the person and his work.
FIRST VIEWPORT: An edge-to-edge ink study, quiet navigation above it, and a
native view control below. Kumma's small signature arrives with the face.
FORM: One automatic pullback, followed by a native scroll handoff: the face
settles beside the introduction. Work and writing remain directly accessible.
The opening is reversible; reduced motion uses a static, readable composition.
*/
"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { portrait } from "./portrait";
import { decodeTones, spiralPath } from "./spiral";
import { typeClasses } from "./type";
import front from "./Front.module.css";
import styles from "./PerspectiveOpening.module.css";

const CLOSE_ZOOM = 36;
const FOCUS = { x: -24, y: 7 };
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

type ViewControls = {
  seek: (value: number, animate?: boolean) => void;
  replay: () => void;
};

export default function PerspectiveOpening({ children }: { children?: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const controlRegionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const controls = useRef<ViewControls | null>(null);
  const progress = useRef(0);
  const drag = useRef<{ id: number; x: number; y: number; from: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const inputId = `perspective-${useId().replace(/:/g, "")}`;
  const hasJourney = Boolean(children);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!root || !canvas || !context || typeof Path2D === "undefined") {
      setUnavailable(true);
      setRevealed(true);
      return;
    }

    const points = spiralPath(portrait);
    const tones = decodeTones(portrait.tones, portrait.count);
    const pitch = portrait.radius / portrait.turns;
    // Build the two edges of one continuous ribbon. Smooth the source's
    // quantized widths so a close view reveals a curve, not segment joints.
    const left = new Float32Array(points.length * 2);
    const right = new Float32Array(points.length * 2);
    points.forEach(([x, y], index) => {
      const before = Math.max(0, index - 1);
      const after = Math.min(points.length - 1, index + 1);
      const dx = points[after][0] - points[before][0];
      const dy = points[after][1] - points[before][1];
      const length = Math.hypot(dx, dy) || 1;
      const tone = (tones[before] + tones[index] * 2 + tones[after]) / 4;
      const half = (0.35 + (0.92 * pitch - 0.35) * tone) / 2;
      left[index * 2] = x - dy / length * half;
      left[index * 2 + 1] = y + dx / length * half;
      right[index * 2] = x + dy / length * half;
      right[index * 2 + 1] = y - dx / length * half;
    });
    const ribbon = new Path2D();
    ribbon.moveTo(left[0], left[1]);
    for (let index = 1; index < points.length; index += 1) {
      const at = index * 2;
      ribbon.quadraticCurveTo(left[at - 2], left[at - 1], (left[at - 2] + left[at]) / 2, (left[at - 1] + left[at + 1]) / 2);
    }
    const last = (points.length - 1) * 2;
    ribbon.lineTo(left[last], left[last + 1]);
    ribbon.lineTo(right[last], right[last + 1]);
    for (let index = points.length - 2; index >= 0; index -= 1) {
      const at = index * 2;
      ribbon.quadraticCurveTo(right[at + 2], right[at + 3], (right[at + 2] + right[at]) / 2, (right[at + 3] + right[at + 1]) / 2);
    }
    ribbon.lineTo(right[0], right[1]);
    ribbon.closePath();

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-height: 650px)");
    const state = { value: media.matches ? 1 : 0, handoff: 0 };
    let tween: gsap.core.Tween | undefined;
    let frame = 0;
    let scrollFrame = 0;
    let width = 0;
    let height = 0;
    let ratio = 1;
    let hasRevealed = false;
    let hasContinued = false;
    let hasScrollSample = false;

    const paint = () => {
      frame = 0;
      if (!width || !height) return;
      const value = Math.max(clamp(state.value), smooth(clamp(state.handoff * 3)));
      const zoom = Math.exp(Math.log(CLOSE_ZOOM) * (1 - value));
      const center = 1 - smooth(clamp((value - 0.3) / 0.7));
      const settle = smooth(state.handoff);
      const phone = width <= 720;
      const diameter = Math.min(width * 0.82, height * 0.86);
      const small = phone ? Math.min(116, width * 0.32) : Math.min(230, width * 0.2);
      const scale = (diameter + (small - diameter) * settle) / (portrait.radius * 2.04) * zoom;
      const targetX = phone ? width / 2 : Math.max(170, width * 0.21);
      const targetY = phone ? Math.min(100, height * 0.22) : height * 0.48;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.translate(width / 2 + (targetX - width / 2) * settle, height / 2 + (targetY - height / 2) * settle);
      context.scale(scale, scale);
      context.translate(-FOCUS.x * center, -FOCUS.y * center);
      context.fillStyle = getComputedStyle(root).getPropertyValue("--red").trim();
      context.fill(ribbon);
      context.beginPath();
      context.arc(0, 0, 1.8, 0, Math.PI * 2);
      context.fill();
    };

    const sync = () => {
      progress.current = clamp(state.value);
      const value = progress.current;
      root.dataset.progress = value.toFixed(3);
      root.dataset.view = value < 0.15 ? "detail" : value > 0.9 ? "portrait" : "between";
      if (sliderRef.current) {
        sliderRef.current.value = String(Math.round(value * 100));
        sliderRef.current.setAttribute(
          "aria-valuetext",
          value < 0.15 ? "Close view of the ink line" : value > 0.9 ? "Full portrait" : "Between detail and portrait",
        );
      }
      if (value > 0.8 && !hasRevealed) {
        hasRevealed = true;
        setRevealed(true);
      }
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const fit = () => {
      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const nextRatio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3_000_000 / (box.width * box.height)));
      if (box.width === width && box.height === height && nextRatio === ratio) return;
      width = box.width;
      height = box.height;
      ratio = nextRatio;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      sync();
      scheduleScroll();
    };

    const seek = (value: number, animate = false) => {
      tween?.kill();
      const target = clamp(value);
      if (!animate || media.matches) {
        state.value = target;
        sync();
        return;
      }
      tween = gsap.to(state, { value: target, duration: 1.25, ease: "power2.inOut", onUpdate: sync });
    };

    const replay = () => {
      seek(0);
      if (media.matches) return;
      tween = gsap.to(state, { value: 1, delay: 0.8, duration: 5.8, ease: "power2.inOut", onUpdate: sync });
    };

    const sampleScroll = () => {
      scrollFrame = 0;
      const stage = stageRef.current;
      const readingLayout = media.matches || compact.matches;
      const value = !hasJourney || readingLayout || !stage
        ? 0
        : clamp(-root.getBoundingClientRect().top / Math.max(1, root.offsetHeight - stage.offsetHeight));
      const changed = !hasScrollSample || state.handoff !== value;
      hasScrollSample = true;
      state.handoff = value;
      const intro = readingLayout ? 1 : smooth(clamp((value - 0.2) / 0.55));
      const visibleControls = readingLayout ? 1 : 1 - smooth(clamp(value / 0.4));
      root.dataset.handoff = value.toFixed(3);
      root.dataset.settled = value > 0.05 ? "true" : "false";
      root.dataset.introVisible = intro > 0.8 ? "true" : "false";
      root.style.setProperty("--intro-opacity", String(intro));
      root.style.setProperty("--intro-offset", `${(1 - intro) * 24}px`);
      root.style.setProperty("--controls-opacity", String(visibleControls));
      if (controlRegionRef.current) controlRegionRef.current.inert = visibleControls < 0.1;
      if (value > 0.03 && !hasContinued) {
        hasContinued = true;
        drag.current = null;
        seek(1, true);
      } else if (changed) sync();
    };

    function scheduleScroll() {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(sampleScroll);
    }

    const onPreference = () => {
      setReduced(media.matches);
      if (media.matches) seek(1);
      scheduleScroll();
    };

    controls.current = { seek, replay };
    setReduced(media.matches);
    fit();
    sync();
    setReady(true);
    if (!media.matches) replay();
    const observer = new ResizeObserver(fit);
    observer.observe(canvas);
    media.addEventListener("change", onPreference);
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll, { passive: true });
    sampleScroll();

    return () => {
      tween?.kill();
      if (frame) window.cancelAnimationFrame(frame);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      observer.disconnect();
      media.removeEventListener("change", onPreference);
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      controls.current = null;
    };
  }, [hasJourney]);

  return (
    <article
      ref={rootRef}
      className={`${front.front} ${typeClasses} ${styles.opening}`}
      data-paper
      data-ready={ready ? "true" : undefined}
      data-journey={hasJourney ? "true" : undefined}
      data-reduced={reduced ? "true" : undefined}
      data-unavailable={unavailable ? "true" : undefined}
    >
      <noscript>
        <style>{`.${styles.signature}{opacity:1;transform:none}.${styles.noScriptNotice}{display:grid}.${styles.opening}[data-journey]{height:auto}.${styles.opening}[data-journey] .${styles.preview}{height:auto;position:relative;grid-template-rows:auto minmax(320px,52svh) auto auto}.${styles.intro}{position:static;opacity:1;transform:none;max-width:none;padding:3rem var(--gutter);pointer-events:auto}.${styles.intro} a{pointer-events:auto}.${styles.controls},.${styles.controlNote}{display:none}`}</style>
      </noscript>
      <div ref={stageRef} className={styles.preview}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← Current site</Link>
        <nav aria-label="Explore Kumma’s work">
          <Link href="/work">Work ↗</Link>
          <Link href="/notes">Writing ↗</Link>
        </nav>
      </header>

      <div className={styles.artwork}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          role="img"
          aria-label="Kumma Wu’s face formed by one continuous red spiral. Use the controls below to explore the line and the portrait."
          onPointerDown={(event) => {
            if (!ready || !event.isPrimary || event.button !== 0 || Number(rootRef.current?.dataset.handoff || 0) > 0.05) return;
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, from: progress.current };
            controls.current?.seek(progress.current);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const current = drag.current;
            if (!current || current.id !== event.pointerId) return;
            const x = event.clientX - current.x;
            const y = event.clientY - current.y;
            if (Math.abs(x) < 5 || Math.abs(x) < Math.abs(y)) return;
            event.preventDefault();
            controls.current?.seek(current.from + x / event.currentTarget.clientWidth * 1.3);
          }}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}
        >
          A portrait of Kumma Wu, constructed from one red spiral.
        </canvas>
        {unavailable && (
          <p className={styles.unavailable} role="status">
            The portrait preview is unavailable. You can still explore the work and writing above.
          </p>
        )}
        <p className={`${styles.unavailable} ${styles.noScriptNotice}`}>
          The portrait needs JavaScript. Work and writing remain available above.
        </p>
      </div>

      <div className={styles.lower}>
        <div ref={controlRegionRef}>
          <div className={styles.controls}>
            <button type="button" disabled={!ready} onClick={() => controls.current?.seek(0, true)}>Detail</button>
            <label htmlFor={inputId} className="sr-only">Move between the ink line and the complete portrait</label>
            <input
              ref={sliderRef}
              id={inputId}
              className={styles.range}
              type="range"
              min={0}
              max={100}
              step={1}
              defaultValue={0}
              disabled={!ready}
              onChange={(event) => controls.current?.seek(Number(event.currentTarget.value) / 100)}
            />
            <button type="button" disabled={!ready} onClick={() => controls.current?.seek(1, true)}>Portrait</button>
          </div>
          <div className={styles.controlNote}>
            <span>Drag to change the view.</span>
            {!reduced && <button type="button" disabled={!ready} onClick={() => controls.current?.replay()}>Replay ↺</button>}
          </div>
        </div>
        <footer className={styles.signature} data-visible={revealed ? "true" : undefined}>
          <h1>Kumma</h1>
          <p>
            {hasJourney ? <>Scroll to continue <span aria-hidden="true">↓</span></> : "Software and writing."}
          </p>
        </footer>
      </div>
      {hasJourney && (
        <div
          id="view-intro"
          className={styles.intro}
          onFocusCapture={() => {
            const root = rootRef.current;
            const stage = stageRef.current;
            if (!root || !stage || reduced || unavailable || window.matchMedia("(max-height: 650px)").matches || Number(root.dataset.handoff || 0) > 0.9) return;
            const top = window.scrollY + root.getBoundingClientRect().top + root.offsetHeight - stage.offsetHeight;
            const scroller = (window as Window & { lenis?: { scrollTo: (target: number, options: { immediate: boolean }) => void } }).lenis;
            if (scroller) scroller.scrollTo(top, { immediate: true });
            else window.scrollTo({ top, behavior: "instant" });
          }}
        >
          {children}
        </div>
      )}
      </div>
    </article>
  );
}
