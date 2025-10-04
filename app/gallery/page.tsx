"use client";
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import MenuItem from '@/components/MenuItem';
import { menuItems } from '@/components/menuItems';
import styles from '@/styles/PhotoGallery.module.css';

export default function GalleryLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Page entrance animations
  useGSAP(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" }
    });

    // Title entrance
    if (titleRef.current) {
      tl.fromTo(titleRef.current, 
        {
          y: 100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
        }
      );
    }

    // Menu items stagger entrance
    if (menuRef.current) {
      const items = menuRef.current.querySelectorAll(`.${styles.menuItem}`);
      tl.fromTo(items, 
        {
          y: 60,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
        }, 
        "-=0.6"
      );
    }
  }, []);

  return (
    <div ref={containerRef} className={styles.galleryLanding}>
      <h1 ref={titleRef} className={styles.galleryTitle}>Gallery Collections</h1>
      <div ref={menuRef} className={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
