"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { resolveHydratedReducedMotion } from "./reducedMotionState";

export function useHydratedReducedMotion() {
  const prefersReducedMotion = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return resolveHydratedReducedMotion({ hydrated, prefersReducedMotion });
}
