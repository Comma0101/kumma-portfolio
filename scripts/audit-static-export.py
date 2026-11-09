#!/usr/bin/env python3
"""Validate the production static export before publication (stdlib only)."""

from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
import json
import re
import xml.etree.ElementTree as ET

repo = Path(__file__).resolve().parents[1]
root = repo / "out"
if not (root / "index.html").is_file():
    raise SystemExit("Static export missing. Run npm run build before npm run audit:export.")

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.meta, self.links, self.ids, self.ld = {}, [], set(), []
        self.canonical = None
        self.images, self.contributions = [], {}
        self.collect = False
        self.parts = []
        self.feed(path.read_text(encoding="utf-8"))
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])
        if tag == "img" and a.get("src"):
            self.images.append(a["src"])
        if tag == "figure" and a.get("data-contribution-place"):
            self.contributions[a["data-contribution-place"]] = a.get("data-contribution-source")
        if tag == "meta":
            key = a.get("name") or a.get("property")
            if key:
                self.meta.setdefault(key, []).append(a.get("content", ""))
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href")
        if tag == "script" and a.get("type") == "application/ld+json":
            self.collect, self.parts = True, []
    def handle_data(self, text):
        if self.collect:
            self.parts.append(text)
    def handle_endtag(self, tag):
        if tag == "script" and self.collect:
            self.ld.append(json.loads("".join(self.parts)))
            self.collect = False

pages = {path: Page(path) for path in root.rglob("*.html")}

def target(path):
    p = root / unquote(path).lstrip("/")
    return p if p.is_file() else p / "index.html"

broken, checked = [], 0
for path, page in pages.items():
    relative = path.relative_to(root).as_posix()
    url = "https://kumma.me/" + relative.removesuffix("index.html")
    for href in page.links:
        parsed = urlsplit(urljoin(url, href))
        if parsed.scheme not in ("http", "https") or parsed.hostname != "kumma.me":
            continue
        checked += 1
        if not target(parsed.path).is_file():
            broken.append({"page": relative, "href": href})
assert not broken, json.dumps(broken, ensure_ascii=False)

moves = re.findall(r'^\s*"([^"]+)": \{ to: "([^"]+)"', (repo / "components/personal/routes.ts").read_text(encoding="utf-8"), re.M)
for old, new in moves:
    assert target(old).is_file(), old
    assert target(new).is_file(), new

home = pages[root / "index.html"]
assert all(term in home.meta["description"][0] for term in ("consciousness", "self-awareness"))
assert home.meta["description"] == home.meta["og:description"] == home.meta["twitter:description"]
assert len(home.ld) == 1 and home.ld[0]["@graph"][0]["@type"] == "Person"
assert home.ld[0]["@graph"][0]["knowsAbout"][:2] == ["Consciousness", "Self-awareness"]
assert all(href in home.links for href in ("/work/", "/notes/", "mailto:dev@kumma.me"))
assert len(home.ids.intersection({"name", "agency", "catch-up", "steps", "practice", "rules", "reason", "dao"})) == 8
assert home.contributions == {"reflection": "authored", "ending": "authored"}
assert "/og/face.png" in home.images
face = (root / "og/face.png").read_bytes()
assert face[:8] == b"\x89PNG\r\n\x1a\n"
assert int.from_bytes(face[16:20], "big") == 600
assert int.from_bytes(face[20:24], "big") == 600
assert pages[target("/view/")].meta["robots"] == ["noindex, follow"]
retired = pages[target("/projects/market-systems/")]
assert "noindex" in retired.meta["robots"][0]
assert retired.canonical == "https://kumma.me/work/"
assert "/work/" in retired.links
contact = pages[target("/contact/")]
assert contact.meta["description"] == contact.meta["og:description"] == contact.meta["twitter:description"]
assert (root / "CNAME").read_text().strip() == "kumma.me"
ET.parse(root / "sitemap.xml")
sitemap_urls = {node.text.rstrip("/") for node in ET.parse(root / "sitemap.xml").iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")}
for draft in ("/benchmark/", "/call/"):
    assert "noindex" in pages[target(draft)].meta["robots"][0]
    assert f"https://kumma.me{draft}".rstrip("/") not in sitemap_urls
assert not pages[target("/benchmark/")].ld
assert pages[target("/call/")].canonical == "https://kumma.me/work/kota/"
map_art = pages[target("/work/map-art/")]
assert map_art.canonical.rstrip("/") == "https://kumma.me/work/map-art"
assert map_art.meta["description"] == map_art.meta["og:description"] == map_art.meta["twitter:description"]
assert "/work/map-art/" in pages[target("/work/")].links
assert "https://kumma.me/work/map-art" in sitemap_urls
for study in ("one-life", "shared-places"):
    svg_path = f"/art/map-art/{study}.svg"
    assert svg_path in map_art.links
    svg = ET.parse(root / svg_path.lstrip("/")).getroot()
    description = svg.find("{http://www.w3.org/2000/svg}desc").text or ""
    assert any(term in description.lower() for term in ("illustrative", "imagined"))
    assert "OpenStreetMap" in svg.find("{http://www.w3.org/2000/svg}metadata").text
    visible_credit = " ".join(node.text or "" for node in svg.iter("{http://www.w3.org/2000/svg}text"))
    assert "Map data from OpenStreetMap contributors" in visible_credit
    assert "Illustrative histories" in visible_credit
for city in ("amsterdam", "los-angeles", "pasadena", "long-beach"):
    image = (root / f"art/map-art/{city}.webp").read_bytes()
    assert image[:4] == b"RIFF" and image[8:12] == b"WEBP"
ET.parse(root / "feed.xml")
for name in ("llms.txt", "llms-full.txt"):
    assert (root / name).read_bytes() == (repo / "public" / name).read_bytes()
print(json.dumps({"html_pages": len(pages), "internal_links_checked": checked, "legacy_moves": len(moves), "broken_links": len(broken), "metadata": "pass", "retired_project": "generic Work move", "domain": "kumma.me"}))
