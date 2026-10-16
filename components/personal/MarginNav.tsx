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
  { mark: "無", label: "Wu", target: "#wu" },
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
    // line is finished), the nav rests on the margin at the reading line.
    // The resting tick belongs on the margin line, so it may only rest
    // where the reading line crosses the margin's drawn stretch (from
    // Understanding down to the reason) — never on the hero or on paper
    // after the line has ended.
    const span = () => {
      const from = front.querySelector('[data-thread="catch"]');
      const to = front.querySelector('[data-thread="reason"]');
      if (!from || !to) return null;
      const origin = front.getBoundingClientRect().top;
      return [from.getBoundingClientRect().top - origin, to.getBoundingClientRect().top - origin];
    };
    const check = () => {
      frame = 0;
      const origin = front.getBoundingClientRect().top;
      const reading = window.innerHeight * 0.72 - origin;
      const stretch = span();
      setOnLine(!!stretch && reading > stretch[0] && reading < stretch[1]);
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
      style={riding && tip ? { left: tip.x, top: tip.y } : undefined}
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
