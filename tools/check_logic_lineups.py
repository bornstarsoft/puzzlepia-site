#!/usr/bin/env python3
"""Solve both lineups using the clues and cards in the generated HTML."""

from html.parser import HTMLParser
from itertools import permutations
from pathlib import Path
import operator
import re
import xml.etree.ElementTree as ET

PUBLIC = Path(__file__).resolve().parents[1] / "public"
ROUTE = "/daily/challenges/mini-logic-lineups/"
GUIDE = "/blog/how-to-build-a-daily-puzzle-habit/"
ROUNDS = ("round-1-keep-two-cards-together", "round-2-leave-one-card-between")
CLUE = re.compile(r"(\w+) is (immediately before|before|after|exactly two places after) (\w+)\.")
LAST = re.compile(r"(\w+) is last\.")
COMPARE = {
    "immediately before": lambda a, b: a + 1 == b,
    "before": operator.lt,
    "after": operator.gt,
    "exactly two places after": lambda a, b: a == b + 2,
}


class Page(HTMLParser):
    def __init__(self, route):
        super().__init__()
        self.rounds, self.links = {}, []
        self.round = self.item = self.code = None
        self.in_details = False
        self.feed((PUBLIC / route.strip("/") / "index.html").read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "a":
            self.links.append(attrs.get("href"))
        if tag == "h2":
            self.round = None
            if attrs.get("id") in ROUNDS:
                self.round = {"cards": [], "clues": [], "answers": [], "reveals": 0}
                self.rounds[attrs["id"]] = self.round
        if self.round is None:
            return
        if tag == "details":
            assert "open" not in attrs
            self.in_details = True
            self.round["reveals"] += 1
        if tag == "li" and not self.in_details:
            self.item = ""
        if tag == "code":
            self.code = ""

    def handle_data(self, data):
        if self.item is not None:
            self.item += data
        if self.code is not None:
            self.code += data

    def handle_endtag(self, tag):
        if tag == "li" and self.item is not None:
            self.round["clues"].append(self.item.strip())
            self.item = None
        if tag == "code" and self.code is not None:
            if self.in_details:
                self.round["answers"].append(tuple(self.code.split(", ")))
            else:
                self.round["cards"].append(self.code)
            self.code = None
        if tag == "details":
            self.in_details = False


def matches(positions, clue):
    if match := CLUE.fullmatch(clue):
        first, relation, second = match.groups()
        return COMPARE[relation](positions[first], positions[second])
    if match := LAST.fullmatch(clue):
        return positions[match[1]] == len(positions) - 1
    raise AssertionError(f"Unsupported clue: {clue}")


def solutions(cards, clues):
    valid = []
    for order in permutations(cards):
        positions = {card: index for index, card in enumerate(order)}
        if all(matches(positions, clue) for clue in clues):
            valid.append(order)
    return valid


page = Page(ROUTE)
assert tuple(page.rounds) == ROUNDS
for size, data in enumerate(page.rounds.values(), start=4):
    assert len(data["cards"]) == len(set(data["cards"])) == size
    assert len(data["clues"]) == 3 and data["reveals"] == 2
    valid = solutions(data["cards"], data["clues"])
    assert len(valid) == 1 and data["answers"] == valid, (data, valid)

second_round = page.rounds[ROUNDS[1]]
assert len(solutions(second_round["cards"], second_round["clues"][:2])) == 2
assert "#" + ROUNDS[1] in page.links and "/daily/" in page.links
assert GUIDE in page.links and ROUTE in Page(GUIDE).links
urls = {node.text for node in ET.parse(PUBLIC / "sitemap.xml").findall(".//{*}loc")}
assert "https://puzzlepia.com" + ROUTE in urls
print("Logic Lineups PASS: unique orders, two candidates before the final clue, optional answers and discovery links.")
