"use client";

import React, { createContext, useContext, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { PAGE_TRANSITION_SECONDS } from "./navigationBehavior";
import { isPaperRoute } from "./personal/routes";

const PageTransitionContext = createContext({
  animatePageOut: (href: string) => {},
});

export const PageTransitionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousPathname = useRef(pathname);

  const animatePageOut = (href: string) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }

    const overlay = overlayRef.current;
    if (overlay) {
      gsap.to(overlay, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: PAGE_TRANSITION_SECONDS,
        ease: "power3.inOut",
        onComplete: () => {
          if (pathname === href) {
            gsap.to(overlay, {
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
              duration: PAGE_TRANSITION_SECONDS,
              ease: "power3.inOut",
            });
          } else {
            router.push(href);
          }
        },
      });
    } else {
      router.push(href);
    }
  };

  useGSAP(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      window.requestAnimationFrame(() => {
        document
          .getElementById("main-content")
          ?.focus({ preventScroll: true });
      });
    }

    // Between paper pages the old dark wipe never runs: the new page is
    // revealed by a sheet of paper lifting off it, its edge a red line.
    const sheet = sheetRef.current;
    if (isPaperRoute(pathname)) {
      if (overlayRef.current) {
        gsap.killTweensOf(overlayRef.current);
        gsap.set(overlayRef.current, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" });
      }
      const first = sheet?.dataset.ready !== "1";
      if (sheet) sheet.dataset.ready = "1";
      if (!sheet || first || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        sheet,
        { yPercent: 0, visibility: "visible" },
        {
          yPercent: -101,
          duration: 0.55,
          ease: "power3.inOut",
          onComplete: () => {
            gsap.set(sheet, { visibility: "hidden" });
          },
        },
      );
      return;
    }

    const overlay = overlayRef.current;
    if (overlay) {
      if (
        pathname === "/" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        gsap.set(overlay, {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        });
        return;
      }

      gsap.fromTo(
        overlay,
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          duration: PAGE_TRANSITION_SECONDS,
          ease: "power3.inOut",
        },
      );
    }
  }, [pathname]);

  return (
    <PageTransitionContext.Provider value={{ animatePageOut }}>
      <div
        ref={overlayRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100dvh",
          backgroundColor: "rgba(11, 11, 13, 0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          zIndex: 100,
          pointerEvents: "none",
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        }}
      />
      <div
        ref={sheetRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          height: "100dvh",
          background: "#f2efe8",
          borderBottom: "2px solid #a3121b",
          zIndex: 100,
          pointerEvents: "none",
          visibility: "hidden",
        }}
      />
      {children}
    </PageTransitionContext.Provider>
  );
};

export const usePageTransition = () => {
  return useContext(PageTransitionContext);
};
