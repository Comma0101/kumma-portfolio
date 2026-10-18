"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { centerline, inkStroke, pace, resample, type Emphasis } from "./ink";
import { ensoPath, profiles, type Profile } from "./brush";
import { bamboo, bambooProfiles, PLATE } from "./bamboo";
import { daoMedians, daoOutlines } from "./dao";
import { random, type Point } from "./pen";
import { draw } from "./useBeat";
import Portrait from "./Portrait";
import front from "./Front.module.css";
import styles from "./Pages.module.css";

// One drawn stroke: its ink, and the centreline its mask is drawn along.
type Mark = {
  outline: string;
  center: string;
  pace: string;
  // How wide the mask's pen is: wider than the stroke, so it reveals all of it.
  reveal: number;
  dry?: { d: string; width: number }[];
  duration: number;
  // The breath before it.
  pause: number;
  transform?: string;
};

const brush = (
  points: Point[],
  { size, seed, profile, thinning, dry, lift = 1, cap = true, emphasis = [] }: {
    size: number;
    seed: number;
    profile: Profile;
    thinning: number;
    dry?: number;
    lift?: number;
    cap?: boolean;
    emphasis?: Emphasis[];
  },
) => {
  const ink = inkStroke(points, { size, seed, profile, thinning, dry, lift, cap, emphasis, smoothing: 2, spacing: 1.5 });
  return { outline: ink.outline, center: ink.center, pace: ink.pace.join(","), reveal: size * 3.2, dry: ink.dry };
};

const length = (points: Point[]) =>
  points.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - points[i][0], p[1] - points[i][1]), 0);

// 朱竹: the culm a joint at a time, quick; the nodes flicked across; the
// leaves each one decisive sweep.
const thinning = { culm: 0.35, node: 0.7, branch: 0.6, leaf: 0.95 };
const lift = { culm: 0, node: 0.4, branch: 1.5, leaf: 1.2 };
const pauseBefore = { culm: 0.05, node: 0.08, branch: 0.16, leaf: 0.06 };
function bambooMarks(seed: number): Mark[] {
  let previous = "";
  return bamboo(seed).map((stroke, i) => {
    const mark: Mark = {
      ...brush(stroke.points, {
        size: stroke.size,
        seed: seed * 100 + i,
        profile: bambooProfiles[stroke.kind],
        thinning: thinning[stroke.kind],
        lift: stroke.tip ? 2.2 : lift[stroke.kind],
        dry: stroke.dry,
        cap: stroke.kind !== "culm" || stroke.tip,
      }),
      duration: stroke.kind === "culm" ? 0.26 : stroke.kind === "node" ? 0.1 : 0.12 + length(stroke.points) * 0.0016,
      // A longer breath between the parts of the painting than within them.
      pause: i === 0 ? 0.1 : stroke.kind !== previous ? 0.45 : pauseBefore[stroke.kind],
    };
    previous = stroke.kind;
    return mark;
  });
}

// 圓: one breath. Each take faces a new way.
function ensoMarks(seed: number): Mark[] {
  const rand = random(seed);
  const ring = ensoPath({ seed, facing: rand() * Math.PI * 2, gap: 0.1 + rand() * 0.1 }).map(
    ([x, y]) => [200 + (x - 50) * 3.3, 200 + (y - 50) * 3.3] as Point,
  );
  return [
    {
      ...brush(ring, {
        size: 34,
        seed,
        profile: profiles.enso,
        thinning: 0.8,
        dry: 0.5 + rand() * 0.1,
        lift: 3,
        emphasis: [
          { from: 0, to: 0.06, slow: 6 },
          { from: 0.08, to: 0.92, slow: 0.7 },
        ],
      }),
      duration: 1.5,
      pause: 0.2,
    },
  ];
}

