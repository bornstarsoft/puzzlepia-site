#!/usr/bin/env python3
"""Check uniqueness using the clues printed in the generated challenge."""

from html.parser import HTMLParser
from itertools import permutations
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ROUTE = "/daily/challenges/mini-color-codes/"
GUIDE = "/blog/color-puzzle-strategy-basics/"
PALETTE = ("Pink", "Mint", "Gold", "Purple")
ROUNDS = ("round-1-find-the-missing-color", "round-2-put-the-colors-in-order")
CLUE = re.compile(r"([A-Za-z, ]+): ([0-3]) in the right place, ([0-3]) in the wrong place\.")


class Page(HTMLParser):
    def __init__(self, route):
        super().__init__()
        self.text = (ROOT / "public" / route.strip("/") / "index.html").read_text()
        self.rounds, self.links = {}, []
        self.round = self.item = self.answer = None
        self.disclosures = 0
        self.in_details = False
        self.feed(self.text)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "a":
            self.links.append(attrs.get("href"))
        if tag == "h2" and attrs.get("id") in ROUNDS:
            self.round = {"clues": [], "answers": []}
            self.rounds[attrs["id"]] = self.round
        if self.round is None:
            return
        if tag == "details":
            assert "open" not in attrs
            self.in_details = True
            self.disclosures += 1
        if tag == "li":
            self.item = ""
        if tag == "code":
            assert self.in_details, "the secret must not appear in the prompt"
            self.answer = ""

    def handle_data(self, text):
        if self.item is not None:
            self.item += text
        if self.answer is not None:
            self.answer += text

    def handle_endtag(self, tag):
        if tag == "li" and self.item is not None:
            if match := CLUE.fullmatch(self.item.strip()):
                self.round["clues"].append((tuple(match[1].split(", ")), (int(match[2]), int(match[3]))))
            self.item = None
        if tag == "details":
            self.in_details = False
        if tag == "code" and self.answer is not None:
            self.round["answers"].append(tuple(self.answer.split(", ")))
            self.answer = None


def score(code, guess):
    right = sum(a == b for a, b in zip(code, guess))
    return right, len(set(code).intersection(guess)) - right


page = Page(ROUTE)
assert "Pink, Mint, Gold and Purple" in page.text
assert tuple(page.rounds) == ROUNDS and page.disclosures == 4
for name, data in page.rounds.items():
    assert len(data["clues"]) == 2
    assert all(len(guess) == len(set(guess)) == 3 and set(guess) <= set(PALETTE)
               for guess, _ in data["clues"])
    valid = [
        code for code in permutations(PALETTE, 3)
        if all(score(code, guess) == clue for guess, clue in data["clues"])
    ]
    assert len(valid) == 1 and data["answers"] == valid, (name, valid)
first_guess, first_clue = page.rounds[ROUNDS[1]]["clues"][0]
assert len([code for code in permutations(PALETTE, 3) if score(code, first_guess) == first_clue]) == 2
assert "#" + ROUNDS[1] in page.links and "/daily/color-match/" in page.links
assert GUIDE in page.links and ROUTE in Page(GUIDE).links
urls = {node.text for node in ET.parse(ROOT / "public/sitemap.xml").findall(".//{*}loc")}
assert "https://puzzlepia.com" + ROUTE in urls
print("Color Codes PASS: both unique solutions, exact generated clue counts, two possible orders before the final clue, and optional answers.")
