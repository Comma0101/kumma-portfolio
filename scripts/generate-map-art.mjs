// Author the two Map Art plates from the existing Reliquary street geometry.
// Run manually with the map-art checkout path. The site builds from committed
// SVGs and never needs access to that checkout or a live map service.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { Resvg } from "@resvg/resvg-js";

const sourceRoot = process.argv[2];
if (!sourceRoot) throw new Error("Pass the existing map-art checkout as the first argument.");
const output = path.resolve("public/art/map-art");
fs.mkdirSync(output, { recursive: true });

// Reuse the source project's decoder and projection without changing its files.
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "kumma-map-source-"));
let decodeCityPack;
let projectCity;
let buildMediumGeometry;
try {
  for (const name of ["types", "lib/geometry", "lib/cityPackCodec", "lib/mediumGeometry"]) {
    const input = fs.readFileSync(path.join(sourceRoot, "src", `${name}.ts`), "utf8");
    const destination = path.join(scratch, `${name}.js`);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, ts.transpileModule(input, {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
    }).outputText);
  }
  const require = createRequire(import.meta.url);
  ({ decodeCityPack } = require(path.join(scratch, "lib/cityPackCodec.js")));
  ({ projectCity } = require(path.join(scratch, "lib/geometry.js")));
  ({ buildMediumGeometry } = require(path.join(scratch, "lib/mediumGeometry.js")));
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

