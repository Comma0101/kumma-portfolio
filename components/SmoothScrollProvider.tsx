"use client";

import { useLayoutEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldInitializeSmoothScroll } from "./viz/reducedMotionState";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!shouldInitializeSmoothScroll(prefersReducedMotion)) return;

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Expose lenis globally for components to access
    (window as any).lenis = lenis;

    const scrollElement = document.documentElement;
    const scrollPositionRef = { current: scrollElement.scrollTop || 0 };

    // Wire Lenis to ScrollTrigger so refreshes occur with the virtual scroller
    ScrollTrigger.scrollerProxy(scrollElement, {
      scrollTop(value) {
        if (value !== undefined) {
          const numericValue = value as number;
          lenis.scrollTo(numericValue, { immediate: true });
          scrollPositionRef.current = numericValue;
          return;
        }
        return scrollPositionRef.current;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      fixedMarkers: true,
      pinType: document.body.style.transform ? "transform" : "fixed",
    });
    ScrollTrigger.defaults({ scroller: scrollElement });

    // Sync Lenis with GSAP ScrollTrigger
    const handleLenisScroll = ({ scroll }: { scroll: number }) => {
      scrollPositionRef.current = scroll;
      ScrollTrigger.update();
    };
    lenis.on("scroll", handleLenisScroll);

    // Add Lenis's requestAnimationFrame to GSAP's ticker
    const tickerProxy = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerProxy);

    gsap.ticker.lagSmoothing(0);

    // Sync Lenis target with restored scroll position before first refresh
    lenis.scrollTo(scrollPositionRef.current, { immediate: true });
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      lenis.destroy();
      lenis.off("scroll", handleLenisScroll);
      gsap.ticker.remove(tickerProxy);
      (window as any).lenis = null;
    };
  }, []);

  return <>{children}</>;
}
