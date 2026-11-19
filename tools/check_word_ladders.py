#!/usr/bin/env python3
"""Enumerate shortest routes from the word banks in the generated challenge."""

from collections import deque
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ROUTE = "/daily/challenges/mini-word-ladders/"
GUIDE = "/blog/daily-word-games-for-beginners/"
ROUNDS = {
    "round-1-from-rain-to-hail": (2, 1),
    "round-2-from-cool-to-heat": (5, 2),
}


class Page(HTMLParser):
    def __init__(self, route):
        super().__init__()
        self.rounds, self.links = {}, []
        self.round = self.block = self.words = self.word = None
        self.in_details = False
        self.disclosures = 0
        self.feed((ROOT / "public" / route.strip("/") / "index.html").read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "a":
            self.links.append(attrs.get("href"))
        if tag == "h2" and attrs.get("id") in ROUNDS:
            self.round = attrs["id"]
            self.rounds[self.round] = {"prompt": [], "answer": []}
        if tag == "details" and self.round:
            assert "open" not in attrs
            self.in_details = True
            self.disclosures += 1
        if self.round and self.block is None and tag in ("p", "li"):
            self.block = tag
            self.words = []
        if tag == "code" and self.words is not None:
            self.word = ""

    def handle_data(self, text):
        if self.word is not None:
            self.word += text

    def handle_endtag(self, tag):
        if tag == "code" and self.word is not None:
            self.words.append(self.word)
            self.word = None
        if tag == self.block:
            if self.words:
                section = "answer" if self.in_details else "prompt"
                self.rounds[self.round][section].append(tuple(self.words))
            self.block = self.words = None
        if tag == "details":
            self.in_details = False


def shortest(start, end, words):
    pending, found = deque([(start,)]), set()
    while pending:
        path = pending.popleft()
        if found and len(path) > len(next(iter(found))):
            break
        if path[-1] == end:
            found.add(path)
            continue
        for candidate in words.difference(path):
            if sum(a != b for a, b in zip(path[-1], candidate)) == 1:
                pending.append((*path, candidate))
    return found


page = Page(ROUTE)
assert set(page.rounds) == set(ROUNDS) and page.disclosures == 4
for name, (moves, count) in ROUNDS.items():
    round_data = page.rounds[name]
    (start, end), bank = round_data["prompt"]
    allowed = {start, end, *bank}
    assert len(allowed) == len(bank) + 2
    assert all(word.isascii() and word.isalpha() and word.isupper() and len(word) == len(start) for word in allowed)
    routes = shortest(start, end, allowed)
    assert len(routes) == count and all(len(route) - 1 == moves for route in routes), (name, routes)
    assert len(round_data["answer"]) == count and routes == set(round_data["answer"])
assert "#round-2-from-cool-to-heat" in page.links and GUIDE in page.links
assert "/daily/word-search/" in page.links and ROUTE in Page(GUIDE).links
urls = {node.text for node in ET.parse(ROOT / "public/sitemap.xml").findall(".//{*}loc")}
assert "https://puzzlepia.com" + ROUTE in urls
print("Word Ladders PASS: the rendered banks yield one two-move route and exactly two five-move routes; solutions, bookmarks and links match.")
