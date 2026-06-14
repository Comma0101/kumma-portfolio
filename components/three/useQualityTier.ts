"use client";
import { useEffect, useState } from "react";

export type Tier = "high" | "low" | "off";

export interface TierInputs {
  reducedMotion: boolean;
  hasWebGL: boolean;
  deviceMemory?: number; // navigator.deviceMemory (GB), may be undefined
  cores?: number; // navigator.hardwareConcurrency
  coarsePointer: boolean; // touch / mobile
}

export function resolveTier(i: TierInputs): Tier {
  if (i.reducedMotion || !i.hasWebGL) return "off";
  const lowMem = (i.deviceMemory ?? 8) <= 4;
  const lowCores = (i.cores ?? 8) <= 4;
  if (i.coarsePointer || lowMem || lowCores) return "low";
  return "high";
}

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      c.getContext("webgl") || c.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

export function useQualityTier(): Tier {
  const [tier, setTier] = useState<Tier>("off"); // SSR-safe default = static
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    setTier(
      resolveTier({
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches,
        hasWebGL: detectWebGL(),
        deviceMemory: nav.deviceMemory,
        cores: navigator.hardwareConcurrency,
        coarsePointer: window.matchMedia("(pointer: coarse)").matches,
      }),
    );
  }, []);
  return tier;
}
