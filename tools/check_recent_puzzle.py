#!/usr/bin/env python3
"""Check the built recent-puzzle catalog and draft/future exclusion."""

import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.index, self.read_index, self.scripts, self.entry = "", False, [], None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "script":
            self.read_index = attrs.get("id") == "puzzlepia-recent-index"
            if "src" in attrs:
                self.scripts.append(attrs["src"])
        if "data-puzzle-entry" in attrs:
            self.entry = attrs

    def handle_data(self, text):
        if self.read_index:
            self.index += text

    def handle_endtag(self, tag):
        if tag == "script":
            self.read_index = False


home = Page((ROOT / "public/index.html").read_text())
entries = json.loads(home.index)
assert len(entries) == len({entry["url"] for entry in entries}) == 7
for entry in entries:
    target = Page((ROOT / "public" / entry["url"].strip("/") / "index.html").read_text())
    assert json.loads(target.index) == entries
    assert target.entry["data-puzzle-url"] == entry["url"]
    assert target.entry["data-puzzle-title"] == entry["title"]
    assert target.entry["data-puzzle-description"] == entry["description"]
    assert "?" not in entry["url"] and "#" not in entry["url"]
for route in ["daily", "daily/challenges/star-word-warmup"]:
    page = Page((ROOT / "public" / route / "index.html").read_text())
    assert json.loads(page.index) == entries
    assert page.entry is None
scripts = [src for src in home.scripts if "puzzlepia-return.min." in src]
assert len(scripts) == 1
assert hashlib.sha256((ROOT / "public" / scripts[0].lstrip("/")).read_bytes()).hexdigest() in scripts[0]

with tempfile.TemporaryDirectory(prefix="puzzlepia-recent-") as folder:
    fixture = Path(folder)
    files = {
        "hugo.toml": 'baseURL = "https://example.test/"\n',
        "layouts/index.html": '{{ partial "scripts.html" . }}',
    }
    for slug, fields in [("live", "playable: true"), ("draft", "playable: true\ndraft: true"),
                         ("future", "playable: true\npublishDate: 2999-01-01"),
                         ("challenge", "playable: false")]:
        files["content/daily/" + slug + ".md"] = "---\ntitle: Example\ndescription: Example puzzle\n" + fields + "\n---\n"
    for name, value in files.items():
        path = fixture / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value)
    for name in ["layouts/partials/scripts.html", "static/js/puzzlepia-return.js"]:
        path = fixture / name
        path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / name, path)
    result = subprocess.run(["hugo", "--source", folder], capture_output=True, text=True)
    assert result.returncode == 0, result.stdout + result.stderr
    output = Page((fixture / "public/index.html").read_text())
    assert [entry["url"] for entry in json.loads(output.index)] == ["/daily/live/"]

print("Recent output passed: seven published canonical games, current metadata, fingerprint, draft/future/type exclusion.")
