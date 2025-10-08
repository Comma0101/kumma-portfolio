"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "../styles/rotatingCuboids.module.css";

gsap.registerPlugin(ScrollTrigger);

const RotatingCuboids = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cuboidsRef = useRef<HTMLDivElement[]>([]);
  const wordsRef = useRef<HTMLParagraphElement[]>([]);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const cuboids = cuboidsRef.current;
    const words = wordsRef.current;
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Set initial visibility
    gsap.set(containerRef.current, { autoAlpha: 1 });

    // Initial animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%", // Trigger when the top of the container is 80% from the top of the viewport
        toggleActions: "restart none none reverse",
      },
    });
    
    tl.from(".hi__location--lat", {
      x: 100,
      autoAlpha: 0,
      ease: "power4",
      duration: 1,
    })
      .from(".hi__location--long", {
        x: -100,
        autoAlpha: 0,
        ease: "power4",
        duration: 1,
      }, 0)
      .from(cuboids, {
        y: winH,
        duration: 3,
        stagger: 0.14,
        ease: "elastic(0.4,0.3)",
      }, 0);

    // Scroll-triggered rotation
    cuboids.forEach((cuboid, index) => {
      gsap.fromTo(cuboid, {
        rotateX: 0,
      }, {
        rotateX: -720,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1 + index * 0.2,
          immediateRender: false,
          invalidateOnRefresh: true,
        },
      });
    });

    // Subtle wobble animation (reduced intensity)
    gsap.fromTo(
      cuboids,
      {
        rotateY: 4,
        rotate: -5,
      },
      {
        rotateY: -4,
        rotate: 5,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      }
    );

    // Mouse/touch interaction
    const followPointer = (pX: number, pY: number) => {
      const dX = (2 * (pX - winW / 2)) / winW;
      const dY = (-2 * (pY - winH / 2)) / winH;
      const positiveX = Math.sqrt(dX * dX);
      const positiveY = Math.sqrt(dY * dY);
      const deltaS = 450 * positiveX;
      const deltaW = 600 * positiveY;

      gsap.to(words, {
        fontStretch: `${550 - deltaS}%`,
        fontWeight: 800 - deltaW,
        duration: 2,
      });
    };

    const handleMouseMove = (event: MouseEvent) => {
      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;
      followPointer(pointerRef.current.x, pointerRef.current.y);
    };

    const handleTouchMove = (event: TouchEvent) => {
      pointerRef.current.x = event.touches[0].clientX;
      pointerRef.current.y = event.touches[0].clientY;
      followPointer(pointerRef.current.x, pointerRef.current.y);
    };

    const handleTouchStart = (event: TouchEvent) => {
      pointerRef.current.x = event.touches[0].clientX;
      pointerRef.current.y = event.touches[0].clientY;
      followPointer(pointerRef.current.x, pointerRef.current.y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchstart", handleTouchStart);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  const addCuboidRef = (el: HTMLDivElement | null) => {
    if (el && !cuboidsRef.current.includes(el)) {
      cuboidsRef.current.push(el);
    }
  };

  const addWordRef = (el: HTMLParagraphElement | null) => {
    if (el && !wordsRef.current.includes(el)) {
      wordsRef.current.push(el);
    }
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.hi}>
        <div className={styles.hi__cuboid} ref={addCuboidRef}>
          <div className={`${styles.face} ${styles["face--front"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              KUMMA
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--back"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              KUMMA
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--top"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              KUMMA
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--bottom"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              KUMMA
            </p>
          </div>
        </div>

        <div className={styles.hi__cuboid} ref={addCuboidRef}>
          <div className={`${styles.face} ${styles["face--front"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              THE
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--back"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              THE
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--top"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              THE
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--bottom"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              THE
            </p>
          </div>
        </div>

        <div className={styles.hi__cuboid} ref={addCuboidRef}>
          <div className={`${styles.face} ${styles["face--front"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              CODER
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--back"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              CODER
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--top"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              CODER
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--bottom"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              CODER
            </p>
          </div>
        </div>
      </div>

      <div className={styles.hi__base}>
        <div className={styles.hi__base_plate}></div>
        <p className={`${styles.hi__location} ${styles["hi__location--lat"]} hi__location--lat`}>
          37.7749° N
        </p>
        <p className={`${styles.hi__location} ${styles["hi__location--long"]} hi__location--long`}>
          122.4194° W
        </p>
      </div>
    </div>
  );
};

export default RotatingCuboids;