// 道 in the font's own brush shapes (as on the homepage), stroke by stroke.
const RADICAL = 9;
const daoMarks: Mark[] = daoMedians.map((median, i) => {
  const line = resample(median as Point[], 8);
  const sweep = i === daoMedians.length - 1;
  return {
    outline: daoOutlines[i],
    center: centerline(line),
    pace: pace(line, 48, [
      { from: 0, to: 0.08, slow: 3 },
      { from: 0.88, to: 1, slow: sweep ? 4 : 2.5 },
    ]).join(","),
    reveal: 150,
    duration: (0.08 + length(line) * 0.0003) * (sweep ? 1.8 : 1),
    pause: i === 0 ? 0.15 : i === RADICAL ? 0.35 : sweep ? 0.14 : 0.09,
    transform: "translate(0 900) scale(1 -1)",
  };
});

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// The marks of one take, drawn in order once the plate is in view. A new
// take is drawn at once.
function Brushwork({ marks, viewBox, take }: { marks: Mark[]; viewBox: string; take: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const id = `study-${useId().replace(/:/g, "")}`;

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root || reduced()) return;
    const reveals = [...root.querySelectorAll<SVGPathElement>("[data-reveal]")];
    reveals.forEach((path) => (path.style.strokeDashoffset = "1"));
    const tl = gsap.timeline({ paused: true });
    reveals.forEach((path, i) => {
      draw(tl, path, { duration: marks[i].duration, ease: "none", position: i === 0 ? marks[0].pause : `>${marks[i].pause}` });
    });
    let observer: IntersectionObserver | undefined;
    if (take === 0) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          tl.play();
          observer?.disconnect();
        },
        { rootMargin: "0px 0px -25% 0px" },
      );
      observer.observe(root);
    } else {
      tl.play();
    }
    return () => {
      observer?.disconnect();
      tl.kill();
    };
  }, [marks, take]);

  // Each mask is rasterised whenever its stroke advances: keep its region to
  // the plate and a margin, not the whole canvas.
  const [, , w, h] = viewBox.split(" ").map(Number);
  const region = { x: -w * 0.25, y: -h * 0.25, width: w * 1.5, height: h * 1.5 };

  return (
    <svg ref={ref} className={`${front.ink} ${styles.art}`} viewBox={viewBox} aria-hidden="true" focusable="false">
      {marks.map((mark, i) => (
        <svg key={`${take}-${i}`} overflow="visible" data-pace={mark.pace}>
          <defs>
            <mask id={`${id}-${take}-${i}`} maskUnits="userSpaceOnUse" {...region}>
              <path
                d={mark.center}
                pathLength={1}
                data-reveal
                fill="none"
                stroke="#fff"
                strokeWidth={mark.reveal}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {mark.dry?.map((streak, k) => (
                <path key={k} d={streak.d} fill="none" stroke="#000" strokeWidth={streak.width} strokeLinecap="round" />
              ))}
            </mask>
          </defs>
          <g transform={mark.transform}>
            <path d={mark.outline} mask={`url(#${id}-${take}-${i})`} />
          </g>
        </svg>
      ))}
    </svg>
  );
}

type Study = {
  glyph: string;
  title: string;
  note: string;
  again: string;
  viewBox?: string;
  make?: (seed: number) => Mark[];
  portrait?: boolean;
};

const studies: Study[] = [
  {
    glyph: "竹",
    title: "Bamboo, in vermilion",
    note: "Su Shi once painted bamboo in red ink. Someone asked: is there such a thing as red bamboo? He asked back: is there such a thing as black bamboo? Culm, joints, branches, leaves, in the order they are painted; never the same stalk twice.",
    again: "Paint another",
    viewBox: `0 0 ${PLATE.width} ${PLATE.height}`,
    make: bambooMarks,
  },
  {
    glyph: "圓",
    title: "The circle",
    note: "One breath, one stroke. The brush lands hard, runs dry on the way round, and leaves the circle open. Each take faces a different way.",
    again: "Draw another",
    viewBox: "0 0 400 400",
    make: ensoMarks,
  },
  {
    glyph: "道",
    title: "The way",
    note: "Twelve strokes in the order a hand writes them: 首 first, then, after a breath, the walking radical — its long sweep last and slowest.",
    again: "Write it again",
    viewBox: "0 0 1024 1024",
    make: () => daoMarks,
  },
  {
    glyph: "像",
    title: "A face, as one line",
    note: "A single spiral from the rim to a point, after Claude Mellan’s engraving of 1649. There is no shading: the dark is only the line growing thicker.",
    again: "Draw it again",
    portrait: true,
  },
];

function Plate({ study, index }: { study: Study; index: number }) {
  const [take, setTake] = useState(0);
  // The first take is the same on server and client; later ones are new.
  const marks = useMemo(() => study.make?.(take === 0 ? 7 + index : Math.floor(Math.random() * 1e6)) ?? [], [study, take, index]);
  return (
    <figure className={styles.plate} data-side={index % 2 ? "right" : "left"}>
      <div className={styles.plateArt}>
        {study.portrait ? (
          <Portrait key={take} when="visible" className={styles.platePortrait} />
        ) : (
          <Brushwork marks={marks} viewBox={study.viewBox!} take={take} />
        )}
      </div>
      <figcaption className={styles.plateCaption}>
        <span className={styles.plateGlyph} lang="zh-Hant" aria-hidden="true">
          {study.glyph}
        </span>
        <span className={front.index}>0{index + 1}</span>
        <h2 className={styles.plateTitle}>{study.title}</h2>
        <p>{study.note}</p>
        <button type="button" className={styles.again} onClick={() => setTake((n) => n + 1)}>
          {study.again} <span aria-hidden="true">↻</span>
        </button>
      </figcaption>
    </figure>
  );
}

export default function Studies() {
  return (
    <div className={styles.plates}>
      {studies.map((study, index) => (
        <Plate key={study.glyph} study={study} index={index} />
      ))}
    </div>
  );
}
