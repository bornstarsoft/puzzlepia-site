#!/usr/bin/env python3
"""Check Hugo's built search index and practice publication guards."""

import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PICKS = ["kiwi-backward-word-search", "find-the-square-space", "pink-color-match-challenge"]


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.index, self.read_index = "", False
        self.links, self.scripts, self.meta, self.ids = [], [], {}, []
        self.canonical = ""
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "script":
            self.read_index = attrs.get("id") == "puzzlepia-search-index"
            if "src" in attrs:
                self.scripts.append(attrs["src"])
        if tag == "a":
            self.links.append(attrs.get("href", ""))
        if tag == "meta":
            self.meta[attrs.get("name", attrs.get("property"))] = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href")

    def handle_data(self, text):
        if self.read_index:
            self.index += text

    def handle_endtag(self, tag):
        if tag == "script":
            self.read_index = False


page = Page((ROOT / "public/search/index.html").read_text())
entries = json.loads(page.index)
assert entries and len({entry["url"] for entry in entries}) == len(entries)
assert len(page.ids) == len(set(page.ids))
for entry in entries:
    assert entry["category"] in ["playable", "games", "guides", "challenges"]
    assert entry["url"].startswith(("/daily/", "/games/", "/blog/"))
    assert "?" not in entry["url"] and ".." not in entry["url"]
    assert (ROOT / "public" / entry["url"].strip("/") / "index.html").is_file()
    for field in ["title", "description", "keywords", "typeLabel", "actionLabel", "topic"]:
        assert isinstance(entry[field], str) and entry[field], entry
for slug in PICKS:
    assert "/daily/challenges/" + slug + "/" in page.links
assert "noindex" in page.meta["robots"]
assert page.canonical == "https://puzzlepia.com/search/"
assert page.meta["description"] and page.meta["og:title"] and page.meta["og:description"]
urls = {node.text for node in ET.parse(ROOT / "public/sitemap.xml").iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")}
assert "https://puzzlepia.com/search/" not in urls
scripts = [src for src in page.scripts if "puzzlepia-search.min." in src]
assert len(scripts) == 1
assert hashlib.sha256((ROOT / "public" / scripts[0].lstrip("/")).read_bytes()).hexdigest() in scripts[0]

# Exercise missing/draft/future guards in generated fixtures, never real content.
with tempfile.TemporaryDirectory(prefix="puzzlepia-search-") as folder:
    fixture = Path(folder)
    files = {
        "hugo.toml": 'baseURL = "https://example.test/"\n',
        "layouts/_default/baseof.html": '{{ block "main" . }}{{ end }}',
        "layouts/_default/single.html": '{{ define "main" }}{{ .Content }}{{ end }}',
        "content/search/_index.md": '---\ntitle: Search\n---\n',
    }
    for slug in PICKS:
        files["content/daily/challenges/" + slug + ".md"] = '---\ntitle: Example\nchallenge: true\n---\nExample.\n'
    for name, value in files.items():
        path = fixture / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value)
    (fixture / "layouts/search").mkdir()
    shutil.copyfile(ROOT / "layouts/search/list.html", fixture / "layouts/search/list.html")
    target = fixture / "content/daily/challenges" / (PICKS[0] + ".md")
    for case, fields in [("published", "challenge: true"), ("draft", "challenge: true\ndraft: true"),
                         ("future", "challenge: true\npublishDate: 2999-01-01"),
                         ("wrong-type", "challenge: false"), ("missing", None)]:
        if fields is None:
            target.unlink()
        else:
            target.write_text("---\ntitle: Example\n" + fields + "\n---\nExample.\n")
        result = subprocess.run(["hugo", "--source", folder], capture_output=True, text=True)
        if case == "published":
            assert result.returncode == 0, result.stdout + result.stderr
        else:
            assert result.returncode != 0 and "Search practice pick" in result.stdout + result.stderr, case

print(f"Search output passed: {len(entries)} unique published entries, three practice picks, noindex/canonical/sitemap, fingerprint and publication guards.")
