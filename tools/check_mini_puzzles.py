#!/usr/bin/env python3
"""Verify the mini collection links to both rounds of each listed puzzle."""

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

PUBLIC = Path(__file__).resolve().parents[1] / "public"
COLLECTION = "/daily/mini-puzzles/"
TOPICS = {"words-and-routes", "pictures-and-colors", "numbers-and-logic"}
EXPECTED = {
    "mini-word-ladders", "mini-route-puzzles", "mini-picture-grids",
    "mini-color-codes", "mini-balance-puzzles", "mini-sum-grids",
    "mini-logic-lineups", "mini-tile-flips", "mini-word-squares",
}


class Page(HTMLParser):
    def __init__(self, route):
        super().__init__()
        self.ids, self.links = [], []
        self.feed((PUBLIC / route.strip("/") / "index.html").read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "a" and "href" in attrs:
            self.links.append(attrs["href"])


page = Page(COLLECTION)
assert TOPICS <= set(page.ids)
assert {"#" + topic for topic in TOPICS} <= set(page.links)
round_links = [
    urlsplit(href) for href in page.links if href.startswith("/daily/challenges/")
]
assert len(round_links) == len(set(round_links)) == 2 * len(EXPECTED)
assert Counter(link.path.strip("/").split("/")[-1] for link in round_links) == dict.fromkeys(EXPECTED, 2)
for path in {link.path for link in round_links}:
    rounds = [link.fragment for link in round_links if link.path == path]
    assert [fragment[:8] for fragment in rounds] == ["round-1-", "round-2-"], rounds
    ids = Page(path).ids
    assert all(ids.count(anchor) == 1 for anchor in rounds), (path, rounds)

assert Page("/daily/").links.count(COLLECTION) == 1
assert COLLECTION not in Page("/").links
assert "/daily/#playable-daily-title" in page.links
for slug in ("mini-balance-puzzles", "mini-logic-lineups", "mini-tile-flips"):
    assert COLLECTION + "#numbers-and-logic" in Page(f"/daily/challenges/{slug}/").links
assert COLLECTION + "#words-and-routes" in Page("/daily/challenges/mini-word-squares/").links

urls = {node.text for node in ET.parse(PUBLIC / "sitemap.xml").findall(".//{*}loc")}
feed = {node.text for node in ET.parse(PUBLIC / "daily/index.xml").findall("./channel/item/link")}
assert "https://puzzlepia.com" + COLLECTION in urls - feed
print(f"Mini Puzzle Breaks PASS: {len(EXPECTED)} puzzles, {len(round_links)} round anchors, and Daily discovery.")
