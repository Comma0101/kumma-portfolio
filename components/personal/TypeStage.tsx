"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import styles from "./Portrait.module.css";

type Token = {
  text: string;
  x: number;
  y: number;
  size?: number;
  dx: number;
  dy: number;
  scale?: number;
  lag?: number;
  span?: number;
  ease?: "out" | "flat";
  quiet?: boolean;
  rot?: number;
  drot?: number;
  tone?: "light" | "body" | "weight";
};

const sutra: Token[] = [
  { text: "凡所有相，", x: 8, y: 46, size: 1.65, dx: 0, dy: 0.14, scale: 0.92, lag: 0, span: 0.38, ease: "out" },
  { text: "皆是虛妄；", x: 30, y: 34, size: 1.25, dx: 0.08, dy: 0, scale: 1, lag: 0.08, span: 0.34, ease: "out", rot: -6, drot: 8 },
  { text: "若見諸相非相，", x: 46, y: 50, size: 0.78, dx: 0, dy: 0.08, scale: 1, lag: 0.14, span: 0.3, ease: "flat", quiet: true },
  { text: "則見如來。", x: 62, y: 32, size: 2.4, dx: 0.04, dy: -0.16, scale: 1.2, lag: 0.2, span: 0.4, ease: "out", tone: "weight" },
];

const scripture: Token[] = [
  { text: "For", x: 6, y: 46, dx: -0.06, dy: 0.02, lag: 0, quiet: true },
  { text: "the", x: 14, y: 44, dx: -0.05, dy: 0.02, lag: 0.03, quiet: true },
  { text: "things", x: 22, y: 46, dx: -0.05, dy: 0.02, lag: 0.06, quiet: true },
  { text: "that", x: 34, y: 44, dx: -0.04, dy: 0.02, lag: 0.09, quiet: true },
  { text: "are", x: 42, y: 46, dx: -0.04, dy: 0.02, lag: 0.12, quiet: true },
  { text: "seen", x: 8, y: 68, size: 1.5, dx: 0, dy: 0.36, scale: 0.72, lag: 0.16, span: 0.4, ease: "out" },
  { text: "are", x: 26, y: 62, dx: -0.03, dy: 0.02, lag: 0.18, quiet: true },
  { text: "transient,", x: 18, y: 80, size: 1.4, dx: 0.08, dy: 0.42, scale: 0.7, lag: 0.24, span: 0.42, ease: "out" },
  { text: "but", x: 50, y: 40, dx: -0.04, dy: 0.02, lag: 0.2, quiet: true },
  { text: "the", x: 58, y: 38, dx: -0.03, dy: 0.02, lag: 0.23, quiet: true },
  { text: "things", x: 66, y: 40, dx: -0.03, dy: 0.02, lag: 0.26, quiet: true },
  { text: "that", x: 78, y: 38, dx: -0.02, dy: 0.02, lag: 0.29, quiet: true },
  { text: "are", x: 86, y: 42, dx: -0.02, dy: 0.02, lag: 0.32, quiet: true },
  { text: "unseen", x: 56, y: 20, size: 1.65, dx: 0, dy: -0.32, scale: 1.4, lag: 0.3, span: 0.44, ease: "out" },
  { text: "are", x: 76, y: 24, dx: 0.04, dy: 0, lag: 0.34, quiet: true },
  { text: "eternal.", x: 48, y: 6, size: 3.4, dx: 0.12, dy: -0.42, scale: 1.7, lag: 0.36, span: 0.5, ease: "out", rot: -3, tone: "weight" },
];

const attention: Token[] = [
  { text: "Attention", x: 4, y: 10, size: 3.1, dx: -0.2, dy: -0.28, scale: 1.4, lag: 0, span: 0.48, ease: "out", rot: -2 },
  { text: "goes", x: 18, y: 42, size: 0.7, dx: -0.14, dy: 0.08, lag: 0.12, span: 0.3, quiet: true, rot: 8 },
  { text: "where", x: 36, y: 54, size: 0.85, dx: -0.06, dy: 0.12, lag: 0.2, span: 0.3, quiet: true, rot: -6 },
  { text: "it", x: 58, y: 46, size: 0.62, dx: 0.1, dy: -0.04, lag: 0.28, span: 0.28, quiet: true, rot: 14 },
  { text: "compounds.", x: 22, y: 70, size: 2.6, dx: 0.1, dy: 0.46, scale: 0.55, lag: 0.3, span: 0.48, ease: "out", tone: "weight" },
];

