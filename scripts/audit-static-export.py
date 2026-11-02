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
        self.collect = False
        self.parts = []
        self.feed(path.read_text(encoding="utf-8"))
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])
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
assert pages[target("/view/")].meta["robots"] == ["noindex, follow"]
retired = pages[target("/projects/market-systems/")]
assert "noindex" in retired.meta["robots"][0]
assert retired.canonical == "https://kumma.me/work/"
assert "/work/" in retired.links
contact = pages[target("/contact/")]
assert contact.meta["description"] == contact.meta["og:description"] == contact.meta["twitter:description"]
assert (root / "CNAME").read_text().strip() == "kumma.me"
ET.parse(root / "sitemap.xml")
ET.parse(root / "feed.xml")
for name in ("llms.txt", "llms-full.txt"):
    assert (root / name).read_bytes() == (repo / "public" / name).read_bytes()
print(json.dumps({"html_pages": len(pages), "internal_links_checked": checked, "legacy_moves": len(moves), "broken_links": len(broken), "metadata": "pass", "retired_project": "generic Work move", "domain": "kumma.me"}))
