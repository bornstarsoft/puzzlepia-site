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
        self.ids = set()
        self.codes = []
        self.in_code = False
        self.feed(html)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "code":
            self.codes.append("")
            self.in_code = True
        if tag == "td":
            self.cell = ""
        if tag == "small":
            self.small = True
        if tag == "details" and "puzzle-reveal" in attrs.get("class", "").split():
            self.reveals.append("open" in attrs)
        if tag == "a":
            self.links.append(attrs.get("href", ""))

    def handle_data(self, data):
        if self.in_code:
            self.codes[-1] += data
        if self.cell is not None:
            if self.small:
                self.positions.append(data.strip())
            else:
                self.cell += data

    def handle_endtag(self, tag):
        if tag == "code":
            self.in_code = False
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

route = "/daily/challenges/number-order-challenge/"
page = BoardPage((ROOT / "public" / route.strip("/") / "index.html").read_text())
board = LAYOUTS[3]
assert page.cells == board and page.positions == ["Position " + str(n) for n in range(1, 17)]
assert page.reveals == [False, False]
assert "/daily/number-puzzle/?layout=4" in page.links
source = (ROOT / "content/daily/challenges/number-order-challenge.md").read_text()
for values in [range(1, 6), range(6, 9)]:
    expected = ", ".join(str(board.index(value) + 1) for value in values)
    assert "**" + expected + "**" in source, "recovery route positions"
assert board[5] == 5 and board[15] == 6
for phrase in ['"Look for 6 first."', "**No reset is needed.**", "full, unmarked", "9 to 16"]:
    assert phrase in source, phrase
guide_route = "/blog/number-puzzle-warmups-for-casual-players/"
guide = BoardPage((ROOT / "public" / guide_route.strip("/") / "index.html").read_text())
assert route in guide.links and guide_route in page.links
for slug in ["quick-number-focus", "find-the-final-four-numbers"]:
    assert "/daily/challenges/" + slug + "/" in page.links
assert "https://puzzlepia.com" + route in urls

print("Number practice passed: four exact game boards, positions/recovery route, closed disclosures, fixed play links, guide links and sitemap.")

warmup_route = "/daily/challenges/daily-puzzle-warmup/"
warmup = BoardPage((ROOT / "public" / warmup_route.strip("/") / "index.html").read_text())
jumps = [2]
for jump in [2, 3, 2, 3, 2]:
    jumps.append(jumps[-1] + jump)
tracks = [n for pair in zip(range(1, 11, 3), range(18, 11, -2)) for n in pair]


def with_blanks(values, blank_indexes):
    return ", ".join("?" if i in blank_indexes else str(n) for i, n in enumerate(values))


assert warmup.codes == [with_blanks(jumps, [4]), with_blanks(tracks, [5, 6])]
source = (ROOT / "content/daily/challenges/daily-puzzle-warmup.md").read_text()
assert f"missing number is **{jumps[4]}**" in source
assert f"blanks are **{tracks[5]}, then {tracks[6]}**" in source
assert warmup.reveals == [False] * 4
for anchor in ["alternating-jumps", "two-tracks-in-one-line"]:
    assert anchor in warmup.ids and "#" + anchor in warmup.links
assert warmup_route in guide.links and warmup_route + "#two-tracks-in-one-line" in guide.links
assert "/daily/number-puzzle/?layout=6" in warmup.links and guide_route in warmup.links
assert "https://puzzlepia.com" + warmup_route in urls
print("Number patterns passed: both sequences and answers, four closed disclosures, round links and sitemap.")

neighbors_route = "/daily/challenges/find-consecutive-neighbors/"
neighbors = BoardPage((ROOT / "public" / neighbors_route.strip("/") / "index.html").read_text())
source = (ROOT / "content/daily/challenges/find-consecutive-neighbors.md").read_text()
assert neighbors.cells == LAYOUTS[2] + LAYOUTS[5]
assert neighbors.positions == ["Position " + str(n) for n in range(1, 17)] * 2
assert neighbors.reveals == [False] * 4
assert "round-2-layout-6" in neighbors.ids and "#round-2-layout-6" in neighbors.links
assert neighbors_route in guide.links and guide_route in neighbors.links
assert "https://puzzlepia.com" + neighbors_route in urls
for layout, answer in [(3, (6, 7)), (6, (10, 11))]:
    board = LAYOUTS[layout - 1]
    matches = set()
    for i, value in enumerate(board):
        adjacent = []
        if i % 4 < 3:
            adjacent.append(board[i + 1])
        if i < 12:
            adjacent.append(board[i + 4])
        matches.update(tuple(sorted((value, other))) for other in adjacent if abs(value - other) == 1)
    assert matches == {answer}, (layout, matches)
    positions = [board.index(value) + 1 for value in answer]
    assert f"**{answer[0]} and {answer[1]}**" in source
    assert f"**positions {positions[0]} and {positions[1]}**" in source
    assert "/daily/number-puzzle/?layout=" + str(layout) in neighbors.links
print("Consecutive neighbors passed: two unique pairs and their positions, matching game boards, round links and sitemap.")
