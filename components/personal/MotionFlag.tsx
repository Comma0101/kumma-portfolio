"use client";

import { useLayoutEffect } from "react";

// Client navigations skip Front's inline script; set the same flag before
// paint so drawn marks still start undrawn.
export default function MotionFlag() {
  useLayoutEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (preference.matches) delete document.documentElement.dataset.front;
      else document.documentElement.dataset.front = "motion";
    };
    update();
    preference.addEventListener("change", update);
    return () => {
      preference.removeEventListener("change", update);
      delete document.documentElement.dataset.front;
    };
  }, []);
  return null;
}
