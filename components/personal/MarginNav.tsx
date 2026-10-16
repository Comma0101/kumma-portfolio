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
  const [still, setStill] = useState(false);
  const tipRef = useRef<Tip | null>(null);

  useEffect(() => {
    const front = ref.current?.parentElement;
    if (!front) return;
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let frame = 0;
    // Is the pen tip on screen? If not (the reader went back up, or the
    // line is finished), the nav rests on the margin at the reading line.
    const check = () => {
      frame = 0;
      const t = tipRef.current;
      if (!t) return;
      const top = front.getBoundingClientRect().top + t.y;
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

  // Rides the tip while it is on screen and on the margin; steps aside
  // while the pen is out on the page; otherwise (before the pen moves,
  // with reduced motion, or once the line is behind the reader) it rests
  // on the margin at the reading line.
  const riding = tip !== null && inView && tip.onMargin;
  const waiting = tip === null && !still; // the pen has not set down yet
  const hidden = !open && (waiting || (tip !== null && inView && !tip.onMargin));

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
