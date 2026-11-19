#!/usr/bin/env python3
"""Solve the generated word squares using only their published banks and starts."""

from html.parser import HTMLParser
from itertools import permutations
from pathlib import Path
import xml.etree.ElementTree as ET

PUBLIC = Path(__file__).resolve().parents[1] / "public"
ROUTE = "/daily/challenges/mini-word-squares/"
ROUNDS = ("round-1-complete-the-three-letter-square", "round-2-choose-the-first-word")


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rounds, self.links = {}, []
        self.round = self.code = None
        self.in_details = False
        self.feed((PUBLIC / ROUTE.strip("/") / "index.html").read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a":
            self.links.append(attrs.get("href"))
        if tag == "h2":
            self.round = None
            if attrs.get("id") in ROUNDS:
                self.round = {"prompt": [], "answer": [], "reveals": 0}
                self.rounds[attrs["id"]] = self.round
        if self.round is None:
            return
        if tag == "details":
            assert "open" not in attrs
            self.in_details = True
            self.round["reveals"] += 1
        if tag == "code":
            self.code = []

    def handle_data(self, data):
        if self.code is not None:
            self.code.append(data)

    def handle_endtag(self, tag):
        if tag == "code" and self.code is not None:
            key = "answer" if self.in_details else "prompt"
            self.round[key].append("".join(self.code))
            self.code = None
        if tag == "details":
            self.in_details = False


page = Page()
assert tuple(page.rounds) == ROUNDS
for size, data in enumerate(page.rounds.values(), start=3):
    bank, start = data["prompt"]
    words = bank.split(", ")
    assert len(words) == len(set(words)) > size
    assert all(word.isascii() and word.isalpha() and word.isupper() and len(word) == size
               for word in words)
    assert len(start) == (size if size == 3 else 1)
    starts = [word for word in words if word.startswith(start)]
    assert len(starts) == size - 2
    matches = [
        (first, *rest)
        for first in starts
        for rest in permutations([word for word in words if word != first], size - 1)
        if tuple("".join(column) for column in zip(first, *rest)) == (first, *rest)
    ]
    assert data["reveals"] == 2 and len(data["answer"]) == len(matches) == 1
    assert tuple(data["answer"][0].split(", ")) == matches[0], (size, matches)

assert "#" + ROUNDS[1] in page.links and "/daily/word-search/" in page.links
urls = {node.text for node in ET.parse(PUBLIC / "sitemap.xml").findall(".//{*}loc")}
assert "https://puzzlepia.com" + ROUTE in urls
print("Mini Word Squares PASS: one solution per square, two possible starts for Round 2, closed reveals and discovery.")
