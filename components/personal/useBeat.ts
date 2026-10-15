"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

export type Build<T> = (root: T, tl: gsap.core.Timeline) => void;

// One beat = one timeline that plays once, when its line reaches the lower
// third of the viewport. Reduced motion never builds the timeline, so the
// page stays in its finished, annotated state.
export function useBeat<T extends HTMLElement>(ref: RefObject<T>, build: Build<T>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let observer: IntersectionObserver | undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      build(root, tl);
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          tl.play();
          observer?.disconnect();
        },
        { rootMargin: "0px 0px -28% 0px" },
      );
      observer.observe(root);
    }, root);

    return () => {
      observer?.disconnect();
      ctx.revert();
    };
    // The beat is authored once; rebuilding would replay it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// Pen strokes use pathLength="1", so offset 1 is undrawn and 0 is drawn.
export function draw(
  tl: gsap.core.Timeline,
  target: Element | null,
  duration: number,
  position?: gsap.Position,
) {
  if (!target) return tl;
  return tl.fromTo(
    target,
    { strokeDashoffset: 1 },
    { strokeDashoffset: 0, duration, ease: "power1.inOut" },
    position,
  );
}

// Lift the pen: the stroke disappears from where it started.
export function lift(
  tl: gsap.core.Timeline,
  target: Element | null,
  duration: number,
  position?: gsap.Position,
) {
  if (!target) return tl;
  return tl.to(target, { strokeDashoffset: -1, duration, ease: "power2.in" }, position);
}

export function count(
  tl: gsap.core.Timeline,
  target: Element | null,
  duration: number,
  position?: gsap.Position,
) {
  if (!target) return tl;
  const value = Number(target.getAttribute("data-count")) || 0;
  const state = { value: 0 };
  target.textContent = "0";
  return tl.to(
    state,
    {
      value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        target.textContent = String(Math.round(state.value));
      },
    },
    position,
  );
}