const body: Token[] = [
  { text: "The", x: 7, y: 18, size: 0.7, dx: 0, dy: -0.06, lag: 0, quiet: true },
  { text: "body", x: -4, y: 28, size: 8.5, dx: 0, dy: 0.5, scale: 0.4, lag: 0.06, span: 0.55, ease: "out" },
];

const market: Token[] = [
  { text: "The", x: 78, y: 14, size: 0.7, dx: 0.08, dy: 0, lag: 0, quiet: true, rot: 90 },
  { text: "market", x: 18, y: 40, size: 4.4, dx: 0.7, dy: 0.08, scale: 0.75, lag: 0.1, span: 0.5, ease: "out", rot: -8 },
];

const creed: Token[] = [
  { text: "I", x: 6, y: 22, size: 0.7, dx: -0.16, dy: 0.08, lag: 0, span: 0.32, quiet: true },
  { text: "let", x: 12, y: 24, size: 0.7, dx: -0.14, dy: 0.08, lag: 0.04, span: 0.32, quiet: true },
  { text: "presence", x: 20, y: 12, size: 2.2, dx: 0, dy: -0.5, scale: 1.6, lag: 0.06, span: 0.5, ease: "out" },
  { text: "be", x: 50, y: 24, size: 0.7, dx: -0.1, dy: 0.06, lag: 0.12, span: 0.3, quiet: true },
  { text: "my", x: 56, y: 24, size: 0.7, dx: -0.08, dy: 0.06, lag: 0.16, span: 0.3, quiet: true },
  { text: "center,", x: 64, y: 14, size: 1.7, dx: 0.4, dy: -0.08, scale: 1.35, lag: 0.18, span: 0.46, ease: "out" },
  { text: "reason", x: 6, y: 48, size: 2.1, dx: 0, dy: -0.48, scale: 1.55, lag: 0.2, span: 0.48, ease: "out" },
  { text: "be", x: 32, y: 54, size: 0.7, dx: -0.12, dy: 0.1, lag: 0.26, span: 0.3, quiet: true },
  { text: "my", x: 38, y: 54, size: 0.7, dx: -0.1, dy: 0.1, lag: 0.3, span: 0.3, quiet: true },
  { text: "compass,", x: 48, y: 46, size: 1.85, dx: 0.42, dy: 0.06, scale: 1.3, lag: 0.32, span: 0.46, ease: "out" },
  { text: "and", x: 8, y: 82, size: 0.7, dx: -0.12, dy: 0.14, lag: 0.36, span: 0.32, quiet: true },
  { text: "emotion", x: 28, y: 72, size: 2.15, dx: 0, dy: -0.5, scale: 1.55, lag: 0.38, span: 0.5, ease: "out" },
  { text: "be", x: 50, y: 82, size: 0.7, dx: -0.12, dy: 0.14, lag: 0.44, span: 0.32, quiet: true },
  { text: "my", x: 56, y: 82, size: 0.7, dx: -0.1, dy: 0.14, lag: 0.48, span: 0.32, quiet: true },
  { text: "light.", x: 66, y: 68, size: 2.6, dx: 0.2, dy: -0.58, scale: 1.9, lag: 0.52, span: 0.4, ease: "out", tone: "weight" },
];

function Canvas({
  id,
  face,
  heading,
  children,
}: {
  id?: string;
  face?: string;
  heading?: boolean;
  children: ReactNode;
}) {
  const Name = heading ? "h1" : "span";
  return (
    <div className={styles.scene} data-scene>
      <section className={face ? `${styles.canvas} ${face}` : styles.canvas} id={id} data-line>
        <svg className={styles.thread} data-thread aria-hidden="true" />
        <Name className={styles.name}>Kumma Wu</Name>
        {children}
      </section>
    </div>
  );
}

function Mark({ word }: { word: Token }) {
  return (
    <span
      className={styles.word}
      data-word
      data-dx={word.dx}
      data-dy={word.dy}
      data-scale={word.scale ?? 1}
      data-lag={word.lag ?? 0}
      data-span={word.span ?? 0.36}
      data-ease={word.ease ?? "flat"}
      data-quiet={word.quiet ? "1" : "0"}
      data-tone={word.tone ?? (word.quiet ? "light" : "body")}
      data-rot={word.rot ?? 0}
      data-drot={word.drot ?? 0}
      style={{
        left: `${word.x}%`,
        top: `${word.y}%`,
        fontSize: word.size ? `${word.size}em` : undefined,
      }}
    >
      {word.text}
    </span>
  );
}

