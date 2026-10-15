"use client";

import { useRef } from "react";
import Pen from "./Pen";
import { loop, scribble, underline } from "./pen";
import { draw, lift, useBeat } from "./useBeat";
import { X_URL } from "./links";
import styles from "./Front.module.css";

const tangle = scribble({ seed: 11, passes: 7 });
const focus = underline({ seed: 3, y: 50 });
const ring = loop({ seed: 21, overshoot: 0.14 });

export default function Opening() {
  const ref = useRef<HTMLElement>(null);

  useBeat(ref, (root, tl) => {
    const [noise, line, circle] = Array.from(root.querySelectorAll("[data-pen]"));
    // Noise, then focus: the tangle is drawn, the pen lifts, one clean line stays.
    draw(tl, noise, 1.1, 0.25);
    lift(tl, noise, 0.55, ">0.1");
    draw(tl, line, 0.5, "<0.15");
    draw(tl, circle, 0.9, "<0.2");
    tl.fromTo(
      root.querySelector("[data-compound]"),
      { "--wdth": 75, "--wght": 300 },
      { "--wdth": 125, "--wght": 820, duration: 1.3, ease: "expo.inOut" },
      "<0.1",
    );
  });

  return (
    <section ref={ref} className={styles.opening} aria-labelledby="name">
      <a className={styles.follow} href={X_URL} rel="me">
        Follow <span>@Comma_9fie</span> ↗
      </a>

      <h1 id="name" className={styles.name}>
        Kumma
        <Pen d={tangle} className={styles.nameNoise} />
        <Pen d={focus} className={styles.nameLine} />
      </h1>

      <figure className={styles.portrait}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kumma/portrait.jpg" alt="Kumma Wu, black and white portrait" width={400} height={400} />
        <Pen d={ring} className={styles.portraitRing} />
      </figure>

      <div className={styles.bio}>
        <p>In the gym most days. Trading options.</p>
        <p className={styles.attention}>
          Attention goes where it{" "}
          <span className={styles.compound} data-compound>
            compounds.
          </span>
        </p>
        <p className={styles.meta}>Los Angeles</p>
      </div>
    </section>
  );
}
