"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./ReadingEmphasis.module.css";

export default function ReadingEmphasis({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const howBoxRef = useRef<HTMLSpanElement>(null);
  const whyBoxRef = useRef<HTMLSpanElement>(null);
  const howRef = useRef<HTMLSpanElement>(null);
  const whyRef = useRef<HTMLSpanElement>(null);
  const replayRef = useRef<(() => void) | null>(null);
  const [canReplay, setCanReplay] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const howBox = howBoxRef.current;
    const whyBox = whyBoxRef.current;
    const how = howRef.current;
    const why = whyRef.current;
    if (!root || !howBox || !whyBox || !how || !why) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canObserveSize = typeof ResizeObserver !== "undefined";
    const words = [
      { node: how, box: howBox, weights: [100, 150, 200], balanced: 150 },
      { node: why, box: whyBox, weights: [300, 500, 700], balanced: 500 },
    ];
    let active = true;
    let fontsReady = false;
    let measured = false;
    let entered = false;
    let played = media.matches;
    let frame = 0;
    let observedWidth = -1;
    let lastWidth = -1;
    let lastFontSize = "";
    let timeline: gsap.core.Timeline | undefined;
    let intersection: IntersectionObserver | undefined;
    let resize: ResizeObserver | undefined;

    const balance = () => {
      timeline?.kill();
      timeline = undefined;
      words.forEach(({ node, balanced }) => node.style.setProperty("--weight", String(balanced)));
    };

    const play = () => {
      if (!active || !measured || media.matches) return;
      balance();
      played = true;
      intersection?.disconnect();

      // One reading: attention rests on “how”, passes to “why”, and
      // returns to an optical balance between the two existing faces.
      timeline = gsap.timeline({ defaults: { ease: "power1.inOut" } });
      timeline
        .to(how, { "--weight": 200, duration: 1.05 }, 0)
        .to(why, { "--weight": 350, duration: 1.05 }, 0)
        .to(how, { "--weight": 100, duration: 1.2 }, 1.5)
        .to(why, { "--weight": 650, duration: 1.2 }, 1.5)
        .to(how, { "--weight": 150, duration: 1 }, 3.05)
        .to(why, { "--weight": 500, duration: 1 }, 3.05);
    };

    const playOnArrival = () => {
      if (!measured || played) return;
      // A short viewport keeps the complete reading still. Its native
      // replay remains available without consuming an offscreen sequence.
      if (root.offsetHeight > window.innerHeight * 0.9) {
        played = true;
        intersection?.disconnect();
        return;
      }
      if (entered && !played) play();
    };

    const measure = () => {
      frame = 0;
      if (!active || !fontsReady || (canObserveSize && observedWidth < 0)) return;
      const width = canObserveSize ? observedWidth : window.innerWidth;
      const fontSize = `${getComputedStyle(how).fontSize}/${getComputedStyle(why).fontSize}`;
      if (measured && Math.abs(width - lastWidth) < 0.5 && fontSize === lastFontSize) {
        playOnArrival();
        return;
      }

      balance();
      // Six width reads, only after fonts settle or the available width /
      // font size changes. The single real word nodes do the measuring;
      // their fixed outer boxes keep the sentence still during playback.
      const widths = words.map(({ node, weights }) => {
        let maximum = 0;
        weights.forEach((weight) => {
          node.style.setProperty("--weight", String(weight));
          maximum = Math.max(maximum, node.getBoundingClientRect().width);
        });
        return Math.ceil(maximum);
      });
      const columnWidth = Math.max(...widths);
      words.forEach(({ node, box, balanced }) => {
        node.style.setProperty("--weight", String(balanced));
        box.style.setProperty("--word-width", `${columnWidth}px`);
      });
      lastWidth = width;
      lastFontSize = fontSize;
      measured = true;
      setCanReplay(!media.matches);
      playOnArrival();
    };

    const scheduleMeasure = () => {
      if (active && fontsReady && !frame) frame = window.requestAnimationFrame(measure);
    };

    const onFontsReady = () => {
      if (!active) return;
      fontsReady = true;
      scheduleMeasure();
    };

    const onPreference = () => {
      if (!active) return;
      balance();
      // Changing the preference settles the reading. Enabling motion
      // again offers replay rather than unexpectedly starting a new take.
      played = true;
      setCanReplay(measured && !media.matches);
    };

    replayRef.current = play;
    media.addEventListener("change", onPreference);
    window.addEventListener("resize", scheduleMeasure, { passive: true });

    if (canObserveSize) {
      resize = new ResizeObserver(([entry]) => {
        if (!active || !entry) return;
        observedWidth = entry.contentRect.width;
        scheduleMeasure();
      });
      resize.observe(root);
    }

    if (typeof IntersectionObserver !== "undefined") {
      intersection = new IntersectionObserver(
        ([entry]) => {
          if (!active || !entry) return;
          entered = entry.isIntersecting && entry.intersectionRatio >= 0.8;
          playOnArrival();
        },
        { threshold: 0.8 },
      );
      intersection.observe(root);
    } else {
      entered = true;
    }

    if (document.fonts) document.fonts.ready.then(onFontsReady, onFontsReady);
    else onFontsReady();

    return () => {
      active = false;
      timeline?.kill();
      if (frame) window.cancelAnimationFrame(frame);
      intersection?.disconnect();
      resize?.disconnect();
      media.removeEventListener("change", onPreference);
      window.removeEventListener("resize", scheduleMeasure);
      replayRef.current = null;
      words.forEach(({ node, box }) => {
        node.style.removeProperty("--weight");
        box.style.removeProperty("--word-width");
      });
    };
  }, []);

  return (
    <div ref={rootRef} className={`${styles.emphasis} ${className ?? ""}`}>
      <blockquote className={styles.quote} cite="/notes/on-emotions">
        <p>
          <span className={styles.clause}>
            <span className={styles.context}>Reason tells us</span>{" "}
            <span className={styles.line}>
              <span ref={howBoxRef} className={styles.wordBox}>
                <span ref={howRef} className={`${styles.word} ${styles.how}`}>how</span>
              </span>{" "}
              <span className={styles.destination}>to walk,</span>
            </span>
          </span>{" "}
          <span className={styles.clause}>
            <span className={styles.context}>emotion reminds us</span>{" "}
            <span className={styles.line}>
              <span ref={whyBoxRef} className={styles.wordBox}>
                <span ref={whyRef} className={`${styles.word} ${styles.why}`}>why</span>
              </span>{" "}
              <span className={styles.destination}>we walk.</span>
            </span>
          </span>
        </p>
      </blockquote>
      <button type="button" className={styles.replay} hidden={!canReplay} onClick={() => replayRef.current?.()}>
        Replay emphasis
      </button>
    </div>
  );
}
