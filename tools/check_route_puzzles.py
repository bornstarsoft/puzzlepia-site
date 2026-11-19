#!/usr/bin/env python3
"""Validate generated maze boards and independently enumerate legal routes."""

from html.parser import HTMLParser
import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ROUTE = "/daily/challenges/mini-route-puzzles/"
GUIDE = "/blog/block-puzzle-space-management/"
ANCHOR = "round-2-steps-or-turns"
STEPS = {"U": (-1, 0), "D": (1, 0), "L": (0, -1), "R": (0, 1)}
LABELS = {"S": "SStart", "F": "FFinish", "#": "XWall", ".": ".Open"}


class Page(HTMLParser):
    def __init__(self, route):
        super().__init__()
        self.boards, self.answers, self.links, self.ids = {}, [], [], set()
        self.board = self.cell = self.code = None
        self.disclosures = 0
        self.in_details = False
        self.feed((ROOT / "public" / route.strip("/") / "index.html").read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "a":
            self.links.append(attrs["href"])
        if "data-route-board" in attrs:
            self.board = self.boards.setdefault(attrs["data-route-board"], [])
        if tag == "td" and self.board is not None:
            self.cell = ""
        if tag == "details":
            assert "open" not in attrs
            self.disclosures += 1
            self.in_details = True
        if tag == "code" and self.in_details:
            self.code = ""

    def handle_data(self, text):
        if self.cell is not None:
            self.cell += text
        if self.code is not None:
            self.code += text

    def handle_endtag(self, tag):
        if tag == "td" and self.cell is not None:
            self.board.append(self.cell.strip())
            self.cell = None
        if tag == "table":
            self.board = None
        if tag == "details":
            self.in_details = False
        if tag == "code" and self.code is not None:
            self.answers.append("".join(self.code.split()))
            self.code = None


def routes(board):
    grid = {(r, c): char for r, row in enumerate(board) for c, char in enumerate(row)}
    start, = [cell for cell, char in grid.items() if char == "S"]
    finish, = [cell for cell, char in grid.items() if char == "F"]

    def visit(cell, path, seen):
        if cell == finish:
            yield path
            return
        r, c = cell
        for move, (dr, dc) in STEPS.items():
            target = (r + dr, c + dc)
            if grid.get(target, "#") != "#" and target not in seen:
                yield from visit(target, path + move, seen | {target})

    yield from visit(start, "", {start})


def turns(path):
    return sum(a != b for a, b in zip(path, path[1:]))


def best(paths, cost):
    value = min(map(cost, paths))
    return [path for path in paths if cost(path) == value]


page = Page(ROUTE)
boards = json.loads((ROOT / "data/route_boards.json").read_text())
assert set(page.boards) == set(boards) == {"dead-end", "two-routes"}
for name, board in boards.items():
    assert len(board) == 4 and len({len(row) for row in board}) == 1
    assert page.boards[name] == [LABELS[char] for row in board for char in row]
first = list(routes(boards["dead-end"]))
second = list(routes(boards["two-routes"]))
assert len(first) > 1 and len(second) == 2
assert best(first, len) == [page.answers[0]] and len(page.answers[0]) == 7
assert best(second, len) == [page.answers[1]] and (len(page.answers[1]), turns(page.answers[1])) == (8, 4)
assert best(second, turns) == [page.answers[2]] and (len(page.answers[2]), turns(page.answers[2])) == (10, 2)
assert len(page.answers) == 3 and page.disclosures == 4
assert ANCHOR in page.ids and "#" + ANCHOR in page.links
assert "/daily/block-puzzle/" in page.links and GUIDE in page.links and ROUTE in Page(GUIDE).links
urls = {node.text for node in ET.parse(ROOT / "public/sitemap.xml").findall(".//{*}loc")}
assert "https://puzzlepia.com" + ROUTE in urls
print("Route Puzzles PASS: exact boards, one shortest path in each maze, separate fewest-turn path, checked links and disclosures.")
