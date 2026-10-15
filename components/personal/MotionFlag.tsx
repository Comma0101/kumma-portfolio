"use client";

import { useLayoutEffect } from "react";

// Client navigations skip Front's inline script; set the same flag before
// paint so drawn marks still start undrawn.
export default function MotionFlag() {
  useLayoutEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.dataset.front = "motion";
    }
  }, []);
  return null;
}