const sourcePacks = ["amsterdam-canal-ring.ctpk", "los-angeles-county.ctpk"].map((file) => {
  const bytes = fs.readFileSync(path.join(sourceRoot, "public/data/citypacks", file));
  const city = decodeCityPack(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  return { file, city, sha256: crypto.createHash("sha256").update(bytes).digest("hex") };
});
const [amsterdam, county] = sourcePacks.map((source) => source.city);

// Keep contiguous source vertices within each area. Boundary strands end at
// their last included OSM node. These rectangles are artistic crops.
function cropCity(city, name, bounds) {
  const [south, west, north, east] = bounds;
  const nodes = [];
  const ways = [];
  const references = new Map();
  for (const way of city.ways) {
    let strand = [];
    function finish() {
      if (strand.length > 1) ways.push({ ...way, nodes: strand });
      strand = [];
    }
    for (const index of way.nodes) {
      const [longitude, latitude] = city.nodes[index];
      if (latitude < south || latitude > north || longitude < west || longitude > east) {
        finish();
        continue;
      }
      if (!references.has(index)) {
        references.set(index, nodes.length);
        nodes.push(city.nodes[index]);
      }
      strand.push(references.get(index));
    }
    finish();
  }
  if (!ways.length) throw new Error(`No street geometry in ${name}.`);
  return { ...city, name, bounds, nodes, ways };
}

const areas = {
  amsterdam,
  "los-angeles": cropCity(county, "Los Angeles area", [33.95, -118.40, 34.15, -118.12]),
  pasadena: cropCity(county, "Pasadena area", [34.12, -118.20, 34.20, -118.07]),
  "long-beach": cropCity(county, "Long Beach area", [33.73, -118.24, 33.87, -118.10]),
};

const widths = { water: 1.1, path: 0.65, local: 0.8, collector: 1.25, artery: 1.9 };
function streetSymbol(id, city) {
  const model = projectCity(city);
  const medium = buildMediumGeometry(city, model.nodes);
  const marks = Object.entries(widths).map(([kind, width]) => (
    `<path d="${model.pathData[kind]}" stroke-width="${width}"${kind === "water" ? ' opacity="0.38"' : ""}/>`
  )).join("");
  const handwriting = medium.handwriting.strokes.map((stroke) => `<path d="${stroke.ribbonPath}"/>`).join("");
  return `<g id="${id}"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" opacity="0.34">${marks}</g><g fill="currentColor" opacity="0.78">${handwriting}</g></g>`;
}

const ink = "#141414";
const red = "#a3121b";
const paper = "#f2efe8";
const provenance = "Illustrative histories. Real OpenStreetMap street geometry, independently fitted. Authored connecting gestures. Data © OpenStreetMap contributors, ODbL 1.0. Artwork by Kumma Wu.";
const font = { fontFiles: [path.resolve("scripts/fonts/Junicode-Regular.ttf")], defaultFontFamily: "Junicode", loadSystemFonts: false };

const symbols = Object.fromEntries(Object.entries(areas).map(([id, city]) => [id, streetSymbol(id, city)]));
for (const [id, symbol] of Object.entries(symbols)) {
  const color = id === "amsterdam" ? red : ink;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" style="color:${color}">${symbol.replace(`id="${id}"`, "")}</svg>`;
  fs.writeFileSync(path.join(output, `${id}.png`), new Resvg(svg, { font }).render().asPng());
}

const compiled = ts.transpileModule(fs.readFileSync("components/personal/mapArt.ts", "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
}).outputText;
const { mapArtStudies } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const plates = {};
for (const [id, study] of Object.entries(mapArtStudies)) {
  const { title, description, width, height, layers, labels, threads } = study;
  const definitions = layers.map((layer) => symbols[layer.city]).join("");
  const impressions = layers.map((layer) => (
    `<g transform="translate(${layer.x} ${layer.y}) scale(${layer.size / 1000})" style="color:${layer.city === "amsterdam" ? red : ink}" opacity="${layer.opacity}"><use href="#${layer.city}"/></g>`
  )).join("");
  const connections = `<g fill="none" stroke="${red}" stroke-width="2" stroke-linecap="round">${threads.map((d) => `<path d="${d}"/>`).join("")}</g>`;
  const names = `<g font-family="Junicode,Georgia,serif" font-size="35">${labels.map((label) => `<text x="${label.x}" y="${label.y}" text-anchor="${label.anchor === "start" ? "start" : "end"}" dominant-baseline="${label.anchor === "bottom-end" ? "auto" : "hanging"}" fill="${label.red ? red : ink}">${label.name}</text>`).join("")}</g>`;
  const footer = `<g font-family="Junicode,Georgia,serif" font-size="17" fill="${ink}"><a href="https://www.openstreetmap.org/copyright"><text x="36" y="${height + 25}">Map data from OpenStreetMap contributors · ODbL 1.0</text></a><text x="36" y="${height + 47}">Illustrative histories · Independently fitted places · Kumma Wu</text></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height + 64}" viewBox="0 0 ${width} ${height + 64}" role="img" aria-labelledby="${id}-title ${id}-description"><title id="${id}-title">${title}</title><desc id="${id}-description">${description}</desc><metadata>${provenance}</metadata><rect width="100%" height="100%" fill="${paper}"/><defs>${definitions}</defs>${impressions}${connections}${names}${footer}</svg>`;
  plates[id] = svg;
  fs.writeFileSync(path.join(output, `${id}.svg`), svg);
  if (id === "one-life") {
    const preview = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${svg}</svg>`;
    fs.writeFileSync(path.join(output, `${id}.png`), new Resvg(preview, { font }).render().asPng());
  }
}

// A real artwork crop supplies the page's share image.
const shareArtwork = plates["one-life"].replace(/<g font-family="Junicode,Georgia,serif" font-size="35">.*?<\/g>/, "");
const shareSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${paper}"/><g transform="translate(420 -80) scale(0.65)">${shareArtwork}</g><g fill="${ink}" font-family="Junicode,Georgia,serif"><text x="75" y="260" font-size="85">Map Art</text><text x="80" y="330" font-size="29">Places we have called home.</text><text x="80" y="550" font-size="24">Kumma Wu · kumma.me</text></g></svg>`;
fs.writeFileSync(path.join(output, "share.png"), new Resvg(shareSvg, { font }).render().asPng());

// Pillow is an authoring dependency only. Lossless WebP keeps thin map marks
// and transparency intact while avoiding multi-megabyte SVGs in page rendering.
execFileSync("python3", ["-c", `
from pathlib import Path
from PIL import Image
import sys
root = Path(sys.argv[1])
for source in root.glob('*.png'):
    if source.stem == 'share':
        continue
    Image.open(source).save(source.with_suffix('.webp'), lossless=True, method=6)
    source.unlink()
`, output]);

fs.writeFileSync(path.join(output, "provenance.json"), JSON.stringify({
  author: "Kumma Wu",
  data: "© OpenStreetMap contributors, ODbL 1.0",
  copyright: "https://www.openstreetmap.org/copyright",
  license: "https://opendatacommons.org/licenses/odbl/1-0/",
  renderer: "Reliquary projectCity, decodeCityPack and buildMediumGeometry handwriting, reused without modification",
  histories: "Authored illustrative compositions. No personal or participant location records.",
  scale: "Each area is independently fitted. Positions and connecting lines are authored.",
  sourcePacks: sourcePacks.map(({ file, city, sha256 }) => ({ file, sha256, bounds: city.bounds, snapshot: city.snapshot, detail: city.loadedRoadDetail })),
  areas: Object.entries(areas).map(([id, city]) => ({ id, name: city.name, bounds: city.bounds, ways: city.ways.length })),
}, null, 2) + "\n");
console.log(JSON.stringify({ output, plates: 2, areas: Object.keys(areas) }));
