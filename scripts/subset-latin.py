"""Subset the homepage's two Latin faces, keeping their variable axes.

Sprat (Collletttivo) is the display voice: width 100-200, weight 10-200.
Junicode 2 (Peter S. Baker) is the text voice: roman and italic, weight
300-700, with small caps and old-style figures. Its width and Enlarge axes
are not used, so they are pinned after subsetting (halves the files).

    pip install fonttools brotli
    python scripts/subset-latin.py --sprat path/to/SpratVF.woff2 \
        --junicode path/to/JunicodeVF-Roman.woff2 \
        --junicode-italic path/to/JunicodeVF-Italic.woff2

Sources (SIL Open Font License): github.com/collletttivo/sprat;
github.com/psb1558/Junicode-font.
"""

import argparse
import pathlib

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = ROOT / "components" / "personal" / "fonts"

# Basic Latin, Latin-1, the macrons in Kumārajīva, and the punctuation set.
TEXT = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + "".join(chr(c) for c in range(0xA0, 0x100))
    + "āīūĀĪŪ‘’“”—–…→↗·•©"
)
FEATURES = ["kern", "liga", "clig", "calt", "smcp", "c2sc", "onum", "lnum", "pnum", "tnum", "ss01"]


def write(source: str, name: str, pin: dict | None = None):
    font = TTFont(source)
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = FEATURES
    options.name_IDs = ["*"]
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=TEXT)
    subsetter.subset(font)
    # Pin unused axes once the tables are small (the full italic overflows).
    if pin:
        font = instantiateVariableFont(font, pin)
    font.flavor = "woff2"
    out = FONTS / name
    font.save(out)
    print(f"-> {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")


parser = argparse.ArgumentParser()
parser.add_argument("--sprat")
parser.add_argument("--junicode")
parser.add_argument("--junicode-italic")
args = parser.parse_args()
if args.sprat:
    write(args.sprat, "Sprat-subset.woff2")
if args.junicode:
    write(args.junicode, "Junicode-subset.woff2", {"wdth": 100, "ENLA": 0})
if args.junicode_italic:
    write(args.junicode_italic, "Junicode-Italic-subset.woff2", {"wdth": 100, "ENLA": 0})
