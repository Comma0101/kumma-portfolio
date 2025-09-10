'use client';
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import styles from "../styles/PhotoGallery.module.css";
import { FC } from "react";
import { MenuItemData } from "./menuItems";

// interface MenuItemProps {
//   item: MenuItemData;
//   index: number;
// }

// const MenuItem: FunctionalComponent<MenuItemProps> = ({ item, index }) => {
//   const trailRefs = useRef<HTMLDivElement[]>([]);
//   const trailContainerRef = useRef<HTMLDivElement | null>(null);
//   const trailImagesCount = 5;
//   const trailDelay = 0.05;
//   const [isTrailing, setIsTrailing] = useState(false);

//   const handleMouseEnter = () => {
//     createTrail();
//   };

//   const handleMouseMove = (e: MouseEvent) => {
//     moveTrail(e);
//   };

//   const handleMouseLeave = () => {
//     removeTrail();
//   };

//   const handleClick = () => {
//     route(`/gallery/${index}`);
//   };

//   const createTrail = () => {
//     if (trailContainerRef.current) return;
//     setIsTrailing(true);
//     trailRefs.current = [];
//     trailContainerRef.current = document.createElement("div");
//     trailContainerRef.current.className = styles.trailContainer;
//     document.body.appendChild(trailContainerRef.current);

//     for (let i = 0; i < trailImagesCount; i++) {
//       const trailImage = document.createElement("div");
//       trailImage.className = styles.trailImage;
//       trailImage.style.backgroundImage = `url(${
//         item.galleryImages[i % item.galleryImages.length]
//       })`;
//       trailContainerRef.current.appendChild(trailImage);
//       trailRefs.current.push(trailImage);
//     }
//   };

//   const moveTrail = (e: MouseEvent) => {
//     if (!isTrailing) return;
//     trailRefs.current.forEach((trailImage, index) => {
//       const delay = index * trailDelay;
//       gsap.to(trailImage, {
//         x: e.clientX,
//         y: e.clientY,
//         delay: delay,
//         duration: 0.3,
//         ease: "power2.out",
//       });
//     });
//   };

//   const removeTrail = () => {
//     if (!trailContainerRef.current) return;
//     gsap.to(trailContainerRef.current, {
//       opacity: 0,
//       duration: 0.5,
//       onComplete: () => {
//         if (trailContainerRef.current && trailContainerRef.current.parentNode) {
//           trailContainerRef.current.parentNode.removeChild(
//             trailContainerRef.current
//           );
//         }
//         trailContainerRef.current = null;
//         setIsTrailing(false);
//       },
//     });
//   };

//   return (
//     <div
//       className={styles.menuItem}
//       onMouseEnter={handleMouseEnter}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={handleMouseLeave}
//       onClick={handleClick}
//     >
//       <span className={styles.menuItemText}>
//         <span className={styles.menuItemTextInner}>{item.title}</span>
//       </span>
//       <span className={styles.menuItemSub}>{item.subtitle}</span>
//     </div>
//   );
// };

// export default MenuItem;

//reveal effect
interface MenuItemProps {
  item: MenuItemData;
  index: number;
}

const MenuItem: FC<MenuItemProps> = ({ item, index }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const revealRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    animateRevealIn();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    animateRevealOut();
  };

  const handleClick = () => {
    router.push(`/gallery/${index}`);
  };

  const animateRevealIn = () => {
    if (revealRef.current) {
      gsap.killTweensOf(revealRef.current);
      gsap.fromTo(
        revealRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  };

  const animateRevealOut = () => {
    if (revealRef.current) {
      gsap.killTweensOf(revealRef.current);
      gsap.to(revealRef.current, {
        opacity: 0,
        x: 50,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  };

  return (
    <div
      className={styles.menuItem}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <span className={styles.menuItemText}>
        <span className={styles.menuItemTextInner}>{item.title}</span>
      </span>
      <span className={styles.menuItemSub}>{item.subtitle}</span>
      <div className={styles.hoverReveal} ref={revealRef}>
        <div className={styles.hoverRevealInner}>
          <div
            className={styles.hoverRevealImage}
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
