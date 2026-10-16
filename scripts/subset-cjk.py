"""Subset Noto Serif TC to the CJK characters the homepage actually sets.

The full font ships as ~200 unicode-range chunks; a handful of characters
pulled in ~1 MB. Re-run after changing any Chinese text in
components/personal/:

    pip install fonttools brotli
    python scripts/subset-cjk.py path/to/NotoSerifTC[wght].ttf

Source: github.com/google/fonts ofl/notoseriftc (SIL Open Font License).
"""

import pathlib
import re
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCES = ROOT / "components" / "personal"
OUT = SOURCES / "fonts" / "NotoSerifTC-subset.woff2"
# The characters covered, so a test can catch text added without re-subsetting.
MANIFEST = OUT.with_suffix(".txt")

cjk = re.compile(r"[　-〿㐀-鿿＀-￯]")
text = set()
for path in SOURCES.glob("*.tsx"):
    text.update(cjk.findall(path.read_text(encoding="utf-8")))

font = TTFont(sys.argv[1])
options = subset.Options()
options.flavor = "woff2"
options.layout_features = ["*"]
options.name_IDs = ["*"]
options.notdef_outline = True
subsetter = subset.Subsetter(options)
subsetter.populate(text="".join(sorted(text)))
subsetter.subset(font)
font.flavor = "woff2"
font.save(OUT)
MANIFEST.write_text("".join(sorted(text)) + "\n", encoding="utf-8")
print(f"{len(text)} characters -> {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")
