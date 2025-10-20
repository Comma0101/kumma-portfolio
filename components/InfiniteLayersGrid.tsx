"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/InfiniteLayersGrid.module.css";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
import LiquidPortalTransition from "./LiquidPortalTransition";

gsap.registerPlugin(SplitText);

interface Item {
  el: HTMLDivElement;
  container: HTMLDivElement;
  wrapper: HTMLDivElement;
  img: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
  extraX: number;
  extraY: number;
  rect: DOMRect;
  ease: number;
  caption: string;
  src: string;
}

interface TransitionState {
  isActive: boolean;
  imageSrc: string;
  imageRect: DOMRect | null;
  caption: string;
  clickedElement: HTMLElement | null;
}

const InfiniteLayersGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isActive: false,
    imageSrc: "",
    imageRect: null,
    caption: "",
    clickedElement: null,
  });

  useEffect(() => {
    const data = [
      { x: 71, y: 58, w: 400, h: 270 },
      { x: 211, y: 255, w: 540, h: 360 },
      { x: 631, y: 158, w: 400, h: 270 },
      { x: 1191, y: 245, w: 260, h: 195 },
      { x: 351, y: 687, w: 260, h: 290 },
      { x: 751, y: 824, w: 205, h: 154 },
      { x: 911, y: 540, w: 260, h: 350 },
      { x: 1051, y: 803, w: 400, h: 300 },
      { x: 71, y: 922, w: 350, h: 260 },
    ];

    const sources = [
      { src: "1.jpg", caption: "Image 1" },
      { src: "2.jpg", caption: "Image 2" },
      { src: "3.jpg", caption: "Image 3" },
      { src: "1.jpg", caption: "Image 4" },
      { src: "2.jpg", caption: "Image 5" },
      { src: "3.jpg", caption: "Image 6" },
      { src: "1.jpg", caption: "Image 7" },
      { src: "2.jpg", caption: "Image 8" },
      { src: "3.jpg", caption: "Image 9" },
    ];

    const originalSize = { w: 1440, h: 1080 };
    let winW = window.innerWidth;
    let winH = window.innerHeight;
    let tileSize = { w: winW, h: winW * (originalSize.h / originalSize.w) };
    let scroll = {
      current: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      last: { x: 0, y: 0 },
      ease: 0.08,
    };
    let items: Item[] = [];
    let isDragging = false;
    const drag = { startX: 0, startY: 0, scrollX: 0, scrollY: 0 };
    const mouse = { x: { t: 0, c: 0 }, y: { t: 0, c: 0 }, press: { t: 0 } };

    const onResize = () => {
      winW = window.innerWidth;
      winH = window.innerHeight;
      tileSize = { w: winW, h: winW * (originalSize.h / originalSize.w) };
      scroll.current = { x: 0, y: 0 };
      scroll.target = { x: 0, y: 0 };
      scroll.last = { x: 0, y: 0 };
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      const baseItems = data.map((d, i) => {
        const scaleX = tileSize.w / originalSize.w;
        const scaleY = tileSize.h / originalSize.h;
        const source = sources[i % sources.length];
        return {
          src: source.src,
          caption: source.caption,
          x: d.x * scaleX,
          y: d.y * scaleY,
          w: d.w * scaleX,
          h: d.h * scaleY,
        };
      });

      items = [];
      const repsX = [0, tileSize.w];
      const repsY = [0, tileSize.h];

      baseItems.forEach((base) => {
        repsX.forEach((offsetX) => {
          repsY.forEach((offsetY) => {
            const el = document.createElement("div");
            el.className = styles.item;
            el.style.width = `${base.w}px`;

            const wrapper = document.createElement("div");
            wrapper.className = styles.itemWrapper;
            el.appendChild(wrapper);

            const itemImage = document.createElement("div");
            itemImage.className = styles.itemImage;
            itemImage.style.width = `${base.w}px`;
            itemImage.style.height = `${base.h}px`;
            wrapper.appendChild(itemImage);

            const img = new Image();
            img.src = `/images/collection1/img${base.src}`;
            itemImage.appendChild(img);

            const caption = document.createElement("small");
            caption.innerHTML = base.caption;

            const split = new SplitText(caption, {
              type: "lines",
              linesClass: "line",
            });
            split.lines.forEach((line, i) => {
              (line as HTMLElement).style.transitionDelay = `${i * 0.15}s`;
              if (line.parentElement) {
                (line.parentElement as HTMLElement).style.transitionDelay = `${
                  i * 0.15
                }s`;
              }
            });

            wrapper.appendChild(caption);
            if (containerRef.current) {
              containerRef.current.appendChild(el);
            }

            const item: Item = {
              el,
              container: itemImage,
              wrapper,
              img,
              x: base.x + offsetX,
              y: base.y + offsetY,
              w: base.w,
              h: base.h,
              extraX: 0,
              extraY: 0,
              rect: el.getBoundingClientRect(),
              ease: Math.random() * 0.5 + 0.5,
              caption: base.caption,
              src: img.src,
            };

            // Add click handler for liquid portal transition
            itemImage.addEventListener("click", (e) => {
              e.stopPropagation();
              const rect = itemImage.getBoundingClientRect();
              setTransitionState({
                isActive: true,
                imageSrc: item.src,
                imageRect: rect,
                caption: item.caption,
                clickedElement: itemImage,
              });
            });

            items.push(item);
          });
        });
      });

      tileSize.w *= 2;
      tileSize.h *= 2;
      scroll.current.x = scroll.target.x = scroll.last.x = -winW * 0.1;
      scroll.current.y = scroll.target.y = scroll.last.y = -winH * 0.1;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = 0.4;
      scroll.target.x -= e.deltaX * factor;
      scroll.target.y -= e.deltaY * factor;
    };

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDragging = true;
      document.documentElement.classList.add("dragging");
      mouse.press.t = 1;
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.scrollX = scroll.target.x;
      drag.scrollY = scroll.target.y;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.documentElement.classList.remove("dragging");
      mouse.press.t = 0;
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x.t = e.clientX / winW;
      mouse.y.t = e.clientY / winH;

      if (isDragging) {
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        scroll.target.x = drag.scrollX + dx;
        scroll.target.y = drag.scrollY + dy;
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("visible", entry.isIntersecting);
      });
    });

    const render = () => {
      scroll.current.x += (scroll.target.x - scroll.current.x) * scroll.ease;
      scroll.current.y += (scroll.target.y - scroll.current.y) * scroll.ease;

      const dx = scroll.current.x - scroll.last.x;
      const dy = scroll.current.y - scroll.last.y;

      items.forEach((item) => {
        const parX =
          5 * dx * item.ease + (mouse.x.c - 0.5) * item.rect.width * 0.6;
        const parY =
          5 * dy * item.ease + (mouse.y.c - 0.5) * item.rect.height * 0.6;

        let posX = item.x + scroll.current.x + item.extraX + parX;
        if (posX > winW) {
          item.extraX -= tileSize.w;
          posX -= tileSize.w;
        }
        if (posX + item.rect.width < 0) {
          item.extraX += tileSize.w;
          posX += tileSize.w;
        }

        let posY = item.y + scroll.current.y + item.extraY + parY;
        if (posY > winH) {
          item.extraY -= tileSize.h;
          posY -= tileSize.h;
        }
        if (posY + item.rect.height < 0) {
          item.extraY += tileSize.h;
          posY += tileSize.h;
        }

        gsap.set(item.el, { x: posX, y: posY });
      });

      scroll.last.x = scroll.current.x;
      scroll.last.y = scroll.current.y;

      mouse.x.c += (mouse.x.t - mouse.x.c) * 0.08;
      mouse.y.c += (mouse.y.t - mouse.y.c) * 0.08;

      requestAnimationFrame(render);
    };

    let introItems: Element[] = [];
    const initIntro = () => {
      if (!containerRef.current) return;
      introItems = [
        ...containerRef.current.querySelectorAll(".item-wrapper"),
      ].filter((item) => {
        const rect = item.getBoundingClientRect();
        return (
          rect.x > -rect.width &&
          rect.x < window.innerWidth + rect.width &&
          rect.y > -rect.height &&
          rect.y < window.innerHeight + rect.height
        );
      });
      introItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const x = -rect.x + window.innerWidth * 0.5 - rect.width * 0.5;
        const y = -rect.y + window.innerHeight * 0.5 - rect.height * 0.5;
        gsap.set(item, { x, y });
      });
    };

    const intro = () => {
      gsap.to(introItems.reverse(), {
        duration: 2,
        ease: "expo.inOut",
        x: 0,
        y: 0,
        stagger: 0.05,
        onComplete: () => {
          setIsLoaded(true);
        },
      });
    };

    onResize();
    render();

    items.forEach((item) => {
      observer.observe(item.wrapper);
    });

    const images = items.map((item) => item.img);
    let loadedCount = 0;
    const promises = images.map(
      (img) =>
        new Promise((resolve) => {
          img.onload = () => {
            loadedCount++;
            setLoadingProgress(Math.round((loadedCount / images.length) * 100));
            resolve(null);
          };
        })
    );

    Promise.all(promises).then(() => {
      initIntro();
      intro();
    });

    window.addEventListener("resize", onResize);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      items.forEach((item) => {
        const clone = item.container.cloneNode(true);
        item.container.parentNode?.replaceChild(clone, item.container);
      });
    };
  }, []);

  const handleCloseTransition = () => {
    setTransitionState({
      isActive: false,
      imageSrc: "",
      imageRect: null,
      caption: "",
      clickedElement: null,
    });
  };

  return (
    <>
      {!isLoaded && (
        <div className={styles.preloader}>Loading... {loadingProgress}%</div>
      )}
      <div id="images" ref={containerRef} className={styles.container}></div>

      {/* SVG Filter for Gooey/Liquid Effect */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="gooey" colorInterpolationFilters="sRGB">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <LiquidPortalTransition
        isActive={transitionState.isActive}
        imageSrc={transitionState.imageSrc}
        imageRect={transitionState.imageRect}
        caption={transitionState.caption}
        clickedElement={transitionState.clickedElement}
        onClose={handleCloseTransition}
      />
    </>
  );
};

export default InfiniteLayersGrid;
