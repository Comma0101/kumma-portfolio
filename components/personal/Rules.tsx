"use client";

import { useRef } from "react";
import Ink, { type Trace } from "./Ink";
import { anchor, threadX } from "./anchors";
import { handLine, type Point } from "./pen";
import { draw, ease, reveal, useBeat } from "./useBeat";
import styles from "./Front.module.css";

const margin: Trace = ({ height }, host) => ({
  points: handLine([threadX(host), -2], [threadX(host), height + 2], 41, 0.5),
});

// Price leaves from the margin and runs off the page, rising.
const price: Trace = ({ width }, host) => {
  const line = anchor(host, "chase");
  if (!line) return { points: [] };
  const y = line.y + line.height + 10;
  return { points: handLine([threadX(host), y], [width + 60, y - 36], 43, 1.4) };
};

// Zero volatility: a ruler line, constant pressure, never animated.
const flat: Trace = (_, host) => {
  const line = anchor(host, "bored");
  if (!line) return { points: [] };
  const y = line.y + line.height + 14;
  return { points: [[threadX(host), y] as Point, [line.x + line.width, y] as Point] };
};

function Chase() {
  const ref = useRef<HTMLDivElement>(null);
  useBeat(ref, (root, tl) => {
    const path = reveal(root, "price") as SVGPathElement | null;
    const label = root.querySelector<HTMLElement>("[data-price]");
    if (!path || !label) return;
    const state = { p: 0 };
    tl.to(state, {
      p: 1,
      duration: 1.1,
      ease: "power2.in",
      delay: 0.25,
      onStart: () => {
        label.style.opacity = "1";
      },
      onUpdate: () => {
        path.style.strokeDashoffset = String(1 - state.p);
        // The label rides the pen tip until it leaves the page.
        const total = path.getTotalLength();
        const tip = path.getPointAtLength(total * state.p);
        label.style.transform = `translate(${tip.x}px, ${tip.y}px)`;
      },
    });
  });
  return (
    <div ref={ref} className={styles.chase}>
      <p className={styles.rule} data-anchor="chase">
        Don’t chase.
      </p>
      <span className={styles.price} data-price aria-hidden="true">
        price
      </span>
      <Ink trace={price} mark="price" size={2.6} seed={43} className={styles.thread} />
    </div>
  );
}

function Small() {
  const ref = useRef<HTMLParagraphElement>(null);
  useBeat(ref, (root, tl) => {
    tl.fromTo(
      root.querySelector("[data-small]"),
      { "--wdth": 125, scale: 1 },
      { "--wdth": 62, scale: 0.6, duration: 0.9, ease: ease.impulse },
      0.15,
    );
  });
  return (
    <p ref={ref} className={styles.rule}>
      <span className={styles.small} data-small>
        Stay small.
      </span>
    </p>
  );
}

export default function Rules() {
  const ref = useRef<HTMLElement>(null);
  useBeat(ref, (root, tl) => {
    draw(tl, reveal(root, "rules-margin"), { duration: 1.4, position: 0 });
  });

  return (
    <section ref={ref} className={styles.rules} aria-label="Rules">
      <Ink trace={margin} mark="rules-margin" size={2.2} seed={41} className={styles.thread} />
      <Chase />
      <Small />
      <p className={styles.rule} data-anchor="bored">
        Stay bored.
      </p>
      <p className={styles.still}>(nothing moves here.)</p>
      <Ink trace={flat} mark="flat" size={2.4} seed={45} flat still className={styles.thread} />
      <p className={styles.ruleCoda}>
        There’s always another candle. You don’t need to catch all of them, just
        the ones you know.
      </p>
    </section>
  );
}
