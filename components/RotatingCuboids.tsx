"use client";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/rotatingCuboids.module.css";

const RotatingCuboids = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting && entry.intersectionRatio > 0.14);
      },
      { threshold: [0.12, 0.2, 0.35] }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.cuboidsContainer} ${isVisible ? styles.isVisible : ""}`}
    >
      <div className={styles.hi}>
        <div className={`${styles.hi__cuboid} ${styles.cuboidA}`}>
          <div className={`${styles.face} ${styles["face--front"]}`}>
            <p className={styles.hi__word}>
              KUMMA
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--back"]}`}>
            <p className={styles.hi__word}>
              KUMMA
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--top"]}`}>
            <p className={styles.hi__word}>
              KUMMA
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--bottom"]}`}>
            <p className={styles.hi__word}>
              KUMMA
            </p>
          </div>
        </div>

        <div className={`${styles.hi__cuboid} ${styles.cuboidB}`}>
          <div className={`${styles.face} ${styles["face--front"]}`}>
            <p className={`${styles.hi__word} ${styles.hi__wordAccent}`}>
              THE
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--back"]}`}>
            <p className={`${styles.hi__word} ${styles.hi__wordAccent}`}>
              THE
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--top"]}`}>
            <p className={`${styles.hi__word} ${styles.hi__wordAccent}`}>
              THE
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--bottom"]}`}>
            <p className={`${styles.hi__word} ${styles.hi__wordAccent}`}>
              THE
            </p>
          </div>
        </div>

        <div className={`${styles.hi__cuboid} ${styles.cuboidC}`}>
          <div className={`${styles.face} ${styles["face--front"]}`}>
            <p className={styles.hi__word}>
              CODER
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--back"]}`}>
            <p className={styles.hi__word}>
              CODER
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--top"]}`}>
            <p className={styles.hi__word}>
              CODER
            </p>
          </div>
          <div className={`${styles.face} ${styles["face--bottom"]}`}>
            <p className={styles.hi__word}>
              CODER
            </p>
          </div>
        </div>
      </div>

      <div className={styles.hi__base}>
        <div className={styles.hi__base_plate}></div>
        <p className={`${styles.hi__location} ${styles["hi__location--lat"]}`}>
          37.7749° N
        </p>
        <p className={`${styles.hi__location} ${styles["hi__location--long"]}`}>
          122.4194° W
        </p>
      </div>
    </div>
  );
};

export default RotatingCuboids;
