#!/usr/bin/env python3
"""Check the published picture clues and independently enumerate solutions."""

from html.parser import HTMLParser
from itertools import groupby, product
import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ROUTE = "/daily/challenges/mini-picture-grids/"
GUIDE = "/blog/color-puzzle-strategy-basics/"
ROUND_2 = "round-2-make-room-for-a-gap"


class Page(HTMLParser):
    def __init__(self, route):
        super().__init__()
        self.boards, self.links, self.ids = {}, [], set()
        self.board, self.cell = None, None
        self.in_details = False
        self.disclosures = 0
        self.feed((ROOT / "public" / route.strip("/") / "index.html").read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "a":
            self.links.append(attrs.get("href"))
        if tag == "details":
            assert "open" not in attrs
            self.disclosures += 1
            self.in_details = True
        if "data-picture-grid" in attrs:
            key = (attrs["data-picture-grid"], attrs["data-solved"])
            assert key not in self.boards
            assert (key[1] == "true") == self.in_details, "solutions must stay inside disclosures"
            self.board = {"th": [], "td": []}
            self.boards[key] = self.board
        if self.board is not None and tag in ("th", "td"):
            self.cell = ""

    def handle_data(self, text):
        if self.cell is not None:
            self.cell += text

    def handle_endtag(self, tag):
        if self.cell is not None and tag in ("th", "td"):
            self.board[tag].append(self.cell.strip())
            self.cell = None
        if tag == "table":
            self.board = None
        if tag == "details":
            self.in_details = False


def clues(line):
    return tuple(len(list(run)) for char, run in groupby(line) if char == "#")


def formatted(values):
    return ", ".join(map(str, values)) or "0"


page = Page(ROUTE)
boards = json.loads((ROOT / "data/picture_grids.json").read_text())
choices = tuple(product(".#", repeat=5))
assert page.disclosures == 4 and len(page.boards) == 4
for key, grid in boards.items():
    assert len(grid) == 5 and all(len(line) == 5 and set(line) <= {".", "#"} for line in grid)
    row_clues = tuple(map(clues, grid))
    column_clues = tuple(map(clues, zip(*grid)))
    candidates = [[line for line in choices if clues(line) == value] for value in row_clues]
    solutions = [
        ["".join(row) for row in candidate]
        for candidate in product(*candidates)
        if tuple(map(clues, zip(*candidate))) == column_clues
    ]
    assert solutions == [grid], key + ": expected exactly one solution"
    headings = (
        ["Row"]
        + [label + formatted(value) for label, value in zip("ABCDE", column_clues)]
        + [f"{i}: {formatted(value)}" for i, value in enumerate(row_clues, 1)]
    )
    question = page.boards[key, "false"]
    solution = page.boards[key, "true"]
    assert question["th"] == solution["th"] == headings, key + ": rendered clues"
    assert question["td"] == [".Unmarked"] * 25
    assert solution["td"] == ["\u25a0Filled" if char == "#" else ".Empty" for line in grid for char in line]
assert ROUND_2 in page.ids and "#" + ROUND_2 in page.links
assert GUIDE in page.links and "/daily/color-match/" in page.links and ROUTE in Page(GUIDE).links
urls = {node.text for node in ET.parse(ROOT / "public/sitemap.xml").findall(".//{*}loc")}
assert "https://puzzlepia.com" + ROUTE in urls
print("Picture Grids PASS: two unique solutions, all clues match the printed boards, answers stay closed and links resolve.")
