"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import styles from "../styles/introOverlay.module.css";

const KEY = "kumma_intro_seen_v1";

export default function IntroOverlay() {
  const [show, setShow] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      seen = false;
    }
    if (reduced || seen || pathname === "/stories") return;
    setShow(true);
  }, [pathname]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    document.body.style.overflow = "";
    setShow(false);
  }, []);

  const skip = useCallback(() => {
    const root = rootRef.current;
    if (!root) {
      finish();
      return;
    }
    gsap.killTweensOf(root);
    gsap.to(root, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete: finish,
    });
  }, [finish]);

  useEffect(() => {
    if (!show) return;
    const root = rootRef.current;
    if (!root) return;

    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);

    const tl = gsap.timeline({ onComplete: finish });
    tl.from(
      "[data-intro-rise]",
      { y: 20, opacity: 0, duration: 0.65, stagger: 0.12, ease: "power3.out" },
      0.1,
    )
      .from(
        "[data-intro-line]",
        { scaleX: 0, duration: 0.7, ease: "power3.inOut" },
        0.25,
      )
      .to(root, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 1.3);

    const safety = setTimeout(finish, 4000);
    return () => {
      window.removeEventListener("keydown", onKey);
      tl.kill();
      clearTimeout(safety);
    };
  }, [show, finish, skip]);

  if (!show) return null;

  return (
    <div
      ref={rootRef}
      className={styles.overlay}
      onClick={skip}
      role="presentation"
    >
      <div className={styles.inner}>
        <p data-intro-rise className={styles.eyebrow}>
          Independent systems builder
        </p>
        <p data-intro-rise className={styles.wordmark}>
          Kumma
        </p>
        <span data-intro-line className={styles.line} aria-hidden="true" />
      </div>
      <button type="button" className={styles.skip} onClick={skip}>
        Skip
      </button>
    </div>
  );
}
