"""Subset the homepage's two Chinese faces to the characters it sets.

Noto Serif TC is the printed voice (the sutra); LXGW WenKai TC is the hand
(beside 道, and the margin navigation). Both carry the same characters, so
one manifest and one test cover them. Re-run after changing any Chinese
text in components/personal/:

    pip install fonttools brotli
    python scripts/subset-cjk.py --noto path/to/NotoSerifTC[wght].ttf \
                                 --wenkai path/to/LXGWWenKaiTC-Regular.ttf

Either flag may be given alone. Sources (SIL Open Font License):
github.com/google/fonts ofl/notoseriftc; github.com/lxgw/LxgwWenkaiTC.
"""

import argparse
import pathlib
import re

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCES = ROOT / "components" / "personal"
FONTS = SOURCES / "fonts"
# The characters covered, so a test can catch text added without re-subsetting.
MANIFEST = FONTS / "NotoSerifTC-subset.txt"

cjk = re.compile(r"[　-〿㐀-鿿＀-￯]")
text = set()
for path in SOURCES.glob("*.tsx"):
    text.update(cjk.findall(path.read_text(encoding="utf-8")))
chars = "".join(sorted(text))


def write(source: str, out: pathlib.Path):
    font = TTFont(source)
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=chars)
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(out)
    print(f"{len(text)} characters -> {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")


parser = argparse.ArgumentParser()
parser.add_argument("--noto")
parser.add_argument("--wenkai")
args = parser.parse_args()
if args.noto:
    write(args.noto, FONTS / "NotoSerifTC-subset.woff2")
if args.wenkai:
    write(args.wenkai, FONTS / "LXGWWenKaiTC-subset.woff2")
MANIFEST.write_text(chars + "\n", encoding="utf-8")