export default function TypeStage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const lines = Array.from(root.querySelectorAll("[data-line]"));
      let frame = 0;

      const drawThreads = () => {
        lines.forEach((line) => {
          const thread = line.querySelector("[data-thread]");
          if (!thread) return;
          const words = Array.from(line.querySelectorAll("[data-word]"));
          const width = line.clientWidth;
          const height = line.clientHeight;
          thread.setAttribute("viewBox", `0 0 ${width} ${height}`);
          const boxes = words.map((word) => {
            const mark = word as HTMLElement;
            const left = mark.offsetLeft;
            const top = mark.offsetTop;
            const right = left + mark.offsetWidth;
            const bottom = top + mark.offsetHeight;
            return {
              cx: (left + right) / 2,
              cy: (top + bottom) / 2,
              left,
              top,
              right,
              bottom,
            };
          });
          const rim = (box, toward) => {
            const dx = toward.x - box.cx;
            const dy = toward.y - box.cy;
            const length = Math.hypot(dx, dy) || 1;
            const halfW = (box.right - box.left) / 2;
            const halfH = (box.bottom - box.top) / 2;
            const scaleX = dx === 0 ? Infinity : halfW / Math.abs(dx);
            const scaleY = dy === 0 ? Infinity : halfH / Math.abs(dy);
            const edge = Math.min(scaleX, scaleY);
            const reach = edge + 10 / length;
            return { x: box.cx + dx * reach, y: box.cy + dy * reach };
          };
          const ns = "http://www.w3.org/2000/svg";
          const ensure = (kind: string) => {
            const found = thread.querySelector(`path[data-kind="${kind}"]`);
            if (found) return found;
            const made = document.createElementNS(ns, "path");
            made.setAttribute("data-kind", kind);
            thread.appendChild(made);
            return made;
          };
          const glow = ensure("glow");
          const core = ensure("core");
          if (boxes.length < 2) {
            glow.setAttribute("d", "");
            core.setAttribute("d", "");
            return;
          }
          let d = "";
          const stops = [boxes[0]];
          for (let i = 0; i < boxes.length - 1; i += 1) {
            const from = rim(boxes[i], { x: boxes[i + 1].cx, y: boxes[i + 1].cy });
            const to = rim(boxes[i + 1], { x: boxes[i].cx, y: boxes[i].cy });
            d += `M ${from.x} ${from.y} L ${to.x} ${to.y} `;
            stops.push({ cx: to.x, cy: to.y });
          }
          glow.setAttribute("d", d);
          core.setAttribute("d", d);
          const total = core.getTotalLength();
          const lens = stops.map((point) => {
            let best = 0;
            let bestDist = Infinity;
            for (let step = 0; step <= 48; step += 1) {
              const len = (total * step) / 48;
              const at = core.getPointAtLength(len);
              const dist = (at.x - point.cx) ** 2 + (at.y - point.cy) ** 2;
              if (dist < bestDist) {
                bestDist = dist;
                best = len;
              }
            }
            return best;
          });
          for (let i = 1; i < lens.length; i += 1) lens[i] = Math.max(lens[i], lens[i - 1]);
          core._lens = lens;
          thread.querySelectorAll("circle").forEach((dot) => dot.remove());
          const dot = document.createElementNS(ns, "circle");
          dot.setAttribute("cx", String(stops[0].cx));
          dot.setAttribute("cy", String(stops[0].cy));
          dot.setAttribute("r", "4");
          thread.appendChild(dot);
        });
      };

      const arrived = (word, progress) => {
          const lag = (Number(word.dataset.lag) || 0) * 0.4;
          const span = Number(word.dataset.span) || 0.36;
          const raw = Math.min(1, Math.max(0, (progress - lag) / span));
          return word.dataset.ease === "out" ? 1 - Math.pow(1 - raw, 3) : raw;
        };

        const place = () => {
        frame = 0;
        const height = window.innerHeight;
        lines.forEach((line) => {
          const scene = line.parentElement as HTMLElement;
          const sceneTop = scene.getBoundingClientRect().top;
          const travel = Math.max(scene.offsetHeight - height, 1);
          const progress = Math.min(1, Math.max(0, -sceneTop / travel / 0.72));
          if (sceneTop <= 0 && sceneTop > -travel) {
            line.style.position = "fixed";
            line.style.top = "0px";
            line.style.zIndex = "1";
          } else if (sceneTop > 0) {
            line.style.position = "absolute";
            line.style.top = "0px";
            line.style.zIndex = "0";
          } else {
            line.style.position = "absolute";
            line.style.top = `${travel}px`;
            line.style.zIndex = "0";
          }
          line.style.left = "0px";
          line.style.width = "100%";
          const words = Array.from(line.querySelectorAll("[data-word]"));
          const core = line.querySelector('[data-kind="core"]');
          const total = core ? core.getTotalLength() : 0;
          const lens = core ? core._lens : null;
          const glide = progress * progress * (3 - 2 * progress);
          const drawn = total * glide;
          if (core && total) {
            line.querySelectorAll("[data-thread] path").forEach((threadPath) => {
              const length = threadPath.getTotalLength();
              if (!length) return;
              threadPath.style.strokeDasharray = `${length}`;
              threadPath.style.strokeDashoffset = `${length - drawn * (length / (total || length))}`;
            });
            const dot = line.querySelector("[data-thread] circle");
            if (dot && total) {
              if (drawn > 6) {
                const at = core.getPointAtLength(Math.min(drawn, total));
                dot.setAttribute("cx", String(at.x));
                dot.setAttribute("cy", String(at.y));
                dot.style.opacity = "1";
              } else {
                dot.style.opacity = "0";
              }
            }
          }
          if (reduce) return;
          words.forEach((node, index) => {
            const word = node as HTMLElement;
            const start = lens && index > 0 ? lens[index - 1] / total : 0;
            const end = lens ? lens[index] / total : 1;
            const span = Math.max(end - start, 0.04);
            const along = lens ? Math.min(1, Math.max(0, (glide - start) / span)) : arrived(word, progress);
            const local = along * along * (3 - 2 * along);
            const remain = 1 - local;
            const x = (Number(word.dataset.dx) || 0) * height * remain;
            const y = (Number(word.dataset.dy) || 0) * height * remain;
            const from = Number(word.dataset.scale) || 1;
            const scale = from + (1 - from) * local;
            const rest = Number(word.dataset.rot) || 0;
            const spin = Number(word.dataset.drot) || 0;
            const angle = rest + spin * remain;
            word.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg) scale(${scale})`;
            const floor = word.dataset.quiet === "1" ? 0.72 : 0.12;
            word.style.opacity = String(floor + (1 - floor) * local);
          });
        });
      };

      const onScroll = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(place);
      };

      place();
      drawThreads();
      document.fonts.ready.then(drawThreads);
      const smooth = window as Window & {
        lenis?: { on: (e: string, cb: () => void) => void; off?: (e: string, cb: () => void) => void };
      };
      const listen = window.requestAnimationFrame(() => {
        smooth.lenis?.on("scroll", onScroll);
      });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      window.addEventListener("resize", drawThreads);
      return () => {
        window.cancelAnimationFrame(listen);
        smooth.lenis?.off?.("scroll", onScroll);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        window.removeEventListener("resize", drawThreads);
        if (frame) window.cancelAnimationFrame(frame);
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef}>
      <header className={styles.mast}>
        <nav className={styles.nav} aria-label="Page">
          <a href="#sutra">Line</a>
          <a href="#life">Life</a>
          <a href="https://x.com/Comma_9fie">X</a>
          <a href="/projects">Work</a>
        </nav>
      </header>

      <div className={styles.stage}>
        <Canvas id="sutra" face={styles.ink} heading>
          {sutra.map((word) => (
            <Mark key={word.text} word={word} />
          ))}
        </Canvas>

        <Canvas>
          {scripture.map((word, index) => (
            <Mark key={`${word.text}-${index}`} word={word} />
          ))}
          <p className={styles.cite}>2 Corinthians 4:18</p>
        </Canvas>

        <Canvas>
          {attention.map((word) => (
            <Mark key={word.text} word={word} />
          ))}
          <p className={styles.note}>In the gym most days. Trading options.</p>
        </Canvas>

        <Canvas id="life">
          {body.map((word) => (
            <Mark key={word.text} word={word} />
          ))}
          <p className={styles.note}>
            Most days are in the gym. Street clothes, hiking, and basketball are
            the rest of that life.
          </p>
        </Canvas>

        <Canvas>
          {market.map((word) => (
            <Mark key={word.text} word={word} />
          ))}
          <p className={styles.note}>
            I trade options, and I do not force an entry. Year four is when a
            small profit starts to hold.
          </p>
        </Canvas>

        <Canvas>
          {creed.map((word, index) => (
            <Mark key={`${word.text}-${index}`} word={word} />
          ))}
        </Canvas>
      </div>

      <footer className={styles.colophon}>
        <a href="https://x.com/Comma_9fie">Follow on X</a>
        <a href="/blog/en/On-Emotions">On emotions</a>
        <a href="/blog/en/Same-Light">Same light</a>
        <a href="/projects">Systems I build</a>
        <span>Los Angeles</span>
      </footer>
    </div>
  );
}
