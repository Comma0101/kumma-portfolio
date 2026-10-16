"use client";

import { useState } from "react";
import styles from "./Front.module.css";

// The page's navigation is the pen itself: a red tick at the tip of the
// line, on the margin, at the height where the reader is drawing it.
// Opened, it names the sections in one character each.
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

export default function MarginNav() {
  const [open, setOpen] = useState(false);

  const go = (target: string) => {
    const el = document.querySelector(target);
    if (!el) return;
    const smooth = window as Window & Smooth;
    if (smooth.lenis) smooth.lenis.scrollTo(el, { offset: -24 });
    else el.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav
      className={styles.marginNav}
      aria-label="Sections"
      data-open={open ? "" : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={styles.penTip}
        aria-expanded={open}
        aria-label="Sections"
        onClick={() => setOpen((value) => !value)}
      />
      <ol>
        {sections.map((section) => (
          <li key={section.mark}>
            <button type="button" onClick={() => go(section.target)} tabIndex={open ? 0 : -1}>
              <span lang="zh-Hant">{section.mark}</span>
              <span>{section.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
