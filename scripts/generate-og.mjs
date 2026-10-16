import fs from "node:fs";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import matter from "gray-matter";
import { getStroke } from "perfect-freehand";

const OUT = path.join("public", "og");
fs.mkdirSync(OUT, { recursive: true });
const font = fs.readFileSync(
  path.join("public", "fonts", "SpaceGrotesk-SemiBold.ttf"),
);

function el(type, style, children) {
  return {
    type,
    props: { style, ...(children !== undefined ? { children } : {}) },
  };
}

async function card(key, title, kicker, sub) {
  const node = el(
    "div",
    {
      width: 1200,
      height: 630,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 80,
      backgroundColor: "#0a0a0b",
      color: "#f0ede8",
      fontFamily: "Space Grotesk",
    },
    [
      el(
        "div",
        { color: "#3f9d7f", fontSize: 28, letterSpacing: 4, textTransform: "uppercase" },
        kicker,
      ),
      el("div", { fontSize: 72, lineHeight: 1.05, maxWidth: 1040 }, title),
      el("div", { display: "flex", flexDirection: "column" }, [
        el(
          "div",
          { color: "#a3b5a8", fontSize: 34, maxWidth: 1040, marginBottom: 14 },
          sub || "",
        ),
        el("div", { color: "#a4a09a", fontSize: 28 }, "kumma.me"),
      ]),
    ],
  );
  const svg = await satori(node, {
    width: 1200,
    height: 630,
    fonts: [{ name: "Space Grotesk", data: font, weight: 600, style: "normal" }],
  });
  const png = new Resvg(svg).render().asPng();
  fs.writeFileSync(path.join(OUT, `${key}.png`), png);
}

// The homepage card is the page's signature, made of the same pen: paper,
// the name, and one red line that runs out from under it into 無, written
// in stroke order (components/personal/wu.ts). This is the image that
// travels when kumma.me is posted on X.
const wide = fs.readFileSync(path.join("scripts", "fonts", "Archivo-WideHeavy.ttf"));
const regular = fs.readFileSync(path.join("scripts", "fonts", "Archivo-Regular.ttf"));

// An exported array literal from wu.ts, by name.
function wuArray(name) {
  const src = fs.readFileSync(path.join("components", "personal", "wu.ts"), "utf8");
  const from = src.indexOf("= [", src.indexOf(`export const ${name}`)) + 2;
  const to = src.indexOf("\n];", from) + 2;
  return JSON.parse(src.slice(from, to).replace(/,\s*\]$/, "]"));
}
const wuStrokes = () => wuArray("wu");

// Dense samples at steady pressure: the stroke data is a few centreline
// points, and simulated pressure on so few points wobbles.
function dense(points, step = 3) {
  const out = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
    for (let k = 1; k <= n; k += 1) out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
  }
  return out.map(([x, y]) => [x, y, 0.62]);
}

function outline(points, size, { start = size * 2, end = size * 3 } = {}) {
  const stroke = getStroke(dense(points), {
    size,
    thinning: 0.5,
    smoothing: 0.6,
    streamline: 0.3,
    simulatePressure: false,
    start: { taper: start, cap: true },
    end: { taper: end, cap: true },
  });
  return `M ${stroke.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} Z`;
}

function line(from, to, steps = 12, bow = 0) {
  const out = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    out.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t + Math.sin(Math.PI * t) * bow]);
  }
  return out;
}

async function portraitCard() {
  const red = "#a3121b";
  // 無 sits in its own square on the right, clear of the name.
  const box = { x: 800, y: 96, s: 360 };
  const at = ([x, y]) => [box.x + (x * box.s) / 100, box.y + (y * box.s) / 100];
  const strokes = wuStrokes().map((stroke) => stroke.map(at));
  // The thread: under the name, then down and across into the first stroke.
  const first = strokes[0][0];
  // One curve: along under the name, then rising into 無's first stroke.
  const under = 300;
  const thread = [...line([86, under], [640, under - 4], 18, 1.5)];
  const [cx, cy] = [first[0] - 70, under - 10];
  for (let i = 1; i <= 24; i += 1) {
    const t = i / 24;
    const [x0, y0] = [640, under - 4];
    thread.push([
      (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * first[0],
      (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * first[1],
    ]);
  }
  const marks = [
    `<path d="${outline(thread, 6, { start: 14, end: 0 })}"/>`,
    // The font's own brush shapes, as the page writes them (Wu).
    `<g transform="translate(${box.x} ${box.y + (900 * box.s) / 1024}) scale(${box.s / 1024} ${-box.s / 1024})">${wuArray("wuOutlines")
      .map((d) => `<path d="${d}"/>`)
      .join("")}</g>`,
  ].join("");
  const ink = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><g fill="${red}">${marks}</g></svg>`;
  const node = el(
    "div",
    {
      width: 1200,
      height: 630,
      display: "flex",
      position: "relative",
      backgroundColor: "#f2efe8",
      color: "#141414",
    },
    [
      {
        type: "img",
        props: {
          src: `data:image/svg+xml;base64,${Buffer.from(ink).toString("base64")}`,
          width: 1200,
          height: 630,
          style: { position: "absolute", left: 0, top: 0 },
        },
      },
      el(
        "div",
        {
          position: "absolute",
          left: 80,
          top: 140,
          fontFamily: "Archivo Wide",
          fontSize: 150,
          letterSpacing: -7,
          lineHeight: 1,
        },
        "Kumma",
      ),
      el(
        "div",
        {
          position: "absolute",
          left: 86,
          top: 350,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Archivo",
          fontSize: 19,
          color: "#6b6760",
        },
        [
          el("div", {}, "In the gym most days. Trading options."),
          el("div", { marginTop: 6 }, "Attention goes where it compounds."),
        ],
      ),
      el(
        "div",
        { position: "absolute", left: 86, bottom: 56, fontFamily: "Archivo", fontSize: 18, letterSpacing: 2.5, color: "#6b6760" },
        "@COMMA_9FIE · KUMMA.ME",
      ),
    ],
  );
  const svg = await satori(node, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Archivo Wide", data: wide, weight: 800, style: "normal" },
      { name: "Archivo", data: regular, weight: 400, style: "normal" },
    ],
  });
  fs.writeFileSync(path.join(OUT, "portrait.png"), new Resvg(svg).render().asPng());
}

const projects = [
  { slug: "kota", title: "KOTA", sub: "Voice agent for restaurant operations" },
  { slug: "archon", title: "ARCHON", sub: "Orchestrates Claude, GPT, and Gemini" },
  { slug: "market-systems", title: "Market Systems", sub: "Decision architecture under uncertainty" },
];

async function run() {
  await portraitCard();
  await card("default", "Intelligent systems for the real world.", "Kumma", "Real-time AI, voice agents, agent orchestration");
  await card("home", "I build intelligent systems for the real world.", "Kumma", "KOTA, ARCHON, and real-time AI systems");
  for (const p of projects) {
    await card(`projects-${p.slug}`, p.title, "Selected work", p.sub);
  }

  const seen = new Set();
  for (const dir of ["_posts", path.join("_posts", "zh")]) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".md")) continue;
      const slug = f.replace(/\.md$/, "");
      if (seen.has(slug)) continue;
      seen.add(slug);
      const fm = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      const title = fm.data.title || slug.replace(/[-_]/g, " ");
      await card(`blog-${slug}`, title, "Essay");
    }
  }
  console.log(`OG cards generated: ${fs.readdirSync(OUT).length}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
