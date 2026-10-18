"use client";

import { useEffect, useRef } from "react";
import { portrait } from "./portrait";
import { decodeTones, spiralPath, timeline } from "./spiral";
import styles from "./Front.module.css";

const RED = "#a3121b";
const DURATION = 2800;

// His face as one red line: the margin's pen sets down on the outer ring
// once the name's underline is taut, and spirals in — quick across the
// light, slow through the face, so it develops like a print — ending on a
// point at the centre.
export default function Portrait() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const points = spiralPath(portrait);
    const tones = decodeTones(portrait.tones, portrait.count);
    // The pen draws from the rim inward: reverse the walk.
    points.reverse();
    tones.reverse();
    const times = timeline(tones);
    const pitch = portrait.radius / portrait.turns;

    let size = 0;
    let scale = 1;
    let drawn = 0; // samples drawn so far
    const fit = () => {
      const ratio = window.devicePixelRatio || 1;
      size = canvas.getBoundingClientRect().width;
      canvas.width = Math.round(size * ratio);
      canvas.height = Math.round(size * ratio);
      // The offset is in device pixels: the centre of the canvas.
      context.setTransform(ratio, 0, 0, ratio, (size * ratio) / 2, (size * ratio) / 2);
      scale = size / (portrait.radius * 2.04);
      context.strokeStyle = RED;
      context.fillStyle = RED;
      context.lineCap = "butt";
    };
    // Thickness is the tone: a hairline in the light, almost meeting the
    // next ring in the dark.
    const segment = (i: number) => {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      context.lineWidth = (0.35 + (0.92 * pitch - 0.35) * tones[i]) * scale;
      context.beginPath();
      context.moveTo(x0 * scale, y0 * scale);
      context.lineTo(x1 * scale, y1 * scale);
      context.stroke();
    };
    const drawTo = (count: number) => {
      for (let i = drawn; i < Math.min(count, points.length - 1); i += 1) segment(i);
      drawn = Math.max(drawn, count);
      if (drawn >= points.length - 1) {
        context.beginPath();
        context.arc(0, 0, 1.8 * scale, 0, Math.PI * 2);
        context.fill();
      }
    };
    const redraw = () => {
      const target = drawn;
      fit();
      drawn = 0;
      drawTo(target);
    };
    fit();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      drawTo(points.length);
    }

    let frame = 0;
    let started = 0;
    const tick = (now: number) => {
      if (!started) started = now;
      const t = Math.min(1, (now - started) / DURATION);
      // The sample the pen has reached at time t.
      let lo = 0;
      let hi = times.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (times[mid] < t) lo = mid + 1;
        else hi = mid;
      }
      drawTo(lo);
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    let delay = 0;
    const begin = () => {
      if (drawn || frame || delay) return;
      delay = window.setTimeout(() => {
        frame = window.requestAnimationFrame(tick);
      }, 300);
    };
    // After the name's underline pulls taut (Opening), or soon regardless.
    window.addEventListener("kumma:lifted", begin, { once: true });
    const fallback = window.setTimeout(begin, 3600);
    const observer = new ResizeObserver(() => {
      if (Math.abs(canvas.getBoundingClientRect().width - size) > 1) redraw();
    });
    observer.observe(canvas);

    return () => {
      window.removeEventListener("kumma:lifted", begin);
      window.clearTimeout(fallback);
      window.clearTimeout(delay);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <figure className={styles.portrait}>
      <canvas ref={ref} role="img" aria-label="Kumma Wu, drawn as one red spiral line" />
    </figure>
  );
}
