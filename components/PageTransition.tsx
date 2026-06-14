"use client";

import React, { createContext, useContext, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

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

  const animatePageOut = (href: string) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }

    const overlay = overlayRef.current;
    if (overlay) {
      gsap.to(overlay, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 0.75,
        ease: "power3.inOut",
        onComplete: () => {
          if (pathname === href) {
            gsap.to(overlay, {
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
              duration: 0.75,
              ease: "power3.inOut",
            });
          } else {
            router.push(href);
          }
        },
      });
    }
  };

  useGSAP(() => {
    const overlay = overlayRef.current;
    if (overlay) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
          duration: 0.75,
          ease: "power3.inOut",
        }
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
      {children}
    </PageTransitionContext.Provider>
  );
};

export const usePageTransition = () => {
  return useContext(PageTransitionContext);
};
