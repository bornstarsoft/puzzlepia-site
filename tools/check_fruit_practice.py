#!/usr/bin/env python3
"""Check the fruit reading exercise against the actual Word Search model."""

from html.parser import HTMLParser
import json
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ROUTE = "/daily/challenges/mini-word-search-fruit-words/"
GUIDE = "/blog/word-search-patterns-to-look-for/"
PATHS = {
    "PEAR": [[0, 5], [1, 5], [2, 5], [3, 5]],
    "LIME": [[0, 3], [1, 3], [2, 3], [3, 3]],
    "PLUM": [[0, 1], [1, 1], [2, 1], [3, 1]],
    "KIWI": [[5, 5], [5, 4], [5, 3], [5, 2]],
}


class Page(HTMLParser):
    def __init__(self, route):
        super().__init__()
        self.cells, self.links, self.ids, self.details = [], [], [], []
        self.in_cell = self.in_details = False
        self.answer_text = ""
        self.feed((ROOT / "public" / route.strip("/") / "index.html").read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "a":
            self.links.append(attrs.get("href", ""))
        if tag == "td":
            self.in_cell = True
            self.cells.append("")
        if tag == "details":
            self.details.append(attrs)
            self.in_details = True

    def handle_data(self, text):
        if self.in_cell:
            self.cells[-1] += text
        if self.in_details:
            self.answer_text += text

    def handle_endtag(self, tag):
        if tag == "td":
            self.in_cell = False
        if tag == "details":
            self.in_details = False


model = json.loads(subprocess.check_output([
    "node", "-e", "const m=require('./static/js/puzzlepia-word-search.js');"
    "const c=require('./data/word_search.json');"
    "console.log(JSON.stringify(m.prepare(c).sets.find(s=>s.id==='fruit')));"
], cwd=ROOT, text=True))
page, guide = Page(ROUTE), Page(GUIDE)
assert page.cells == list("".join(model["rows"]))
assert set(model["words"]) == set(PATHS)
for word, path in PATHS.items():
    assert model["paths"][word] == path, word
    assert "".join(model["rows"][r][c] for r, c in path) == word
    (r1, c1), (r2, c2) = path[0], path[-1]
    assert f"Row {r1 + 1}, column {c1 + 1} to row {r2 + 1}, column {c2 + 1}" in page.answer_text
    anchor = "find-" + word.lower()
    assert anchor in page.ids and "#" + anchor in page.links
assert len(page.details) == 8 and all("open" not in d for d in page.details)
assert len(page.ids) == len(set(page.ids))
for link in [GUIDE, "/daily/word-search/?set=fruit", "/daily/word-search/",
             "/games/kpop-word-search/", "/daily/challenges/kiwi-backward-word-search/",
             "/daily/challenges/star-diagonal-word-search/"]:
    assert link in page.links, link
assert ROUTE in guide.links and ROUTE + "#find-kiwi" in guide.links
assert "/daily/word-search/?set=fruit" in guide.links
urls = {n.text for n in ET.parse(ROOT / "public/sitemap.xml").findall(".//{*}loc")}
assert all("https://puzzlepia.com" + p in urls for p in [ROUTE, GUIDE])
print("Fruit practice PASS: real 36-cell board, four model paths, answers, eight closed disclosures, section/game links and sitemap.")
