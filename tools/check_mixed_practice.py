#!/usr/bin/env python3
"""Validate the mixed reading exercises against their real game boards."""

import json
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CHALLENGE = "/daily/challenges/weekend-word-and-color/"
GUIDE = "/blog/how-to-choose-a-puzzle-for-a-five-minute-break/"


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.cells, self.colors, self.links, self.details, self.ids = [], [], [], [], []
        self.in_cell = False
        self.answer_text, self.in_details = "", False
        self.meta, self.canonical = {}, ""
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "td":
            self.in_cell = True
            self.cells.append("")
            if "data-color" in attrs:
                self.colors.append(attrs["data-color"])
        if tag == "a":
            self.links.append(attrs.get("href", ""))
        if tag == "details":
            self.details.append(attrs)
            self.in_details = True
        if tag == "meta":
            self.meta[attrs.get("name", attrs.get("property"))] = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href")

    def handle_data(self, text):
        if self.in_cell:
            self.cells[-1] += text
        if self.in_details:
            self.answer_text += text

    def handle_endtag(self, tag):
        if tag == "td":
            self.in_cell = False
        if tag == "details":
            self.in_details = False


page = Page((ROOT / "public" / CHALLENGE.strip("/") / "index.html").read_text())
guide = Page((ROOT / "public" / GUIDE.strip("/") / "index.html").read_text())
catalog = json.loads((ROOT / "data/word_search.json").read_text())
starter = next(item for item in catalog["sets"] if item["id"] == "starter")
colors = json.loads((ROOT / "data/color_practice.json").read_text())
flat_colors = [color for row in colors for color in row]

assert page.cells[:36] == list("".join(starter["rows"])), "Word board differs"
assert starter["rows"][4][:4] == "PLAY"
assert starter["rows"][1][:4] == "ULAY"
assert sum(row.count("PLAY") for row in starter["rows"]) == 1
assert set(starter["words"]) == {"STAR", "MOON", "MINT", "PLAY"}
assert page.colors == flat_colors, "Color board differs"
assert page.cells[36:] == [color.title() + "Pos. " + str(i + 1) for i, color in enumerate(flat_colors)]
positions = [i + 1 for i, color in enumerate(flat_colors) if color == "purple"]
counts = [row.count("purple") for row in colors]
assert positions == [6, 11, 12, 19, 20, 24, 25]
assert counts == [0, 1, 2, 2, 2]
assert ", ".join(map(str, positions)) in page.answer_text
assert ", ".join(map(str, counts)) in page.answer_text
assert "Row 5, columns 1 to 4" in page.answer_text
assert "seven" in page.answer_text
assert len(page.details) == 4 and all("open" not in d for d in page.details)
assert len(page.ids) == len(set(page.ids))
for anchor in ["word-round", "color-round"]:
    assert anchor in page.ids
    assert "#" + anchor in page.links
    assert CHALLENGE + "#" + anchor in guide.links
for link in ["/daily/word-search/?set=starter", "/daily/color-match/?target=purple", GUIDE,
             "/daily/challenges/kiwi-backward-word-search/", "/daily/challenges/mint-color-match/"]:
    assert link in page.links, link
urls = {node.text for node in ET.parse(ROOT / "public/sitemap.xml").iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")}
for route, parsed in [(CHALLENGE, page), (GUIDE, guide)]:
    assert "https://puzzlepia.com" + route in urls
    assert parsed.canonical == "https://puzzlepia.com" + route
    assert parsed.meta["description"] and parsed.meta["og:description"]
assert page.meta["description"] != guide.meta["description"]
print("Mixed practice PASS: both real boards, exact answers, four closed disclosures, round/play links, metadata and sitemap.")

weekend_route = "/daily/challenges/weekend-brain-break/"
weekend_guide = "/blog/why-short-puzzle-sessions-work/"
weekend = Page((ROOT / "public" / weekend_route.strip("/") / "index.html").read_text())
short_sessions = Page((ROOT / "public" / weekend_guide.strip("/") / "index.html").read_text())
daily = Page((ROOT / "public/daily/index.html").read_text())
memory = json.loads((ROOT / "data/memory_pairs.json").read_text())[4]
numbers = json.loads((ROOT / "data/number_pairs.json").read_text())[4]

assert weekend.cells == [
    f"{value.title()}Card {i}" for i, value in enumerate(memory, 1)
] + [f"{value}Position {i}" for i, value in enumerate(numbers, 1)]
for first, second, symbol in [(5, 10, "triangle"), (6, 9, "diamond")]:
    assert [i for i, value in enumerate(memory, 1) if value == symbol] == [first, second]
    assert f"{symbol.title()} at {first} matches {second}" in weekend.answer_text
assert [numbers[i - 1] for i in [1, 4, 5, 8]] == [7, 3, 8, 2]
for first, second in [(1, 4), (5, 8)]:
    assert numbers[first - 1] + numbers[second - 1] == 10
    assert f"positions {first} and {second}" in weekend.answer_text
assert len(weekend.details) == 5 and all("open" not in d for d in weekend.details)
assert len(weekend.ids) == len(set(weekend.ids))
for anchor in ["remember-two-symbols", "make-ten-twice"]:
    assert anchor in weekend.ids and "#" + anchor in weekend.links
    assert weekend_route + "#" + anchor in short_sessions.links
for link in ["/daily/memory-pairs/?layout=5", "/daily/number-pairs/?layout=5", CHALLENGE, weekend_guide]:
    assert link in weekend.links, link
assert weekend_route in daily.links
for route, parsed in [(weekend_route, weekend), (weekend_guide, short_sessions)]:
    assert "https://puzzlepia.com" + route in urls
    assert parsed.canonical == "https://puzzlepia.com" + route
    assert parsed.meta["description"] and parsed.meta["og:description"]
print("Weekend pairs PASS: both Layout 5 boards, exact answers, five closed disclosures, entry points and sitemap.")
