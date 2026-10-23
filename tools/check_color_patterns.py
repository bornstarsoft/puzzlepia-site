#!/usr/bin/env python3
"""Validate static sequence rules, rendered tiles, disclosures and discovery."""

import json
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ROUTE = "/daily/challenges/repeated-color-pattern/"
GUIDE = "/blog/color-puzzle-strategy-basics/"
DATA = json.loads((ROOT / "data/color_patterns.json").read_text())
EXPECTED = {
    "three-colors": ["gold", "pink", "mint", "gold"],
    "color-pairs": ["mint", "mint", "gold", "gold"],
    "returning-pink": ["pink", "mint", "pink", "gold"],
}


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.patterns, self.ids, self.links, self.details = {}, [], [], []
        self.current = None
        self.in_cell = False
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if "data-color-pattern" in attrs:
            self.current = attrs["data-color-pattern"]
            assert self.current not in self.patterns, "duplicate pattern"
            self.patterns[self.current] = []
        if tag == "td" and self.current:
            self.in_cell = True
            self.patterns[self.current].append([attrs.get("data-color") or "", ""])
        if tag == "details":
            self.details.append(attrs)
        if tag == "a":
            self.links.append(attrs.get("href", ""))

    def handle_data(self, text):
        if self.in_cell:
            self.patterns[self.current][-1][1] += text

    def handle_endtag(self, tag):
        if tag == "td":
            self.in_cell = False
        if tag == "table":
            self.current = None


source = (ROOT / "content/daily/challenges/repeated-color-pattern.md").read_text()
page = Page((ROOT / "public" / ROUTE.strip("/") / "index.html").read_text())
assert set(page.patterns) == set(DATA) == set(EXPECTED)
for name, pattern in DATA.items():
    unit = pattern["unit"]
    assert 2 <= len(unit) <= 4 and all(c in {"pink", "mint", "gold"} for c in unit)
    shown = [unit[i % len(unit)] for i in range(8)]
    # Require two observed repeats and the shortest compatible repeating block.
    periods = [p for p in range(1, 5) if all(shown[i] == shown[i % p] for i in range(8))]
    assert min(periods) == len(unit) and 8 >= 2 * len(unit), name
    answer = [unit[i % len(unit)] for i in range(8, 12)]
    assert answer == EXPECTED[name], name
    assert "**" + ", ".join(c.title() for c in answer) + "**" in source, name
    colors = shown + [""] * 4
    assert page.patterns[name] == [
        [c, (c.title() if c else "?") + "Step " + str(i + 1)]
        for i, c in enumerate(colors)
    ], name + ": rendered colors or labels"
assert len(page.details) == 6 and all("open" not in d for d in page.details)
assert len(page.ids) == len(set(page.ids))
for anchor in ["round-1-three-colors", "round-2-colors-in-pairs", "round-3-pink-returns"]:
    assert anchor in page.ids and "#" + anchor in page.links
for href in [GUIDE, "/daily/color-match/?target=gold", "/daily/color-match/",
             "/games/mapdoku/", "/daily/challenges/gold-color-target/"]:
    assert href in page.links
guide = Page((ROOT / "public" / GUIDE.strip("/") / "index.html").read_text())
assert ROUTE in guide.links
urls = {n.text for n in ET.parse(ROOT / "public/sitemap.xml").findall(".//{*}loc")}
assert all("https://puzzlepia.com" + p in urls for p in [ROUTE, GUIDE])
print("Color patterns PASS: three shortest periods, 36 labeled cells, 12 answers, six optional disclosures, round links and sitemap.")
