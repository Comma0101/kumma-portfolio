"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldInitializeSmoothScroll } from "./viz/reducedMotionState";
import { isPaperRoute } from "./personal/routes";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (isPaperRoute(pathname)) return;
    if (!shouldInitializeSmoothScroll(prefersReducedMotion)) return;

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 0.45,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 2,
      infinite: false,
    });

    // Expose lenis globally for components to access
    (window as any).lenis = lenis;

    const scrollElement = document.documentElement;
    // Lenis scrolls the document itself. ScrollTrigger reads that native
    // position, so route changes leave no proxy bound to a destroyed instance.
    const handleLenisScroll = () => {
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
    lenis.scrollTo(scrollElement.scrollTop || 0, { immediate: true });
    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshFrame);
      lenis.destroy();
      lenis.off("scroll", handleLenisScroll);
      gsap.ticker.remove(tickerProxy);
      (window as any).lenis = null;
    };
  }, [pathname]);

  return <>{children}</>;
}
