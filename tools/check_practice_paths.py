#!/usr/bin/env python3
"""Check built practice links and Hugo's publication guards; no extra packages."""

import json
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parents[1]
ROUNDS = {
    "word-search": ["kiwi-backward-word-search", "star-diagonal-word-search"],
    "block-puzzle": ["find-the-square-space", "domino-before-the-square", "open-board-block-challenge"],
    "ring-puzzle": ["ring-size-practice", "three-rings-three-spaces", "two-rings-one-cell"],
    "memory-pairs": ["remember-the-star-pair", "two-reveals-one-pair", "remember-two-pair-locations"],
    "number-pairs": ["find-the-ten-pairs", "choose-either-eight", "four-fives-two-pairs"],
    "number-puzzle": ["quick-number-focus", "number-order-1-to-10", "find-the-final-four-numbers"],
    "color-match": ["pink-color-match-challenge", "mint-color-match", "gold-color-target"],
}


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.in_rounds = False
        self.rounds = []
        self.links = []
        self.ids = []
        self.lists = 0
        self.feed(html)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "ol" and "practice-path__rounds" in attrs.get("class", "").split():
            self.in_rounds = True
            self.lists += 1
        if tag == "a":
            self.links.append(attrs.get("href"))
            if self.in_rounds:
                self.rounds.append(attrs.get("href"))

    def handle_endtag(self, tag):
        if tag == "ol":
            self.in_rounds = False


for game, slugs in ROUNDS.items():
    page = Page((ROOT / "public/daily" / game / "index.html").read_text())
    expected = ["/daily/challenges/" + slug + "/" for slug in slugs]
    assert page.lists == 1 and page.rounds == expected, game
    assert len(page.ids) == len(set(page.ids)), game + ": duplicate IDs"
    assert any(link.startswith("/blog/") for link in page.links), game + ": missing guide"
    for link in expected:
        assert (ROOT / "public" / link.strip("/") / "index.html").is_file(), link

assert Page((ROOT / "public/index.html").read_text()).lists == 0, "Homepage stays unchanged"

# Build isolated, generated fixtures: no real content or draft is modified.
with tempfile.TemporaryDirectory(prefix="puzzlepia-practice-") as folder:
    fixture = Path(folder)
    files = {
        "hugo.toml": 'baseURL = "https://example.test/"\n',
        "layouts/_default/baseof.html": '{{ block "main" . }}{{ end }}',
        "layouts/partials/breadcrumbs.html": "",
        "content/daily/test.md": '---\ntitle: Test\n---\nTest puzzle.\n',
        "data/puzzle_catalog.json": json.dumps({
            "/daily/test/": {
                "guide": "/blog/example/",
                "practice": ["/daily/challenges/example/"],
            }
        }),
    }
    for name, value in files.items():
        path = fixture / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value)
    (fixture / "layouts/daily").mkdir()
    shutil.copyfile(ROOT / "layouts/daily/single.html", fixture / "layouts/daily/single.html")
    shutil.copyfile(ROOT / "layouts/partials/daily-challenge-topic.html", fixture / "layouts/partials/daily-challenge-topic.html")
    challenge = fixture / "content/daily/challenges/example.md"
    challenge.parent.mkdir()
    for case, fields in [
        ("published", "challenge: true"),
        ("draft", "challenge: true\ndraft: true"),
        ("future", "challenge: true\npublishDate: 2999-01-01"),
        ("wrong-type", "challenge: false"),
        ("missing", None),
    ]:
        if fields is None:
            challenge.unlink()
        else:
            challenge.write_text("---\ntitle: Example\n" + fields + "\n---\nExample.\n")
        result = subprocess.run(["hugo", "--source", folder], capture_output=True, text=True)
        if case == "published":
            assert result.returncode == 0, result.stdout + result.stderr
            assert Page((fixture / "public/daily/test/index.html").read_text()).rounds == ["/daily/challenges/example/"]
        else:
            assert result.returncode != 0, case + " should fail the build"
            assert "practice" in (result.stdout + result.stderr).lower(), case

print("Practice paths passed: seven ordered paths, twenty published rounds, unchanged home, unique IDs, and missing/draft/future/type build guards.")
