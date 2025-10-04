"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "../styles/rotatingCuboids.module.css";

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
    const tl = gsap.timeline({ delay: 0.5 });
    
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

    // Continuous rotation
    gsap.to(cuboids, {
      rotateX: -360,
      duration: 8,
      repeat: -1,
      ease: "none",
    });

    // Wobble animation
    gsap.fromTo(
      cuboids,
      {
        rotateY: 8,
        rotate: -10,
      },
      {
        rotateY: -8,
        rotate: 10,
        duration: 2.2,
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
              Creative
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--back"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              Creative
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--top"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              Creative
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--bottom"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              Creative
            </p>
          </div>
        </div>

        <div className={styles.hi__cuboid} ref={addCuboidRef}>
          <div className={`${styles.face} ${styles["face--front"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              Code
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--back"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              Code
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--top"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              Code
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--bottom"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              Code
            </p>
          </div>
        </div>

        <div className={styles.hi__cuboid} ref={addCuboidRef}>
          <div className={`${styles.face} ${styles["face--front"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              Portfolio
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--back"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              Portfolio
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--top"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              Portfolio
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--bottom"]}`}>
            <p className={styles.hi__word} ref={addWordRef}>
              Portfolio
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
