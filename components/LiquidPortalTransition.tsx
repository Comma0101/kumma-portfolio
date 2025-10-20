"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "../styles/LiquidPortalTransition.module.css";

interface LiquidPortalTransitionProps {
  isActive: boolean;
  imageSrc: string;
  imageRect: DOMRect | null;
  caption: string;
  clickedElement: HTMLElement | null;
  onClose: () => void;
}

const LiquidPortalTransition: React.FC<LiquidPortalTransitionProps> = ({
  isActive,
  imageSrc,
  imageRect,
  caption,
  clickedElement,
  onClose,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isActive || !imageRect || !blobRef.current || !overlayRef.current)
      return;

    const blob = blobRef.current;
    const overlay = overlayRef.current;
    const image = imageRef.current;
    const content = contentRef.current;
    const closeButton = closeButtonRef.current;
    const backButton = backButtonRef.current;

    // Hide the original clicked image immediately for seamless transition
    if (clickedElement) {
      gsap.set(clickedElement, { opacity: 0 });
    }

    // Set initial position and size based on clicked image
    gsap.set(blob, {
      width: imageRect.width,
      height: imageRect.height,
      left: imageRect.left,
      top: imageRect.top,
      borderRadius: "0%",
    });

    // Image visible from the start
    gsap.set(image, {
      opacity: 1,
      scale: 1,
    });

    gsap.set([content, closeButton, backButton], {
      opacity: 0,
    });

    // Animation timeline
    const tl = gsap.timeline();

    // Phase 1: Blob burst outward with organic morphing (image scales with it)
    tl.to(blob, {
      duration: 1.2,
      width: "100vw",
      height: "100vh",
      left: 0,
      top: 0,
      ease: "power2.inOut",
    })
      // Phase 2: Fade in overlay backdrop
      .to(
        overlay,
        {
          duration: 0.8,
          backgroundColor: "rgba(0, 0, 0, 0.95)",
          ease: "power2.out",
        },
        "-=0.8"
      )
      // Phase 3: Slide up content
      .to(
        content,
        {
          duration: 0.8,
          opacity: 1,
          y: 0,
          ease: "power3.out",
        },
        "-=0.5"
      )
      // Phase 4: Fade in buttons
      .to(
        [closeButton, backButton],
        {
          duration: 0.4,
          opacity: 1,
          ease: "power2.out",
        },
        "-=0.3"
      );

    return () => {
      tl.kill();
    };
  }, [isActive, imageRect]);

  const handleClose = () => {
    if (!blobRef.current || !overlayRef.current || !imageRect) return;

    const blob = blobRef.current;
    const overlay = overlayRef.current;
    const content = contentRef.current;
    const closeButton = closeButtonRef.current;
    const backButton = backButtonRef.current;

    // Immediately remove the gooey filter for a clean shrink animation
    gsap.set(blob, { filter: "none" });

    const tl = gsap.timeline({
      onComplete: onClose,
    });

    // 1. Content & buttons fade out (0.0s -> 0.3s)
    tl.to([content, closeButton, backButton], {
      duration: 0.3,
      opacity: 0,
      y: 20,
      ease: "power2.in",
    });

    // 2. Dark background fades away (0.0s -> 0.4s)
    tl.to(
      overlay,
      {
        duration: 0.4,
        backgroundColor: "rgba(0, 0, 0, 0)",
        ease: "power2.in",
      },
      0
    );

    // 3. Overlay blob shrinks (0.0s -> 0.8s)
    tl.to(
      blob,
      {
        duration: 0.8,
        width: imageRect.width,
        height: imageRect.height,
        left: imageRect.left,
        top: imageRect.top,
        ease: "power2.inOut",
      },
      0
    );

    // 4. Hide overlay slightly before showing original (prevents any overlay visibility)
    tl.set(blob, { opacity: 0 }, 0.79);
    tl.set(clickedElement, { opacity: 1 }, 0.8);
  };

  if (!isActive) return null;

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <div ref={blobRef} className={styles.blob}>
        <div className={styles.blobInner}>
          <img
            ref={imageRef}
            src={imageSrc}
            alt={caption}
            className={styles.image}
          />
        </div>
      </div>

      <div ref={contentRef} className={styles.content}>
        <h2 className={styles.caption}>{caption}</h2>
        <p className={styles.description}>
          Immerse yourself in this visual experience. Feel the liquid motion as
          boundaries dissolve and new perspectives emerge.
        </p>
      </div>

      <button
        ref={closeButtonRef}
        onClick={handleClose}
        className={styles.closeButton}
        aria-label="Close"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 8L8 24M8 8L24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        ref={backButtonRef}
        onClick={handleClose}
        className={styles.backButton}
        aria-label="Back to Stories"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 12H5M5 12L12 19M5 12L12 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Back to Stories</span>
      </button>
    </div>
  );
};

export default LiquidPortalTransition;
