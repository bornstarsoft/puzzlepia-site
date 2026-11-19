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
    "word-search": ["kiwi-backward-word-search", "star-diagonal-word-search", "find-wave-upward"],
    "block-puzzle": ["find-the-square-space", "domino-before-the-square", "open-board-block-challenge"],
    "ring-puzzle": ["ring-size-practice", "three-rings-three-spaces", "two-rings-one-cell"],
    "memory-pairs": ["remember-the-star-pair", "two-reveals-one-pair", "remember-two-pair-locations"],
    "number-pairs": ["find-the-ten-pairs", "choose-either-eight", "four-fives-two-pairs"],
    "number-puzzle": ["quick-number-focus", "number-order-1-to-10", "find-the-final-four-numbers"],
    "color-match": ["pink-color-match-challenge", "mint-color-match", "gold-color-target"],
}
AFTER_COMPLETE = {
    "word-search": "find-note-check-the-last-letter",
    "block-puzzle": "block-puzzle-two-rows",
    "ring-puzzle": "ring-puzzle-two-cells",
    "memory-pairs": "memory-pairs-clear-one-card",
    "number-pairs": "make-ten-after-a-mismatch",
    "number-puzzle": "find-consecutive-neighbors",
    "color-match": "color-match-two-squares",
}


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.in_rounds = False
        self.rounds = []
        self.links = []
        self.ids = []
        self.lists = 0
        self.completion = []
        self.completion_depth = 0
        self.feed(html)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "div":
            if "data-complete-actions" in attrs:
                assert not self.completion_depth and "hidden" in attrs
                self.completion_depth = 1
            elif self.completion_depth:
                self.completion_depth += 1
        if tag == "ol" and "practice-path__rounds" in attrs.get("class", "").split():
            self.in_rounds = True
            self.lists += 1
        if tag == "a":
            self.links.append(attrs.get("href"))
            if "data-completion-practice" in attrs:
                assert self.completion_depth > 0
                self.completion.append(attrs.get("href"))
            if self.in_rounds:
                self.rounds.append(attrs.get("href"))

    def handle_endtag(self, tag):
        if tag == "div" and self.completion_depth:
            self.completion_depth -= 1
        if tag == "ol":
            self.in_rounds = False


for game, slugs in ROUNDS.items():
    page = Page((ROOT / "public/daily" / game / "index.html").read_text())
    expected = ["/daily/challenges/" + slug + "/" for slug in slugs]
    assert page.lists == 1 and page.rounds == expected, game
    assert len(page.ids) == len(set(page.ids)), game + ": duplicate IDs"
    assert any(link.startswith("/blog/") for link in page.links), game + ": missing guide"
    next_link = "/daily/challenges/" + AFTER_COMPLETE[game] + "/"
    assert page.completion == [next_link], game
    assert (ROOT / "public" / next_link.strip("/") / "index.html").is_file(), next_link
    for link in expected:
        assert (ROOT / "public" / link.strip("/") / "index.html").is_file(), link

home = Page((ROOT / "public/index.html").read_text())
assert home.lists == 0 and not home.completion, "Homepage stays unchanged"

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
    parts = fixture / "layouts/partials/daily-game"
    parts.mkdir()
    shutil.copyfile(ROOT / "layouts/partials/daily-game/completion-practice.html", parts / "completion-practice.html")
    (fixture / "layouts/_default/baseof.html").write_text(
        '{{ block "main" . }}{{ end }}<div data-complete-actions hidden>'
        '{{ partial "daily-game/completion-practice.html" . }}</div>'
    )
    (fixture / "data/puzzle_catalog.json").write_text(json.dumps({
        "/daily/test/": {
            "guide": "/blog/example/",
            "challenge": "/daily/challenges/fallback/",
            "afterComplete": "/daily/challenges/example/",
        }
    }))
    for case, fields in [
        ("published", "challenge: true"),
        ("draft", "challenge: true\ndraft: true"),
        ("future", "challenge: true\npublishDate: 2999-01-01"),
        ("playable", "challenge: true\nplayable: true"),
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
            assert Page((fixture / "public/daily/test/index.html").read_text()).completion == [
                "/daily/challenges/example/"
            ]
        else:
            assert result.returncode != 0 and "completion practice" in result.stderr.lower(), (case, result.stderr)

print(f"Practice paths passed: seven completion links, seven ordered paths with {sum(map(len, ROUNDS.values()))} rounds, unchanged Home and publication guards.")
