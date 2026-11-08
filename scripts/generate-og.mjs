import fs from "node:fs";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import matter from "gray-matter";
import ts from "typescript";

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

// The share image carries the same name, spiral face, and red horizon as the page.
// The page's own type, as static files (OFL; see scripts/fonts/*-OFL.txt).
const wide = fs.readFileSync(path.join("scripts", "fonts", "Sprat-ExtendedBlack.otf"));
const regular = fs.readFileSync(path.join("scripts", "fonts", "Junicode-Regular.ttf"));

// These two fixed source modules export only portrait data and pure geometry.
// Transpilation removes their type-only imports so Node 18 can reuse them.
async function portraitSource(name) {
  const source = fs.readFileSync(path.join("components", "personal", name), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

async function portraitFallback() {
  const [{ portrait }, { spiralPath, decodeTones }] = await Promise.all([
    portraitSource("portrait.ts"),
    portraitSource("spiral.ts"),
  ]);
  const points = spiralPath(portrait).reverse();
  const tones = decodeTones(portrait.tones, portrait.count).reverse();
  const pitch = portrait.radius / portrait.turns;
  const paths = Array.from({ length: 16 }, () => []);

  for (let i = 0; i < points.length - 1; i += 1) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const tone = Math.round(tones[i] * 15);
    paths[tone].push(`M${x0.toFixed(3)} ${y0.toFixed(3)}L${x1.toFixed(3)} ${y1.toFixed(3)}`);
  }

  const half = portrait.radius * 1.02;
  const marks = paths.map((segments, tone) => {
    const width = 0.35 + (0.92 * pitch - 0.35) * tone / 15;
    return `<path d="${segments.join("")}" stroke-width="${width}"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="${-half} ${-half} ${half * 2} ${half * 2}"><g fill="none" stroke="#a3121b" stroke-linecap="butt">${marks}</g><circle r="1.8" fill="#a3121b"/></svg>`;
  fs.writeFileSync(path.join(OUT, "face.png"), new Resvg(svg).render().asPng());
}

async function portraitCard() {
  const red = "#a3121b";
  const ink = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><path d="M86 304C274 306 481 300 724 303" fill="none" stroke="${red}" stroke-width="4.5" stroke-linecap="round"/></svg>`;
  const face = fs.readFileSync(path.join(OUT, "face.png"));
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
      {
        type: "img",
        props: {
          src: `data:image/png;base64,${face.toString("base64")}`,
          width: 360,
          height: 360,
          style: { position: "absolute", left: 790, top: 128 },
        },
      },
      el(
        "div",
        {
          position: "absolute",
          left: 80,
          top: 172,
          fontFamily: "Sprat",
          fontSize: 100,
          letterSpacing: -3,
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
          fontFamily: "Junicode",
          fontSize: 21,
          color: "#6b6760",
        },
        [
          el("div", {}, "Consciousness, self-awareness, and imagination."),
          el("div", { marginTop: 6 }, "Writing, software, and living with love."),
        ],
      ),
      el(
        "div",
        { position: "absolute", left: 86, bottom: 56, fontFamily: "Junicode", fontSize: 18, letterSpacing: 2.5, color: "#6b6760" },
        "@COMMA_9FIE · KUMMA.ME",
      ),
    ],
  );
  const svg = await satori(node, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Sprat", data: wide, weight: 800, style: "normal" },
      { name: "Junicode", data: regular, weight: 400, style: "normal" },
    ],
  });
  fs.writeFileSync(path.join(OUT, "portrait.png"), new Resvg(svg).render().asPng());
}

const projects = [
  { slug: "kota", title: "KOTA", sub: "Voice agent for restaurant operations" },
  { slug: "archon", title: "ARCHON", sub: "Orchestrates Claude, GPT, and Gemini" },
];

async function run() {
  await portraitFallback();
  await portraitCard();
  await card("default", "Consciousness and imagination.", "Kumma Wu", "Writing, software, and questions about living with love");
  await card("home", "Consciousness and imagination.", "Kumma Wu", "Writing, software, and questions about living with love");
  for (const p of projects) {
    await card(`projects-${p.slug}`, p.title, "Selected work", p.sub);
  }

  const seen = new Set();
  for (const dir of ["_posts", path.join("_posts", "zh")]) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".md") || f === "market-systems-decision-quality.md") continue;
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
