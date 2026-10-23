#!/usr/bin/env python3
"""Check rendered ring exercises; browser QA separately checks real game moves."""

from html.parser import HTMLParser
from pathlib import Path
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
GUIDE = "/blog/ring-puzzle-basics/"
ROUNDS = {
    "simple-ring-placement-challenge": "starter-nest",
    "one-cell-three-ring-sizes": "starter-finish",
}


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.links, self.ids, self.details, self.cells = [], [], [], []
        self.example = None
        self.answers = ""
        self.in_details = False
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "a":
            self.links.append(attrs.get("href", ""))
        if tag == "details":
            self.details.append(attrs)
            self.in_details = True
        if "data-ring-example" in attrs:
            self.example = attrs["data-ring-example"]
        if "data-ring-cell" in attrs:
            self.cells.append({"id": attrs["data-ring-cell"]})
        for name in attrs.get("class", "").split():
            if name.startswith("ring-study__layer--"):
                self.cells[-1][name.removeprefix("ring-study__layer--")] = attrs.get("data-color") or ""

    def handle_data(self, text):
        if self.in_details:
            self.answers += text

    def handle_endtag(self, tag):
        if tag == "details":
            self.in_details = False


boards = json.loads((ROOT / "data/ring_practice.json").read_text())
guide = Page((ROOT / "public" / GUIDE.strip("/") / "index.html").read_text())
urls = {n.text for n in ET.parse(ROOT / "public/sitemap.xml").findall(".//{*}loc")}
for slug, example in ROUNDS.items():
    route = "/daily/challenges/" + slug + "/"
    page = Page((ROOT / "public" / route.strip("/") / "index.html").read_text())
    assert page.example == example and page.cells == boards[example]["cells"], slug
    assert len(page.details) == 2 and all("open" not in d for d in page.details)
    assert len(page.ids) == len(set(page.ids)), slug + ": duplicate IDs"
    for link in [GUIDE, "/daily/ring-puzzle/", "/games/ringzzle/"]:
        assert link in page.links, (slug, link)
    for other in ROUNDS:
        if other != slug:
            assert "/daily/challenges/" + other + "/" in page.links
    assert route in guide.links and "https://puzzlepia.com" + route in urls
    if example == "starter-nest":
        assert "Pink medium fits" in page.answers and "Mint large does not fit" in page.answers
        assert "3 of 5 rings" in page.answers and "not complete yet" in page.answers
    else:
        assert "Cells 2 and 3 both accept Gold medium" in page.answers
        assert "Cell 1 cannot accept it" in page.answers
        assert "unshown empty cells are also compatible" in page.answers
assert "https://puzzlepia.com" + GUIDE in urls
print("Ring starter PASS: two data-matched diagrams, optional answers, reciprocal links, guide and sitemap.")
