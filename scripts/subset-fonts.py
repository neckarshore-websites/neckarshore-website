#!/usr/bin/env python3
"""
Subset Inter Variable + Space Grotesk Variable for neckarshore-website.

Re-run only when source fonts change. Output files are committed to git.

Usage:
    python3 -m venv /tmp/font-venv
    /tmp/font-venv/bin/pip install fonttools brotli
    /tmp/font-venv/bin/python scripts/subset-fonts.py

Strategy:
- Inter (Variable): limit `wght` axis to 400-700 (was 100-900),
  pin `opsz` to default 14 (removing axis variability for body sizes).
  Used weights per codebase grep: font-medium (500), font-semibold (600),
  font-bold (700), plus default 400 (body).
- Space Grotesk (Variable): limit `wght` axis to 400-700 (was 300-700).
  Headings via Tailwind use 500-700, default 400 for safety.

Both source fonts already have tight Latin coverage. No glyph subsetting
needed — only axis-range narrowing via `instantiateVariableFont`.

Ported from goldoni-website 2026-05-14 (L-T4). Goldoni baseline: 51 KiB
saving (109 → 58 KiB on Inter + Playfair). neckarshore baseline target:
similar Inter-side saving; Space Grotesk delta small (file already lean
at 22 KiB).
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONTS_DIR = Path(__file__).resolve().parent.parent / "src" / "fonts"


def subset_inter() -> None:
    src = FONTS_DIR / "Inter-Variable.woff2"
    dst = FONTS_DIR / "Inter-Variable-subset.woff2"
    f = TTFont(src)
    instance = instantiateVariableFont(
        f,
        {"opsz": 14, "wght": (400, 700)},
        inplace=False,
        optimize=True,
    )
    instance.flavor = "woff2"
    instance.save(dst)
    src_size = src.stat().st_size
    dst_size = dst.stat().st_size
    print(
        f"Inter:          {src_size//1024} KiB -> {dst_size//1024} KiB  "
        f"({(1 - dst_size/src_size)*100:.0f}% reduction)"
    )


def subset_space_grotesk() -> None:
    src = FONTS_DIR / "SpaceGrotesk-Variable.woff2"
    dst = FONTS_DIR / "SpaceGrotesk-Variable-subset.woff2"
    f = TTFont(src)
    instance = instantiateVariableFont(
        f,
        {"wght": (400, 700)},
        inplace=False,
        optimize=True,
    )
    instance.flavor = "woff2"
    instance.save(dst)
    src_size = src.stat().st_size
    dst_size = dst.stat().st_size
    print(
        f"Space Grotesk:  {src_size//1024} KiB -> {dst_size//1024} KiB  "
        f"({(1 - dst_size/src_size)*100:.0f}% reduction)"
    )


if __name__ == "__main__":
    subset_inter()
    subset_space_grotesk()
