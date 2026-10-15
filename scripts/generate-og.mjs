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

// The homepage card matches the X profile: paper, ink, one red, the portrait.
async function portraitCard() {
  const portrait = fs.readFileSync(path.join("public", "kumma", "portrait.jpg"));
  const src = `data:image/jpeg;base64,${portrait.toString("base64")}`;
  const node = el(
    "div",
    {
      width: 1200,
      height: 630,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 90px",
      backgroundColor: "#f2efe8",
      color: "#141414",
      fontFamily: "Space Grotesk",
    },
    [
      el("div", { display: "flex", flexDirection: "column", maxWidth: 720 }, [
        el("div", { fontSize: 168, letterSpacing: -8, lineHeight: 0.9 }, "Kumma"),
        el("div", { width: 420, height: 8, backgroundColor: "#a3121b", margin: "22px 0 40px", borderRadius: 4 }),
        el("div", { fontSize: 32, color: "#3b3936" }, "In the gym most days. Trading options."),
        el("div", { fontSize: 46, marginTop: 14, lineHeight: 1.05 }, "Attention goes where it compounds."),
        el("div", { fontSize: 26, marginTop: 36, color: "#a3121b" }, "@Comma_9fie · kumma.me"),
      ]),
      {
        type: "img",
        props: {
          src,
          width: 330,
          height: 330,
          style: { borderRadius: 330, border: "6px solid #a3121b", padding: 10 },
        },
      },
    ],
  );
  const svg = await satori(node, {
    width: 1200,
    height: 630,
    fonts: [{ name: "Space Grotesk", data: font, weight: 600, style: "normal" }],
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
