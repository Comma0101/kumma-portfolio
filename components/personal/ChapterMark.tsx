"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import { centerline, pace, resample } from "./ink";
import type { Point } from "./pen";
import { chapterStrokes } from "./chapterStrokes";
import { chapterOf } from "./chapters";
import { draw, settleInk, useBeat } from "./useBeat";
import styles from "./Front.module.css";

const length = (line: Point[]) => line.slice(1).reduce((sum, p, k) => sum + Math.hypot(p[0] - line[k][0], p[1] - line[k][1]), 0);

// Each chapter's character, written by the same pen as it arrives — small,
// quick, in stroke order, never erased — so the reader watches the page's
// eight characters accumulate down the margin and 道 arrives as the last.
const prepared = Object.fromEntries(
  Object.entries(chapterStrokes).map(([char, { outlines, medians }]) => [
    char,
    outlines.map((outline, i) => {
      const line = resample(medians[i], 8);
      return {
        outline,
        median: centerline(line),
        pace: pace(line, 32, [{ from: 0, to: 0.1, slow: 2 }]).join(","),
        // A hand writing small and sure: about half a second a character.
        duration: 0.035 + length(line) * 0.00009,
      };
    }),
  ]),
);

function write(root: HTMLElement, tl: gsap.core.Timeline) {
  root.querySelectorAll("[data-reveal]").forEach((stroke, index) => {
    draw(tl, stroke, { duration: Number((stroke.closest("svg") as SVGElement).dataset.duration), ease: "none", position: index === 0 ? 0.1 : ">0.03" });
  });
  // The personal reflection follows the written chapter mark.
  const reflection = root.querySelector("[data-reflection]");
  if (reflection) tl.to(reflection, { opacity: 1, duration: 0.9, ease: "power1.out" }, ">0.25");
}

// when: "beat" writes it as its chapter reaches the reading line; "lifted"
// waits for the name's underline to pull taut (the first chapter).
export default function ChapterMark({ char, label, when = "beat" }: { char: string; label: string; when?: "beat" | "lifted" }) {
  const ref = useRef<HTMLSpanElement>(null);
  const id = `chapter-${useId().replace(/:/g, "")}`;
  const strokes = prepared[char] ?? [];
  const chapter = chapterOf(char);

  // Written as the chapter comes into view, before its own beat plays.
  useBeat(
    ref,
    (root, tl) => {
      if (when === "beat") write(root, tl);
    },
    { line: "-6%" },
  );

  useEffect(() => {
    const root = ref.current;
    if (when !== "lifted" || !root) return;
    const media = gsap.matchMedia();
    let played = false;
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ paused: true });
      write(root, tl);
      const play = () => {
        played = true;
        tl.play();
      };
      if (played) tl.progress(1);
      else window.addEventListener("kumma:lifted", play, { once: true });
      const fallback = played ? 0 : window.setTimeout(play, 3600);
      return () => {
        window.removeEventListener("kumma:lifted", play);
        window.clearTimeout(fallback);
        settleInk(root);
      };
    }, root);
    return () => media.revert();
  }, [when]);

  return (
    <span ref={ref} className={styles.chapterMark}>
      <span className={styles.chapterGlyph} lang="zh-Hant" aria-hidden="true">
        {strokes.map((stroke, index) => (
          <svg
            key={index}
            className={`${styles.ink} ${styles.chapterStroke}`}
            viewBox="0 0 1024 1024"
            focusable="false"
            data-pace={stroke.pace}
            data-duration={stroke.duration.toFixed(3)}
          >
            <defs>
              <mask id={`${id}-${index}`} maskUnits="userSpaceOnUse" x="-200" y="-200" width="1424" height="1424">
                <path
                  d={stroke.median}
                  pathLength={1}
                  data-reveal
                  fill="none"
                  stroke="#fff"
                  strokeWidth={150}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </mask>
            </defs>
            <g transform="translate(0 900) scale(1 -1)">
              <path d={stroke.outline} mask={`url(#${id}-${index})`} />
            </g>
          </svg>
        ))}
      </span>
      <span className={styles.chapterText}>
        <span className={styles.chapterLabel}>
          <span className="sr-only">{char} · </span>
          {label}
        </span>
        {chapter && (
          <span className={styles.chapterReflection} data-reflection>
            {chapter.reflection}
          </span>
        )}
      </span>
    </span>
  );
}
