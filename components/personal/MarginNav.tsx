"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Front.module.css";

// The page's navigation is the pen itself: it rides the live tip of the
// thread (Thread dispatches "kumma:tip"), and steps aside when the line
// leaves the margin. Opened, it writes the sections on the paper beside
// the margin, one character each — no box over the page.
const sections = [
  { mark: "名", label: "Name", target: '[data-thread="opening"]' },
  { mark: "知", label: "Understanding", target: '[data-thread="catch"]' },
  { mark: "步", label: "Steps", target: '[data-thread="steps"]' },
  { mark: "習", label: "Practice", target: '[data-thread="practice"]' },
  { mark: "律", label: "Rules", target: '[data-thread="rules"]' },
  { mark: "理", label: "Reason", target: '[data-thread="reason"]' },
  { mark: "道", label: "The way", target: "#dao" },
];

type Smooth = { lenis?: { scrollTo: (target: Element, options?: object) => void } };
type Tip = { x: number; y: number; onMargin: boolean };

export default function MarginNav() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  const [inView, setInView] = useState(true);
  const [onLine, setOnLine] = useState(false);
  const tipRef = useRef<Tip | null>(null);

  useEffect(() => {
    const front = ref.current?.parentElement;
    if (!front) return;
    let frame = 0;
    // Is the pen tip on screen? If not (the reader went back up, or the
    // line is finished), the nav rests on the margin at the reading line —
    // but only where the line itself runs down the margin (Thread publishes
    // those stretches), never on the hero, a detour, or paper past the end.
    const check = () => {
      frame = 0;
      const origin = front.getBoundingClientRect().top;
      const reading = window.innerHeight * 0.72 - origin;
      const spans = front.querySelector<HTMLElement>("[data-margin]")?.dataset.margin ?? "";
      setOnLine(
        spans.split(" ").some((span) => {
          const [a, b] = span.split(",").map(Number);
          return reading > a + 24 && reading < b - 24;
        }),
      );
      const t = tipRef.current;
      if (!t) return;
      const top = origin + t.y;
      setInView(top > 0 && top < window.innerHeight);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };
    const onTip = (event: Event) => {
      tipRef.current = (event as CustomEvent<Tip>).detail;
      setTip(tipRef.current);
      schedule();
    };
    front.addEventListener("kumma:tip", onTip);
    window.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      front.removeEventListener("kumma:tip", onTip);
      window.removeEventListener("scroll", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const go = (target: string) => {
    const el = document.querySelector(target);
    if (!el) return;
    const smooth = window as Window & Smooth;
    if (smooth.lenis) smooth.lenis.scrollTo(el, { offset: -24 });
    else el.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  // Rides the tip while it is on screen and on the margin; otherwise rests
  // on the margin line at the reading line, where there is a line to rest on.
  const riding = tip !== null && inView && tip.onMargin;
  // Out on the page with the pen, or with no line to rest on: step aside.
  const hidden = !open && !riding && (!onLine || (tip !== null && inView && !tip.onMargin));

  return (
    <nav
      ref={ref}
      className={styles.marginNav}
      aria-label="Sections"
      data-open={open ? "" : undefined}
      data-riding={riding ? "" : undefined}
      data-hidden={hidden ? "" : undefined}
      data-resting={!riding && !hidden && !open ? "" : undefined}
      // Moved by transform, never left/top: following the pen every frame
      // must not re-lay out the page.
      style={riding && tip ? { left: 0, top: 0, transform: `translate3d(${tip.x}px, ${tip.y}px, 0)` } : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={styles.penTip}
        aria-expanded={open}
        aria-label="Sections"
        title="Sections"
        onClick={() => setOpen((value) => !value)}
      />
      <ol>
        {sections.map((section) => (
          <li key={section.mark}>
            <button
              type="button"
              onClick={() => go(section.target)}
              tabIndex={open ? 0 : -1}
              aria-label={section.label}
              title={section.label}
            >
              <span lang="zh-Hant">{section.mark}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
