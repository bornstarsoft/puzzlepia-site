#!/usr/bin/env python3
"""Check challenge-to-collection links and Hugo topic/publication boundaries."""

from html.parser import HTMLParser
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.cards, self.returns, self.ids = {}, [], []
        self.topic = None
        self.return_links = None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "article" and "data-discovery-item" in attrs:
            self.topic = attrs["data-topic"]
        if tag == "nav" and "challenge-return" in attrs.get("class", "").split():
            assert attrs.get("aria-label") == "More Daily Challenges"
            self.return_links = []
            self.returns.append(self.return_links)
        if tag == "a":
            if self.topic is not None:
                self.cards[attrs["href"]] = self.topic
            if self.return_links is not None:
                self.return_links.append(attrs["href"])
                assert "nofollow" not in attrs.get("rel", "").split()

    def handle_endtag(self, tag):
        if tag == "article":
            self.topic = None
        if tag == "nav":
            self.return_links = None


def expected(topic):
    return [[f"/daily/?topic={topic}#daily-challenge-title", "/daily/#daily-challenge-title"]]


hub = Page((ROOT / "public/daily/index.html").read_text())
assert set(hub.cards.values()) == {"word", "block", "ring", "number", "color", "memory", "mixed"}
assert "daily-challenge-title" in hub.ids
checked = 0
for path in (ROOT / "public").rglob("index.html"):
    route = "/" + str(path.parent.relative_to(ROOT / "public")) + "/"
    page = Page(path.read_text())
    assert len(page.ids) == len(set(page.ids)), path
    if route in hub.cards:
        assert page.returns == expected(hub.cards[route]), route
        checked += 1
    else:
        assert not page.returns, (route, "non-challenge navigation")
assert checked == len(hub.cards) > 0
urls = {n.text for n in ET.parse(ROOT / "public/sitemap.xml").findall(".//{*}loc")}
assert all("https://puzzlepia.com" + route in urls for route in hub.cards)
assert all("?topic=" not in url for url in urls), "query variants are not new content"

with tempfile.TemporaryDirectory(prefix="puzzlepia-challenge-return-") as folder:
    fixture = Path(folder)
    files = {
        "hugo.toml": 'baseURL = "https://example.test/"\n',
        "layouts/_default/baseof.html": '{{ block "main" . }}{{ end }}',
        "layouts/daily/list.html": '{{ define "main" }}Daily{{ end }}',
        "layouts/partials/breadcrumbs.html": "",
        "content/daily/_index.md": '---\ntitle: Daily\n---\n',
    }
    for name, value in files.items():
        path = fixture / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value)
    for name in ["layouts/daily/single.html", "layouts/partials/daily-challenge-topic.html"]:
        shutil.copyfile(ROOT / name, fixture / name)
    cases = {
        "words": ("WORD SEARCH", "word"), "blocks": ("Block puzzle", "block"),
        "rings": ("Color rings", "ring"), "numbers": ("Number puzzle", "number"),
        "memory": ("Memory matching", "memory"), "colors": ("Color matching", "color"),
        "pattern": ("Pattern", "color"), "mixed": ("Mixed puzzle", "mixed"),
        "unknown": ("Other", "mixed"), "missing": (None, "mixed"),
    }
    fields_by_slug = {}
    for slug, (kind, _) in cases.items():
        fields_by_slug[slug] = {"title": slug, "challenge": True}
        if kind is not None:
            fields_by_slug[slug]["puzzleType"] = kind
    fields_by_slug.update({
        "ordinary": {"title": "Ordinary", "challenge": False},
        "playable": {"title": "Playable", "challenge": True, "playable": True},
        "draft": {"title": "Draft", "challenge": True, "draft": True},
        "future": {"title": "Future", "challenge": True, "publishDate": "2999-01-01"},
    })
    for slug, fields in fields_by_slug.items():
        (fixture / "content/daily" / (slug + ".md")).write_text(json.dumps(fields) + "\nExample.\n")
    result = subprocess.run(["hugo", "--source", folder], capture_output=True, text=True)
    assert result.returncode == 0, result.stdout + result.stderr
    for slug, (_, topic) in cases.items():
        assert Page((fixture / "public/daily" / slug / "index.html").read_text()).returns == expected(topic), slug
    for slug in ["ordinary", "playable"]:
        assert not Page((fixture / "public/daily" / slug / "index.html").read_text()).returns
    for slug in ["draft", "future"]:
        assert not (fixture / "public/daily" / slug / "index.html").exists()

print(f"Challenge return PASS: {checked} published pages, seven collections, native links, sitemap and 14 type/publication fixtures.")
