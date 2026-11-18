#!/usr/bin/env python3
"""Check published starter diagrams and the written example; browser QA checks gameplay."""

from html.parser import HTMLParser
from itertools import product
import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
GUIDE = "/blog/block-puzzle-tips-for-beginners/"
ROUNDS = ["beginner-block-placement-challenge", "block-corner-placement"]


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.cells, self.links, self.details, self.ids = [], [], [], []
        self.in_cell = self.in_details = False
        self.answers = ""
        self.feed(html)

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


guide = Page((ROOT / "public" / GUIDE.strip("/") / "index.html").read_text())
urls = {n.text for n in ET.parse(ROOT / "public/sitemap.xml").findall(".//{*}loc")}
starter_cells = [f".Row {r}, column {c}: empty" for r in range(1, 7) for c in range(1, 7)]
for slug in ROUNDS:
    route = "/daily/challenges/" + slug + "/"
    page = Page((ROOT / "public" / route.strip("/") / "index.html").read_text())
    assert [c.strip() for c in page.cells] == starter_cells, slug + ": starter board"
    assert len(page.details) == 2 and all("open" not in d for d in page.details)
    assert len(page.ids) == len(set(page.ids)), slug + ": duplicate IDs"
    for link in ["/daily/block-puzzle/", "/games/blockzzle/", GUIDE,
                 "/daily/challenges/find-the-square-space/"]:
        assert link in page.links, (slug, link)
    for other in ROUNDS:
        if other != slug:
            assert "/daily/challenges/" + other + "/" in page.links
    assert "row 5, column 5" in page.answers
    assert route in guide.links and "https://puzzlepia.com" + route in urls
    if slug == ROUNDS[0]:
        assert "row 1, column 1" in page.answers and "row 3, column 1" in page.answers
        assert "10 cells" in page.answers
    else:
        assert "row 6, column 5; row 6, column 6" in page.answers
        assert "row 7" in page.answers

# Independent geometry check for the written example, using zero-based offsets.
line = [(0, 0), (0, 1), (0, 2)]
square = [(2, 0), (2, 1), (3, 0), (3, 1)]
corner = [(4, 4), (5, 4), (5, 5)]
assert len(set(line + square + corner)) == 10
assert all(0 <= r < 6 and 0 <= c < 6 for r, c in line + square + corner)
assert any(r >= 6 for r, c in [(5, 4), (6, 4), (6, 5)])
assert "https://puzzlepia.com" + GUIDE in urls
print("Block first moves PASS: two labeled 6x6 boards, exact example, optional answers, discovery and sitemap.")

center_route = "/daily/challenges/keep-the-center-open/"
space_guide = "/blog/block-puzzle-space-management/"
center = Page((ROOT / "public" / center_route.strip("/") / "index.html").read_text())
boards = json.loads((ROOT / "data/block_practice.json").read_text())
expected = [
    f"X{col}{row}: occupied" if filled else f".{col}{row}: empty"
    for key in ["edge-line", "inner-line"]
    for row, values in enumerate(boards[key]["rows"], 1)
    for col, filled in zip("ABCD", values)
]
assert center.cells == expected
assert len(center.details) == 2 and all("open" not in d for d in center.details)
assert "Board A has 6 starts:" in center.answers and "Board B has 3 starts:" in center.answers
assert len(center.ids) == len(set(center.ids))
assert all(link in center.links for link in [space_guide, "/daily/block-puzzle/",
                                           "/daily/challenges/domino-before-the-square/"])
assert center_route in Page((ROOT / "public" / space_guide.strip("/") / "index.html").read_text()).links
assert "https://puzzlepia.com" + center_route in urls
print("Center space PASS: two exact diagrams, counts, closed hint/answer, guide, game and sitemap links.")

two_rows_route = "/daily/challenges/block-puzzle-two-rows/"
two_rows = Page((ROOT / "public" / two_rows_route.strip("/") / "index.html").read_text())
assert [c.strip() for c in two_rows.cells] == starter_cells
assert len(two_rows.details) == 3 and all("open" not in d for d in two_rows.details)
assert all(link in two_rows.links for link in [space_guide, "/daily/block-puzzle/",
                                               "/daily/challenges/domino-before-the-square/"])
assert two_rows_route in Page((ROOT / "public" / space_guide.strip("/") / "index.html").read_text()).links
assert "https://puzzlepia.com" + two_rows_route in urls

pieces = ([(0, 0), (0, 1), (0, 2)], [(0, 0), (0, 1), (1, 0), (1, 1)], [(0, 0), (1, 0), (1, 1)])
solutions = set()
for starts in product(product(range(2), range(6)), repeat=len(pieces)):
    cells = [(r + dr, col + dc) for (r, col), shape in zip(starts, pieces) for dr, dc in shape]
    if len(set(cells)) == 10 and all(r < 2 and col < 6 for r, col in cells):
        solutions.add(starts)
assert solutions == {((0, 1), (0, 4), (0, 0)), ((0, 3), (0, 0), (0, 2))}
print("Two-row practice PASS: both non-overlapping solutions, starter diagram, three closed disclosures and sitemap.")
