"use client";

import { useRef } from "react";
import { bisect, between } from "./registration";
import { useScrub } from "./useBeat";
import ChapterMark from "./ChapterMark";
import ThenNow from "./ThenNow";
import styles from "./Front.module.css";

const lines = ["The body", "catches up."];

// The sentence is understood before it is lived: its outline is already
// there; the ink grows into it as the reader keeps going.
export default function CatchUp() {
  const ref = useRef<HTMLElement>(null);
  useScrub(
    ref,
    (root, tl) => {
      const fill = root.querySelector<HTMLElement>("[data-body]");
      const outline = fill?.previousElementSibling;
      if (!fill || !outline) return;
      const lineNodes = Array.from(fill.children) as HTMLElement[];
      const targets = Array.from(outline.children);
      const originalStyles = lineNodes.map((line) => ({
        weight: line.style.fontWeight,
        variation: line.style.fontVariationSettings,
      }));
      const width = (el: Element) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().width;
      };
      const weights = [10, 55, 100, 150];
      const tables: Array<Array<[number, number]>> = lineNodes.map(() => []);
      let targetWidths: number[] = [];
      const state = { weight: 10 };
      let disposed = false;
      let frame = 0;
      let pendingCalibration = 0;
      let forceCalibration = false;
      const useIdle = typeof window.requestIdleCallback === "function"
        && typeof window.cancelIdleCallback === "function";

      // Calibration temporarily changes the live letters to measure them.
      // Restore their current appearance within the same task.
      const solveAt = (weight: number) => {
        lineNodes.forEach((line, i) => {
          if (tables[i].some(([w]) => w === weight)) return;
          const previousWeight = line.style.fontWeight;
          const previousVariation = line.style.fontVariationSettings;
          line.style.fontWeight = String(weight);
          const axis = bisect(
            (wdth) => {
              line.style.fontVariationSettings = `"wdth" ${wdth}`;
              return width(line);
            },
            targetWidths[i],
            100,
            200,
          );
          tables[i].push([weight, axis]);
          tables[i].sort((a, b) => a[0] - b[0]);
          line.style.fontWeight = previousWeight;
          line.style.fontVariationSettings = previousVariation;
        });
      };
      const apply = () => {
        lineNodes.forEach((line, i) => {
          line.style.fontWeight = String(state.weight);
          const axis = tables[i].length ? between(tables[i], state.weight) : 190;
          line.style.fontVariationSettings = `"wdth" ${axis.toFixed(2)}`;
        });
      };

      const cancelCalibration = () => {
        if (useIdle) window.cancelIdleCallback(pendingCalibration);
        else window.clearTimeout(pendingCalibration);
        pendingCalibration = 0;
      };
      const calibrateNext = (remaining: number[]) => {
        if (!remaining.length || disposed) return;
        const run = () => {
          pendingCalibration = 0;
          if (disposed) return;
          solveAt(remaining[0]);
          apply();
          calibrateNext(remaining.slice(1));
        };
        pendingCalibration = useIdle
          ? window.requestIdleCallback(run)
          : window.setTimeout(run, 32);
      };
      const rebuild = () => {
        frame = 0;
        if (disposed) return;
        const measured = targets.map(width);
        const changed = measured.some((value, i) => Math.abs(value - (targetWidths[i] ?? 0)) > 0.5);
        if (!changed && !forceCalibration) return;
        forceCalibration = false;
        cancelCalibration();
        targetWidths = measured;
        tables.forEach((table) => { table.length = 0; });
        solveAt(state.weight);
        apply();
        calibrateNext(weights.filter((weight) => weight !== state.weight));
      };
      const scheduleCalibration = (force = false) => {
        if (disposed) return;
        forceCalibration ||= force;
        if (!frame) frame = window.requestAnimationFrame(rebuild);
      };
      const observer = new ResizeObserver(() => scheduleCalibration());
      observer.observe(outline);
      const fontsChanged = () => scheduleCalibration(true);
      document.fonts?.addEventListener("loadingdone", fontsChanged);
      document.fonts?.ready.then(fontsChanged, fontsChanged);

      // Compounding, but readable within one scroll: slow, then sure.
      tl.fromTo(
        state,
        { weight: 10 },
        { weight: 150, ease: "power3.in", immediateRender: false, onUpdate: apply },
      );
      // What was understood gives way as it is lived: the outline fades
      // while the ink arrives, so the two are never seen out of register.
      tl.fromTo(outline, { opacity: 1 }, { opacity: 0.18, ease: "power2.out", immediateRender: false }, 0);

      return () => {
        disposed = true;
        observer.disconnect();
        window.cancelAnimationFrame(frame);
        cancelCalibration();
        document.fonts?.removeEventListener("loadingdone", fontsChanged);
        lineNodes.forEach((line, i) => {
          line.style.fontWeight = originalStyles[i].weight;
          line.style.fontVariationSettings = originalStyles[i].variation;
        });
      };
    },
    // The body is slower than the mind: the ink keeps filling for a moment
    // after the reader stops.
    { start: "top 70%", end: "center 35%", scrub: 1.4 },
  );

  return (
    <section ref={ref} className={styles.catchUp} aria-labelledby="catch-up" data-thread="catch">
      <p className={styles.label}>
        <ChapterMark char="知" label="Understanding" />
      </p>
      <p className={styles.first}>Understanding arrives first.</p>
      <h2 id="catch-up" className={styles.catchLine}>
        <span className={styles.outline} aria-hidden="true">
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
        <span className={styles.bodyFill} data-body>
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
      </h2>
      <ThenNow
        then="I can understand an idea and still meet the same situation with an old response."
        now="I return to that gap through practice: noticing what I do, trying again, and letting experience revise what I thought I knew."
      />
    </section>
  );
}
