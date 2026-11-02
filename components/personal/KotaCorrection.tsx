"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import Ink, { type Trace } from "./Ink";
import { anchor } from "./anchors";
import type { Profile } from "./brush";
import { handLine, type Point } from "./pen";
import { draw } from "./useBeat";
import styles from "./KotaCorrection.module.css";

const pressure: Profile = (f) => 0.62 + 0.12 * Math.sin(Math.PI * f) - 0.28 * f * f;

function curve(from: Point, a: Point, b: Point, to: Point): Point[] {
  return Array.from({ length: 25 }, (_, i): Point => {
    const t = i / 24;
    const u = 1 - t;
    return [
      u * u * u * from[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t * t * t * to[0],
      u * u * u * from[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t * t * t * to[1],
    ];
  });
}

// An illustrated item swap from KotaCaseStudy, not a simulated call or
// confirmed order. The same pen crosses only "chicken", leaves the words
// intact, and travels through the paper to underline "shrimp".
const correction: Trace = (_, host) => {
  const chicken = anchor(host, "correction-chicken");
  const shrimp = anchor(host, "correction-shrimp");
  if (!chicken || !shrimp) return { points: [] };

  const start: Point = [chicken.x - 2, chicken.y + chicken.height * 0.53];
  const crossed: Point = [chicken.x + chicken.width + 2, start[1] - 1.5];
  const points = handLine(start, crossed, 613, 0.65);
  const strikeEnd = points.length - 1;
  const left = Math.max(5, Math.min(chicken.x + 3, shrimp.x - 18));
  const below: Point = [left, chicken.y + chicken.height + 32];
  const under: Point = [shrimp.x - 7, shrimp.y + shrimp.height + 8];

  points.push(...curve(crossed, [crossed[0] + 3, crossed[1] + 20], [left, below[1] - 12], below).slice(1));
  points.push(...curve(below, [left, under[1] - 30], [under[0] - 12, under[1] - 22], under).slice(1));
  const travelEnd = points.length - 1;
  points.push(...handLine(under, [shrimp.x + shrimp.width + 3, under[1] - 2], 617, 0.8).slice(1));

  return {
    points,
    ends: [strikeEnd, travelEnd, points.length - 1],
    size: Math.max(2.4, Math.min(3.8, chicken.height * 0.07)),
  };
};

export default function KotaCorrection({ className }: { className?: string }) {
  const stage = useRef<HTMLQuoteElement>(null);
  const replay = useRef<() => void>(() => undefined);
  const [canReplay, setCanReplay] = useState(false);
  const id = `kota-edit-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const root = stage.current;
    if (!root) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let frame = 0;
    let entered = false;
    let played = false;
    let complete = false;
    let signature = "";
    let path: SVGPathElement | null = null;
    let timeline: gsap.core.Timeline | null = null;
    let entry: IntersectionObserver | undefined;

    const settle = () => {
      timeline?.kill();
      timeline = null;
      if (path) path.style.strokeDashoffset = "0";
      played = true;
      complete = true;
      entry?.disconnect();
    };

    const play = (progress = 0) => {
      if (!path || media.matches) {
        settle();
        return;
      }
      timeline?.kill();
      entry?.disconnect();
      played = true;
      complete = false;
      path.style.strokeDashoffset = "1";
      const mark = path.closest("svg");
      const chunks = JSON.parse(mark?.dataset.chunks ?? "[]") as { to: number }[];
      const strikeEnd = chunks[0]?.to ?? 0.25;
      const travelEnd = chunks[1]?.to ?? 0.8;
      const pen = gsap.timeline({
        paused: true,
        onComplete: () => {
          complete = true;
          timeline = null;
          if (path) path.style.strokeDashoffset = "0";
        },
      });
      timeline = pen;
      draw(pen, path, { from: 0, to: strikeEnd, duration: 0.38, ease: "power2.inOut", position: 0.08 });
      draw(pen, path, { from: strikeEnd, to: travelEnd, duration: 0.72, ease: "power1.inOut", position: ">0.12" });
      draw(pen, path, { from: travelEnd, to: 1, duration: 0.48, ease: "power2.out", position: ">" });
      pen.progress(progress).play();
    };

    // Ink remeasures after fonts and resize. Rebuild against its new path,
    // preserving an in-flight edit's progress instead of replaying it.
    const prepare = () => {
      frame = 0;
      if (disposed) return;
      const mark = root.querySelector<SVGSVGElement>('[data-mark="kota-correction"]');
      const next = mark?.querySelector<SVGPathElement>("[data-reveal]");
      if (!next?.getAttribute("d")) return;
      const tooTall = root.offsetHeight > window.innerHeight * 0.9;
      const nextSignature = `${next.getAttribute("d")}|${mark?.dataset.chunks}|${mark?.dataset.pace}`;
      if (nextSignature === signature) {
        if (tooTall && !complete) settle();
        return;
      }
      signature = nextSignature;
      const progress = timeline?.progress() ?? 1;
      const playing = timeline !== null && !complete;
      path = next;
      setCanReplay(!media.matches);
      if (media.matches || complete || tooTall) settle();
      else if (playing) play(progress);
      else {
        path.style.strokeDashoffset = "1";
        if (entered && !played) play();
      }
    };
    const schedule = () => {
      if (!disposed && !frame) frame = window.requestAnimationFrame(prepare);
    };
    const geometry = new MutationObserver(schedule);
    geometry.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ["d", "viewBox", "data-chunks", "data-pace"],
    });

    if (typeof IntersectionObserver !== "undefined") {
      entry = new IntersectionObserver(([item]) => {
        entered = item.isIntersecting && item.intersectionRatio >= 0.95;
        if (entered && path && !played) play();
      }, { rootMargin: "0px 0px -4% 0px", threshold: 0.95 });
      entry.observe(root);
    } else entered = true;

    const preference = () => {
      setCanReplay(Boolean(path) && !media.matches);
      if (media.matches) settle();
    };
    media.addEventListener("change", preference);
    window.addEventListener("resize", schedule, { passive: true });
    replay.current = () => {
      entry?.disconnect();
      entered = true;
      play();
    };
    prepare();

    return () => {
      disposed = true;
      replay.current = () => undefined;
      timeline?.kill();
      entry?.disconnect();
      geometry.disconnect();
      media.removeEventListener("change", preference);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <figure className={`${styles.figure} ${className ?? ""}`}>
      <figcaption id={`${id}-caption`} className={styles.caption}>
        An illustrated example from the KOTA write-up.
      </figcaption>
      <blockquote ref={stage} id={id} className={styles.stage} cite="/work/kota" aria-describedby={`${id}-caption`}>
        <p className={styles.utterance}>
          <span className={styles.spoken}>
            “<span data-anchor="correction-chicken">chicken</span> fried rice…
          </span>{" "}
          <span className={styles.hesitation}>no wait,</span>{" "}
          <span className={styles.replacement}>
            <span data-anchor="correction-shrimp">shrimp</span><span className={styles.closeQuote}>”</span>
          </span>
        </p>
        <Ink trace={correction} mark="kota-correction" profile={pressure} still seed={611} smoothing={1} spacing={1.6} thinning={0.65} lift={2} className={styles.gesture} />
      </blockquote>
      <div className={styles.controls}>
        <button type="button" className={styles.replay} hidden={!canReplay} aria-controls={id} onClick={() => replay.current()}>
          Replay edit
        </button>
      </div>
    </figure>
  );
}
