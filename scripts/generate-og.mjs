import fs from "node:fs";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import matter from "gray-matter";

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

// Keep in sync with data/workProjects.ts; data/discoveryRoutes.test.ts
// enforces that every catalog slug appears here.
const workCards = [
  { slug: "kota", title: "KOTA", sub: "Real-time voice ordering that survives messy speech" },
  { slug: "audiobook", title: "Audiobook AI", sub: "Production TTS pipeline from document to audiobook" },
  { slug: "archon", title: "ARCHON", sub: "Multi-model agent orchestration control plane" },
  { slug: "splash-ink", title: "Splash Ink", sub: "Single-image 3D Gaussian Splatting research" },
  { slug: "spectral-world", title: "Spectral World Player", sub: "Web Audio analysis driving a living 3D world" },
  { slug: "robinhood-dashboard", title: "Robinhood Data Correctness", sub: "Messy brokerage CSV to inspectable ledger" },
];

async function run() {
  await card("default", "Production AI systems that survive real inputs.", "Kumma", "Audits, builds, and advisory for production AI");
  await card("home", "Production AI systems that survive real inputs.", "Kumma", "Real-time voice, agent orchestration, and reliable pipelines");
  await card("work", "Production AI systems — work and case studies", "Kumma", "Voice, orchestration, TTS, 3D research, data correctness");
  for (const p of workCards) {
    await card(`work-${p.slug}`, p.title, "Work / case study", p.sub);
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
