"use client";

import { useEffect, useRef } from "react";
import {
  getImmersiveProfile,
  sampleImmersiveJourney,
} from "./immersiveStages";
import {
  resolveJourneyState,
  type ImmersiveAnchorRect,
  type JourneyPhase,
} from "./scrollProgress";
import type {
  ImmersiveProfile,
  ImmersiveSceneSample,
  ImmersiveStageId,
} from "./types";

interface LenisLike {
  readonly scroll: number;
  on: (
    event: "scroll",
    callback: (payload: { readonly scroll?: number }) => void,
  ) => void;
  off: (
    event: "scroll",
    callback: (payload: { readonly scroll?: number }) => void,
  ) => void;
}

interface ImmersiveWindow extends Window {
  readonly lenis?: LenisLike;
}

export interface ImmersiveScrollSnapshot {
  readonly sample: ImmersiveSceneSample;
  readonly profile: ImmersiveProfile;
  readonly journeyProgress: number;
  readonly activeStageId: ImmersiveStageId;
  readonly phase: JourneyPhase;
  readonly inJourney: boolean;
  readonly anchorsValid: boolean;
}

export type ImmersiveScrollListener = (
  snapshot: ImmersiveScrollSnapshot,
) => void;

export function useImmersiveScroll(onSample: ImmersiveScrollListener): void {
  const onSampleRef = useRef(onSample);
  onSampleRef.current = onSample;

  useEffect(() => {
    let anchorElements: HTMLElement[] | null = null;
    let cachedAnchors: readonly ImmersiveAnchorRect[] = [];
    let rectsDirty = true;
    let anchorsObserved = false;
    let animationFrame = 0;
    let pendingScrollY: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    const reducedMotionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const runFrame = () => {
      animationFrame = 0;

      try {
        const scrollY = pendingScrollY ?? window.scrollY;
        pendingScrollY = null;

        if (rectsDirty) {
          if (!anchorElements) {
            anchorElements = Array.from(
              document.querySelectorAll<HTMLElement>(
                "[data-immersive-anchor]",
              ),
            );
          }

          cachedAnchors = anchorElements.map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              id: element.dataset.immersiveAnchor ?? "",
              top: rect.top + scrollY,
              height: rect.height,
            };
          });
          rectsDirty = false;

          if (resizeObserver && !anchorsObserved) {
            anchorElements.forEach((element) => resizeObserver?.observe(element));
            anchorsObserved = true;
          }
        }

        const resolution = resolveJourneyState(
          cachedAnchors,
          scrollY,
          window.innerHeight,
        );
        const profile = getImmersiveProfile({
          reducedMotion: reducedMotionQuery?.matches ?? false,
          width: window.innerWidth,
        });
        const sample = sampleImmersiveJourney(
          resolution.journeyProgress,
          profile,
        );
        const snapshot: ImmersiveScrollSnapshot = Object.freeze({
          sample,
          profile,
          journeyProgress: resolution.journeyProgress,
          activeStageId: resolution.activeStageId,
          phase: resolution.phase,
          inJourney: resolution.inJourney,
          anchorsValid: resolution.valid,
        });

        onSampleRef.current(snapshot);
      } catch {
        // The semantic page remains fully usable if scene sampling is unavailable.
      }
    };

    const scheduleFrame = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(runFrame);
      }
    };

    const handleLenisScroll = (payload: { readonly scroll?: number }) => {
      pendingScrollY = payload.scroll ?? null;
      scheduleFrame();
    };
    const handleNativeScroll = () => {
      scheduleFrame();
    };
    const handleResize = () => {
      rectsDirty = true;
      scheduleFrame();
    };
    const handleMotionChange = () => {
      scheduleFrame();
    };

    if (typeof ResizeObserver === "function") {
      try {
        resizeObserver = new ResizeObserver(() => {
          rectsDirty = true;
          scheduleFrame();
        });
      } catch {
        resizeObserver = null;
      }
    }

    const lenis = (window as ImmersiveWindow).lenis;
    if (lenis) {
      lenis.on("scroll", handleLenisScroll);
    } else {
      window.addEventListener("scroll", handleNativeScroll, { passive: true });
    }
    window.addEventListener("resize", handleResize, { passive: true });

    if (reducedMotionQuery) {
      if (typeof reducedMotionQuery.addEventListener === "function") {
        reducedMotionQuery.addEventListener("change", handleMotionChange);
      } else {
        reducedMotionQuery.addListener?.(handleMotionChange);
      }
    }

    scheduleFrame();

    return () => {
      if (lenis) {
        lenis.off("scroll", handleLenisScroll);
      } else {
        window.removeEventListener("scroll", handleNativeScroll);
      }
      window.removeEventListener("resize", handleResize);

      if (reducedMotionQuery) {
        if (typeof reducedMotionQuery.removeEventListener === "function") {
          reducedMotionQuery.removeEventListener("change", handleMotionChange);
        } else {
          reducedMotionQuery.removeListener?.(handleMotionChange);
        }
      }

      resizeObserver?.disconnect();
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);
}
