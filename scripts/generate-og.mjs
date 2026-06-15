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

const projects = [
  { slug: "kota", title: "KOTA", sub: "Voice agent for restaurant operations" },
  { slug: "archon", title: "ARCHON", sub: "Orchestrates Claude, GPT, and Gemini" },
  { slug: "market-systems", title: "Market Systems", sub: "Decision architecture under uncertainty" },
];

async function run() {
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
