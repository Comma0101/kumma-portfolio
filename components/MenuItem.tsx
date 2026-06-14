"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { MenuItemData } from "./menuItems";
import styles from "../styles/MenuItem.module.css";

interface MenuItemProps {
  item: MenuItemData;
  index: number;
}

const MenuItem: FC<MenuItemProps> = ({ item, index }) => {
  const router = useRouter();
  const study = String(index + 1).padStart(2, "0");

  const handleClick = () => {
    router.push(`/gallery/${index}`);
  };

  return (
    <article className={styles.menuItem}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={handleClick}
        aria-label={`Open ${item.title}`}
      >
        <span className={styles.chapterIndex} aria-hidden="true">
          {study}
        </span>

        <span className={styles.menuCopy}>
          <span className={styles.metaRow}>
            <span className={styles.chapter}>Study {study}</span>
            <span className={styles.count}>{item.galleryImages.length} Frames</span>
          </span>
          <span className={styles.menuItemText}>{item.title}</span>
          <span className={styles.menuItemSub}>{item.subtitle}</span>
          <span className={styles.cta}>View Study</span>
        </span>

        <span className={styles.visualPane} aria-hidden="true">
          <span
            className={styles.visualImage}
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          ></span>
          <span className={styles.visualOverlay}></span>
        </span>
      </button>
    </article>
  );
};

export default MenuItem;
