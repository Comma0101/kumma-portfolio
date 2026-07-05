"use client";

import { useRef } from "react";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import MenuItem from "@/components/MenuItem";
import { menuItems } from "@/components/menuItems";
import styles from "@/styles/PhotoGallery.module.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function GalleryLandingClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const totalFrames = menuItems.reduce(
    (frameCount, item) => frameCount + item.galleryImages.length,
    0,
  );

  useGSAP(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (headerRef.current) {
      const revealItems = headerRef.current.querySelectorAll("[data-reveal]");
      tl.fromTo(
        revealItems,
        { y: 34, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.78, stagger: 0.08 },
      );
    }

    if (menuRef.current) {
      const items = menuRef.current.querySelectorAll(`.${styles.menuItemSlot}`);
      tl.fromTo(
        items,
        { y: 34, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.65 },
        "-=0.4",
      );
    }
  }, []);

  return (
    <div ref={containerRef} className={styles.galleryLanding}>
      <div className={styles.galleryShell}>
        <header ref={headerRef} className={styles.galleryHeader}>
          <div className={styles.headerMain}>
            <p
              className={`${styles.galleryEyebrow} ${spaceGrotesk.className}`}
              data-reveal
            >
              Visual Studies
            </p>
            <h1
              className={`${styles.galleryTitle} ${cormorant.className}`}
              data-reveal
            >
              Visual Systems
            </h1>
            <p
              className={`${styles.galleryIntro} ${spaceGrotesk.className}`}
              data-reveal
            >
              Image sets and interface references for rhythm, mood, and spatial
              decisions.
            </p>
          </div>

          <aside className={styles.headerNote} data-reveal>
            <p className={`${styles.noteLabel} ${spaceGrotesk.className}`}>
              Editorial Note
            </p>
            <p className={`${styles.noteText} ${spaceGrotesk.className}`}>
              Interface studies for atmosphere, pacing, and system legibility.
            </p>
          </aside>
        </header>

        <p className={`${styles.collectionsMeta} ${spaceGrotesk.className}`}>
          {menuItems.length} studies / {totalFrames} frames in total
        </p>

        <div ref={menuRef} className={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <div key={item.title} className={styles.menuItemSlot}>
              <MenuItem item={item} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
