#!/usr/bin/env python3
"""Compare the published number exercises with the actual fixed game layouts."""

import json
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
LAYOUTS = json.loads((ROOT / "data/number_order.json").read_text())
EXERCISES = [
    ("quick-number-focus", 1, range(1, 5)),
    ("number-order-1-to-10", 2, range(1, 11)),
    ("find-the-final-four-numbers", 7, range(13, 17)),
]


class BoardPage(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.cell = None
        self.small = False
        self.cells = []
        self.positions = []
        self.reveals = []
        self.links = []
        self.feed(html)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "td":
            self.cell = ""
        if tag == "small":
            self.small = True
        if tag == "details" and "puzzle-reveal" in attrs.get("class", "").split():
            self.reveals.append("open" in attrs)
        if tag == "a":
            self.links.append(attrs.get("href", ""))

    def handle_data(self, data):
        if self.cell is not None:
            if self.small:
                self.positions.append(data.strip())
            else:
                self.cell += data

    def handle_endtag(self, tag):
        if tag == "small":
            self.small = False
        if tag == "td":
            self.cells.append(int(self.cell.strip()))
            self.cell = None


sitemap = ET.parse(ROOT / "public/sitemap.xml")
urls = {node.text for node in sitemap.findall(".//{*}loc")}
for slug, layout, values in EXERCISES:
    route = "/daily/challenges/" + slug + "/"
    page = BoardPage((ROOT / "public" / route.strip("/") / "index.html").read_text())
    board = LAYOUTS[layout - 1]
    assert page.cells == board, slug + ": diagram differs from game"
    assert page.positions == ["Position " + str(n) for n in range(1, 17)], slug
    assert page.reveals == [False, False], slug + ": hints/answers must be optional"
    assert "/daily/number-puzzle/?layout=" + str(layout) in page.links, slug
    expected = ", ".join(str(board.index(value) + 1) for value in values)
    source = (ROOT / "content/daily/challenges" / (slug + ".md")).read_text()
    assert "**" + expected + "**" in source, slug + ": incorrect answer positions"
    for other, _, _ in EXERCISES:
        if other != slug:
            assert "/daily/challenges/" + other + "/" in page.links, slug
    assert "https://puzzlepia.com" + route in urls, slug + ": missing sitemap URL"

print("Number practice passed: three exact game boards, labeled positions, correct answer routes, closed disclosures, fixed play links, cross-links and sitemap.")
