#!/usr/bin/env python3
"""Check built beginner warmups against the Word Search model and board."""

from html.parser import HTMLParser
import json
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
GUIDE = "/blog/daily-word-games-for-beginners/"
ROUNDS = {
    "easy-word-search-challenge": ("STAR", [[0, 0], [0, 1], [0, 2], [0, 3]], "Row 1, columns 1 to 4"),
    "moon-word-search-mini": ("MOON", [[0, 5], [1, 5], [2, 5], [3, 5]], "Column 6, rows 1 to 4"),
}


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.cells, self.links, self.details, self.ids = [], [], [], []
        self.in_cell = self.in_details = False
        self.answers = ""
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "td":
            self.in_cell = True
            self.cells.append("")
        if tag == "a":
            self.links.append(attrs.get("href", ""))
        if tag == "details":
            self.details.append(attrs)
            self.in_details = True

    def handle_data(self, text):
        if self.in_cell:
            self.cells[-1] += text
        if self.in_details:
            self.answers += text

    def handle_endtag(self, tag):
        if tag == "td":
            self.in_cell = False
        if tag == "details":
            self.in_details = False


model = json.loads(subprocess.check_output([
    "node", "-e", "const m=require('./static/js/puzzlepia-word-search.js');"
    "const c=require('./data/word_search.json');"
    "console.log(JSON.stringify(m.prepare(c).sets.find(s=>s.id==='starter')));"
], cwd=ROOT, text=True))
guide = Page((ROOT / "public" / GUIDE.strip("/") / "index.html").read_text())
urls = {n.text for n in ET.parse(ROOT / "public/sitemap.xml").iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")}
assert "https://puzzlepia.com" + GUIDE in urls
for slug, (word, path, answer) in ROUNDS.items():
    route = "/daily/challenges/" + slug + "/"
    page = Page((ROOT / "public" / route.strip("/") / "index.html").read_text())
    assert page.cells == list("".join(model["rows"])), slug
    assert model["paths"][word] == path, slug
    assert answer in page.answers, slug
    assert len(page.details) == 2 and all("open" not in d for d in page.details)
    assert len(page.ids) == len(set(page.ids))
    for link in ["/daily/word-search/?set=starter", GUIDE, "/games/kpop-word-search/",
                 "/daily/challenges/kiwi-backward-word-search/"]:
        assert link in page.links, (slug, link)
    for other in ROUNDS:
        if other != slug:
            assert "/daily/challenges/" + other + "/" in page.links
    assert route in guide.links and "https://puzzlepia.com" + route in urls
    if word == "MOON":
        assert "row 2, column 6" in page.answers and "row 3, column 6" in page.answers
print("Word warmups PASS: real board/model paths, answers, closed disclosures, fixed links, reciprocal discovery and sitemap.")
