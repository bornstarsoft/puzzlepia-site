#!/usr/bin/env python3
"""Check the published tile boards and the solutions shown in the reveals."""

from html.parser import HTMLParser
from itertools import combinations
from pathlib import Path
import re
import xml.etree.ElementTree as ET

PUBLIC = Path(__file__).resolve().parents[1] / "public"
ROUTE = "/daily/challenges/mini-tile-flips/"
ROUNDS = ("round-1-keep-the-middle-off", "round-2-find-the-fewest-flips")


class Puzzle(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rounds = {}
        self.round = self.capture = None
        self.in_reveal = False
        self.feed((PUBLIC / ROUTE.strip("/") / "index.html").read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h2":
            self.round = None
            if attrs.get("id") in ROUNDS:
                self.round = {"board": [], "answer": [], "reveals": 0}
                self.rounds[attrs["id"]] = self.round
        if self.round is None:
            return
        if tag == "details":
            assert "open" not in attrs
            self.round["reveals"] += 1
            self.in_reveal = True
        if tag == "code" and not self.in_reveal:
            self.capture = (tag, "board", [])
        if tag == "strong" and self.in_reveal:
            self.capture = (tag, "answer", [])

    def handle_data(self, data):
        if self.capture:
            self.capture[2].append(data)

    def handle_endtag(self, tag):
        if self.capture and tag == self.capture[0]:
            _, field, text = self.capture
            self.round[field].append("".join(text))
            self.capture = None
        if tag == "details":
            self.in_reveal = False


def solves(board, choices, protected=None):
    lights = list(board)
    for position in choices:
        for neighbor in range(max(0, position - 2), min(len(lights), position + 1)):
            lights[neighbor] = not lights[neighbor]
        if protected is not None and lights[protected - 1]:
            return False
    return not any(lights)


puzzle = Puzzle()
assert tuple(puzzle.rounds) == ROUNDS
for size, data in enumerate(puzzle.rounds.values(), start=5):
    assert len(data["board"]) == len(data["answer"]) == 1 and data["reveals"] == 2
    labels = data["board"][0].split(" | ")
    assert len(labels) == size and set(labels) == {"ON", "OFF"}
    board = [label == "ON" for label in labels]
    answer = tuple(int(n) for n in re.findall(r"\d+", data["answer"][0]))
    protected = 3 if size == 5 else None
    if protected is not None:
        assert not board[protected - 1]

    # The protected tile starts off: any choice affecting it is illegal.
    # For the other round, changing the order cannot change the final row.
    solutions = [
        choices for count in range(size + 1)
        for choices in combinations(range(1, size + 1), count)
        if solves(board, choices, protected)
    ]
    assert solutions == [answer], (size, solutions, answer)
    assert len(answer) == size - 3

urls = {node.text for node in ET.parse(PUBLIC / "sitemap.xml").findall(".//{*}loc")}
assert "https://puzzlepia.com" + ROUTE in urls
print("Mini Tile Flips PASS: unique move sets, protected middle, three-flip minimum and discovery.")
