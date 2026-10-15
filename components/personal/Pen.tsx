"use client";

import { useEffect, useRef, useState } from "react";
import { fit } from "./pen";
import styles from "./Front.module.css";

// A red ballpoint mark laid over whatever it is placed on. The stroke is
// redrawn in the box's own pixels so it keeps an even width and draws on
// exactly; it stays hidden until it has been measured.
export default function Pen({ d, className }: { d: string; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const measure = () => {
      const { width, height } = svg.getBoundingClientRect();
      if (!width || !height) return;
      setBox((last) =>
        last && Math.abs(last.width - width) < 1 && Math.abs(last.height - height) < 1
          ? last
          : { width, height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={className ? `${styles.pen} ${className}` : styles.pen}
      viewBox={box ? `0 0 ${box.width} ${box.height}` : "0 0 100 100"}
      aria-hidden="true"
      focusable="false"
      style={box ? undefined : { visibility: "hidden" }}
    >
      <path d={box ? fit(d, box.width, box.height) : d} pathLength={1} data-pen />
    </svg>
  );
}
