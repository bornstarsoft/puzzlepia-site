#!/usr/bin/env python3
"""Check the generated balance puzzles against every allowed shape weight."""

from html.parser import HTMLParser
from itertools import product
from pathlib import Path
import re
import xml.etree.ElementTree as ET

PUBLIC = Path(__file__).resolve().parents[1] / "public"
ROUTE = "/daily/challenges/mini-balance-puzzles/"
GUIDE = "/blog/number-puzzle-warmups-for-casual-players/"
ROUNDS = ("round-1-two-matching-stars", "round-2-remove-matching-shapes")


class Page(HTMLParser):
    def __init__(self, route):
        super().__init__()
        self.rounds, self.links = {}, []
        self.round = self.capture = None
        self.in_details = False
        self.feed((PUBLIC / route.strip("/") / "index.html").read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "a":
            self.links.append(attrs.get("href"))
        if tag == "h2":
            self.round = None
            if attrs.get("id") in ROUNDS:
                self.round = {"clues": [], "answers": [], "reveals": 0}
                self.rounds[attrs["id"]] = self.round
        if self.round is None:
            return
        if tag == "details":
            assert "open" not in attrs
            self.in_details = True
            self.round["reveals"] += 1
        if (tag == "code" and not self.in_details) or (tag == "strong" and self.in_details):
            self.capture = (tag, [])

    def handle_data(self, data):
        if self.capture:
            self.capture[1].append(data)

    def handle_endtag(self, tag):
        if self.capture and tag == self.capture[0]:
            key = "clues" if tag == "code" else "answers"
            self.round[key].append("".join(self.capture[1]))
            self.capture = None
        if tag == "details":
            self.in_details = False


def solutions(clues):
    equations = [tuple(side.split(" + ") for side in clue.split(" = ")) for clue in clues]
    shapes = sorted({
        term for equation in equations for side in equation for term in side if not term.isdigit()
    })
    valid = []
    for values in product(range(1, 10), repeat=len(shapes)):
        weights = dict(zip(shapes, values))
        def total(side):
            return sum(int(term) if term.isdigit() else weights[term] for term in side)

        if all(total(left) == total(right) for left, right in equations):
            valid.append(weights)
    return valid


page = Page(ROUTE)
assert tuple(page.rounds) == ROUNDS
for clue_count, data in enumerate(page.rounds.values(), start=2):
    assert data["reveals"] == 2 and len(data["clues"]) == clue_count
    assert len(data["answers"]) == 1
    reported = re.findall(r"([A-Z][a-z]+): ([1-9]) units\.", data["answers"][0])
    assert len(reported) == clue_count
    assert solutions(data["clues"]) == [{shape: int(value) for shape, value in reported}]

assert len(solutions(page.rounds[ROUNDS[1]]["clues"][:2])) == 9
assert "#" + ROUNDS[1] in page.links and "/daily/number-pairs/" in page.links
assert GUIDE in page.links and ROUTE in Page(GUIDE).links
urls = {node.text for node in ET.parse(PUBLIC / "sitemap.xml").findall(".//{*}loc")}
assert "https://puzzlepia.com" + ROUTE in urls
print("Balance Puzzles PASS: both unique solutions, optional reveals, and discovery links.")
