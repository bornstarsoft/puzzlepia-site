#!/usr/bin/env python3
"""Check both Sum Grid solutions and the published boards after a Hugo build."""

from html.parser import HTMLParser
from itertools import permutations
import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ROUTE = "/daily/challenges/mini-sum-grids/"
GUIDE = "/blog/number-puzzle-warmups-for-casual-players/"
ROUND_2 = "round-2-two-blanks-in-every-line"
DIGITS = set(range(1, 10))
SOLUTIONS = {
    "one-blank": [[2, 7, 4], [9, 1, 5], [6, 3, 8]],
    "two-blanks": [[4, 1, 2], [8, 5, 9], [3, 7, 6]],
}


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.grids, self.links, self.details = {}, [], []
        self.ids = set()
        self.grid, self.part, self.cell, self.reveal = None, None, None, None
        self.feed((ROOT / "public" / path.strip("/") / "index.html").read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "a":
            self.links.append(attrs.get("href"))
        if "data-sum-grid" in attrs:
            self.grid = attrs["data-sum-grid"]
            assert self.grid not in self.grids
            self.grids[self.grid] = {"tbody": [], "tfoot": []}
        if self.grid and tag in ("tbody", "tfoot"):
            self.part = tag
        if self.part and tag == "td":
            self.cell = ""
        if tag == "details":
            assert "open" not in attrs
            self.reveal = ""

    def handle_data(self, text):
        if self.cell is not None:
            self.cell += text
        if self.reveal is not None:
            self.reveal += text

    def handle_endtag(self, tag):
        if tag == "td" and self.cell is not None:
            self.grids[self.grid][self.part].append(self.cell.strip())
            self.cell = None
        if self.grid and tag in ("tbody", "tfoot"):
            self.part = None
        if tag == "table":
            self.grid = None
        if tag == "details":
            self.details.append(self.reveal)
            self.reveal = None


def solve(board):
    flat = [value for row in board["rows"] for value in row]
    assert len(flat) == 9 and len(board["rows"]) == 3
    givens = [value for value in flat if value]
    assert set(givens) <= DIGITS and len(set(givens)) == len(givens)
    for values in permutations(sorted(DIGITS - set(givens))):
        missing = iter(values)
        grid = [value or next(missing) for value in flat]
        rows = [grid[i:i + 3] for i in range(0, 9, 3)]
        if [sum(row) for row in rows] != board["rowTotals"]:
            continue
        if [sum(col) for col in zip(*rows)] == board["columnTotals"]:
            yield rows


page = Page(ROUTE)
boards = json.loads((ROOT / "data/sum_grids.json").read_text())
assert set(boards) == set(page.grids) == set(SOLUTIONS)
assert len(page.details) == 4
for i, (name, board) in enumerate(boards.items()):
    assert all(len(row) == 3 for row in board["rows"])
    assert list(solve(board)) == [SOLUTIONS[name]], name + ": unique exact solution"
    assert page.grids[name]["tbody"] == [
        str(value) if value else ".Empty"
        for row, total in zip(board["rows"], board["rowTotals"]) for value in row + [total]
    ], name + ": values and row totals"
    assert page.grids[name]["tfoot"] == [*map(str, board["columnTotals"]), "\u2013Not used"]
    for row in SOLUTIONS[name]:
        assert ", ".join(map(str, row)) in page.details[i * 2 + 1], name + ": published solution"
assert 0 in boards["one-blank"]["rows"][0] and boards["one-blank"]["rows"][0].count(0) == 1
harder = boards["two-blanks"]["rows"]
assert all(row.count(0) == 2 for row in harder)
assert all(column.count(0) == 2 for column in zip(*harder))
assert ROUND_2 in page.ids and "#" + ROUND_2 in page.links
assert GUIDE in page.links and "/daily/number-pairs/" in page.links
assert ROUTE in Page(GUIDE).links
sitemap = ET.parse(ROOT / "public/sitemap.xml")
assert "https://puzzlepia.com" + ROUTE in {node.text for node in sitemap.findall(".//{*}loc")}
print("Sum Grids PASS: two unique solutions, exact labeled tables, four closed disclosures, guide, round and sitemap links.")
