"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { menuItems } from "./menuItems";
import styles from "../styles/PhotoGallery.module.css";

const PhotoGallery = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const collectionsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  // Page entrance animations
  useGSAP(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" }
    });

    // Animate collections
    collectionsRef.current.forEach((collection, index) => {
      if (collection) {
        // Collection title entrance
        const title = collection.querySelector(`.${styles.collectionTitle}`);
        if (title) {
          tl.from(title, {
            y: 80,
            opacity: 0,
            duration: 1,
          }, index === 0 ? 0 : "-=0.6");
        }

        // Images stagger entrance
        const images = collection.querySelectorAll(".imageWrapper");
        if (images.length > 0) {
          tl.from(images, {
            y: 60,
            opacity: 0,
            scale: 0.9,
            stagger: 0.15,
            duration: 0.8,
          }, "-=0.5");
        }
      }
    });
  }, []);

  return (
    <div ref={containerRef} className={styles.galleryContainer}>
      {menuItems.map((collection, index) => (
        <Link
          key={index}
          href={`/gallery/${index}`}
          className={styles.collection}
          ref={(el) => {
            if (el) collectionsRef.current[index] = el;
          }}
        >
          <h3 className={styles.collectionTitle}>{collection.title}</h3>
          <p className={styles.collectionSubtitle}>{collection.subtitle}</p>
          <div className={styles.imageList}>
            {collection.galleryImages.slice(0, 3).map((imageSrc, imgIndex) => (
              <div key={imgIndex} className={`${styles.imageWrapper} imageWrapper`}>
                <img src={imageSrc} alt={`${collection.title} - Image ${imgIndex + 1}`} className={styles.image} loading="lazy" />
              </div>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PhotoGallery;
