#!/usr/bin/env python3
"""Validate generated color exercises after Hugo; standard library only."""

import json
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BOARD = json.loads((ROOT / "data/color_practice.json").read_text())
COLORS = [color for row in BOARD for color in row]
ROUNDS = {
    "pink-color-match-challenge": "pink",
    "mint-color-match": "mint",
    "gold-color-target": "gold",
}


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.colors, self.cells, self.links, self.details = [], [], [], []
        self.in_cell = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "td" and "data-color" in attrs:
            self.colors.append(attrs["data-color"])
            self.cells.append("")
            self.in_cell = True
        if tag == "a":
            self.links.append(attrs.get("href"))
        if tag == "details":
            self.details.append(attrs)

    def handle_data(self, text):
        if self.in_cell:
            self.cells[-1] += text

    def handle_endtag(self, tag):
        if tag == "td":
            self.in_cell = False


sitemap = ET.parse(ROOT / "public/sitemap.xml")
urls = {node.text for node in sitemap.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")}
guide = Page((ROOT / "public/blog/color-puzzle-strategy-basics/index.html").read_text())
for slug, target in ROUNDS.items():
    route = "/daily/challenges/" + slug + "/"
    source = (ROOT / "content/daily/challenges" / (slug + ".md")).read_text()
    page = Page((ROOT / "public" / route.strip("/") / "index.html").read_text())
    assert page.colors == COLORS, slug + ": board differs"
    assert page.cells == [color.title() + "Pos. " + str(i + 1) for i, color in enumerate(COLORS)], slug
    positions = [i + 1 for i, color in enumerate(COLORS) if color == target]
    assert len(positions) == 6
    assert "**" + ", ".join(map(str, positions)) + "**" in source, slug + ": wrong answer"
    assert len(page.details) == 2 and all("open" not in d for d in page.details), slug
    assert "/daily/color-match/?target=" + target in page.links, slug
    assert "/blog/color-puzzle-strategy-basics/" in page.links, slug
    assert "https://puzzlepia.com" + route in urls and route in guide.links, slug
    for other in ROUNDS:
        if other != slug:
            assert "/daily/challenges/" + other + "/" in page.links, slug + ": missing next round"

print("Color practice passed: three real-board diagrams, answers, closed disclosures, exact targets, cross-links and sitemap. Run node tools/test_color_match.cjs to verify runtime board parity.")
