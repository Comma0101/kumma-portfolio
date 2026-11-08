"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { arcAt, timeAt } from "./ink";

gsap.registerPlugin(ScrollTrigger);

export type Build<T> = (root: T, tl: gsap.core.Timeline) => void | (() => void);

// The page's shared easings. A beat that acts a particular meaning (a
// snap, a pull, a footfall) names its own curve where it is written.
export const ease = {
  compound: "expo.in", // flat for a long time, then sudden
  impulse: "power4.out", // one hit, then still
  hand: "power1.inOut", // a pen at writing speed
} as const;

// The page settles after load (fonts, marks measuring themselves), and its
// height changes; every scroll position measured before that is stale.
// One observer re-measures all triggers whenever the page's height moves.
// Shared by every beat on the page; released when the last one unmounts.
let watchers = 0;
let stopWatching = () => {};
function keepMeasured() {
  if (typeof ResizeObserver === "undefined") return () => {};
  if (watchers++ === 0) {
    let timer = 0;
    let height = document.body.scrollHeight;
    const observer = new ResizeObserver(() => {
      if (document.body.scrollHeight === height) return;
      height = document.body.scrollHeight;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    observer.observe(document.body);
    stopWatching = () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }
  return () => {
    if (--watchers === 0) stopWatching();
  };
}

export function settleInk(root: HTMLElement) {
  root.querySelectorAll<SVGElement>("[data-reveal], [data-circle-reveal]").forEach((path) => {
    path.style.removeProperty("stroke-dashoffset");
  });
}

// A triggered beat plays once when its line reaches the lower third of the
// viewport, then holds. Reduced motion never builds it, so the page stays
// in its finished state.
export function useBeat<T extends HTMLElement>(
  ref: RefObject<T>,
  build: Build<T>,
  // How far above the viewport's bottom the beat waits (a chapter's
  // character is written as soon as its chapter shows).
  { line = "-28%" }: { line?: string } = {},
) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const media = gsap.matchMedia();
    let played = false;
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const release = keepMeasured();
      let observer: IntersectionObserver | undefined;
      const tl = gsap.timeline({ paused: true });
      const dispose = build(root, tl);
      if (played) {
        tl.progress(1);
      } else {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            played = true;
            tl.play();
            observer?.disconnect();
          },
          { rootMargin: `0px 0px ${line} 0px` },
        );
        observer.observe(root);
      }
      return () => {
        observer?.disconnect();
        if (dispose) dispose();
        settleInk(root);
        release();
      };
    }, root);
    return () => media.revert();
    // A beat is authored once; rebuilding would replay it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// A scrubbed beat: the reader's scroll is the hand. Once the reader is past
// it, it is finished, so a fast flick never leaves half a sentence.
export function useScrub<T extends HTMLElement>(
  ref: RefObject<T>,
  build: Build<T>,
  // scrub: how many seconds the motion trails the scroll.
  { start = "top 80%", end = "top 30%", scrub = 0.6 }: { start?: string; end?: string; scrub?: number } = {},
) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const release = keepMeasured();
      let active = true;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start,
          end,
          scrub,
          onLeave: (self) => self.animation?.progress(1),
        },
      });
      const dispose = build(root, tl);
      document.fonts?.ready.then(() => {
        if (active) ScrollTrigger.refresh();
      }).catch(() => undefined);
      return () => {
        active = false;
        if (dispose) dispose();
        settleInk(root);
        release();
      };
    }, root);
    return () => media.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function reveal(root: ParentNode, mark: string) {
  return root.querySelector(`[data-mark="${mark}"] [data-reveal]`);
}

export function split(root: ParentNode, mark: string) {
  const svg = root.querySelector<SVGElement>(`[data-mark="${mark}"]`);
  return Number(svg?.dataset.split ?? 1) || 1;
}

// Draw a mark from one fraction of its length to another (0 → 1 draws it,
// 1 → 2 lifts it from where it started). Values may be functions so they
// resolve after the mark has been measured. The tween runs in the hand's
// time, not the line's length: quick on straight runs, slower into turns
// (the stroke's pacing, from ink.ts).
export function draw(
  tl: gsap.core.Timeline,
  target: Element | null,
  {
    from = 0,
    to = 1,
    duration,
    ease: curve = ease.hand,
    position,
  }: {
    from?: number | (() => number);
    to?: number | (() => number);
    duration: number;
    ease?: string;
    position?: gsap.Position;
  },
) {
  if (!target) return tl;
  const path = target as SVGElement;
  const value = (v: number | (() => number)) => (typeof v === "function" ? v() : v);
  let pacing = [0, 1];
  const read = () => {
    const raw = path.closest("svg")?.getAttribute("data-pace");
    pacing = raw ? raw.split(",").map(Number) : [0, 1];
    return pacing;
  };
  // Whole part = which pass (0 drawing, 1 lifting); fraction = progress.
  const toTime = (v: number) => {
    const pass = Math.min(1, Math.floor(v));
    return pass + timeAt(pacing, v - pass);
  };
  const toArc = (u: number) => {
    if (u >= 2) return 2;
    const pass = Math.floor(u);
    return pass + arcAt(pacing, u - pass);
  };
  const state = { u: 0 };
  return tl.fromTo(
    state,
    { u: () => (read(), toTime(value(from))) },
    {
      u: () => (read(), toTime(value(to))),
      duration,
      ease: curve,
      immediateRender: false,
      onUpdate: () => {
        path.style.strokeDashoffset = String(1 - toArc(state.u));
      },
    },
    position,
  );
}
