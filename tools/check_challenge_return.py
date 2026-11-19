#!/usr/bin/env python3
"""Check Daily navigation and feed publication boundaries."""

from email.utils import parsedate_to_datetime
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
        self.latest = {"new": [], "updated": []}
        self.latest_kind = None
        self.weekly, self.weekly_default = [], None
        self.weekly_next = []
        self.contextual_returns = []
        self.return_scripts = []
        self.feed_links, self.feed_in_latest = [], []
        self.shortcuts, self.focus_targets = [], []
        self.in_shortcuts = False
        self.topic = None
        self.return_links = None
        self.in_latest = False
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
            if attrs.get("tabindex") == "-1":
                self.focus_targets.append(attrs["id"])
        if tag == "nav" and "daily-hub__shortcuts" in attrs.get("class", "").split():
            assert attrs.get("aria-label") == "On this page"
            self.in_shortcuts = True
        if tag == "article" and "data-discovery-item" in attrs:
            self.topic = attrs["data-topic"]
        if tag == "details" and attrs.get("id") == "latest-challenges":
            assert "open" not in attrs
            self.in_latest = True
        if self.in_latest and tag == "ul":
            if "data-recently-published" in attrs:
                self.latest_kind = "new"
            elif "data-recently-updated" in attrs:
                self.latest_kind = "updated"
        if tag == "script" and "/js/challenge-list-return.min." in attrs.get("src", ""):
            self.return_scripts.append(attrs["src"])
        if tag == "link" and attrs.get("type") == "application/rss+xml":
            assert attrs.get("rel") == "alternate"
            self.feed_links.append(attrs["href"])
        if self.latest_kind and tag == "time":
            self.latest[self.latest_kind][-1][1] = attrs["datetime"]
        if tag == "nav" and "challenge-return" in attrs.get("class", "").split():
            assert attrs.get("aria-label") == "More Daily Challenges"
            self.return_links = []
            self.returns.append(self.return_links)
        if tag == "a":
            if self.in_shortcuts:
                self.shortcuts.append(attrs["href"])
            if "data-next-weekly-practice" in attrs:
                self.weekly_next.append(attrs["href"])
            if "data-weekly-link" in attrs:
                self.weekly_default = attrs["href"]
            if "data-weekly-option" in attrs:
                assert "aria-current" not in attrs
                self.weekly.append(attrs["href"])
            if self.in_latest:
                if attrs["href"] == "/daily/index.xml":
                    self.feed_in_latest.append(attrs["href"])
                elif self.latest_kind:
                    self.latest[self.latest_kind].append([attrs["href"], None])
            if self.topic is not None:
                self.cards[attrs["href"]] = self.topic
            if self.return_links is not None:
                self.return_links.append(attrs["href"])
                assert "nofollow" not in attrs.get("rel", "").split()
            if "data-challenge-list-return" in attrs:
                assert self.return_links is not None
                self.contextual_returns.append((attrs["data-challenge-list-return"], attrs["href"]))

    def handle_endtag(self, tag):
        if tag == "article":
            self.topic = None
        if tag == "nav":
            self.return_links = None
            self.in_shortcuts = False
        if tag == "details":
            self.in_latest = False
        if tag == "ul":
            self.latest_kind = None


def check_return(page, route, hub):
    if route not in hub.cards:
        assert not page.returns and not page.weekly_next and not page.contextual_returns, route
        return
    next_links = []
    if route in hub.weekly:
        index = hub.weekly.index(route)
        next_links.append(hub.weekly[(index + 1) % len(hub.weekly)])
    weekly_links = next_links + ["/daily/#weekly-practice"] if next_links else []
    topic = hub.cards[route]
    assert page.returns == [weekly_links + [f"/daily/?topic={topic}#daily-challenge-title",
                                           "/daily/#daily-challenge-title"]], route
    assert page.weekly_next == next_links, route
    assert page.contextual_returns == [("/daily/", f"/daily/?topic={topic}#daily-challenge-title")], route


def check_feed(root, origin):
    feed = ET.parse(root / "daily/index.xml").getroot()
    assert feed.tag == "rss" and feed.get("version") == "2.0"
    channel = feed.find("channel")
    assert channel.findtext("title") == "Puzzlepia Daily Challenges"
    assert channel.findtext("link") == origin + "/daily/"
    feed_url = origin + "/daily/index.xml"
    assert channel.find("{http://www.w3.org/2005/Atom}link").attrib == {
        "href": feed_url, "rel": "self", "type": "application/rss+xml",
    }
    items = channel.findall("item")
    links = [item.findtext("link") for item in items]
    assert links == [item.findtext("guid") for item in items]
    assert len(links) == len(set(links))
    dates = [parsedate_to_datetime(item.findtext("pubDate")) for item in items]
    assert dates == sorted(dates, reverse=True)
    return items


hub = Page((ROOT / "public/daily/index.html").read_text())
assert hub.shortcuts == ["#playable-daily-title", "#weekly-practice", "#daily-challenge-title"]
assert all(link[1:] in hub.focus_targets for link in hub.shortcuts)
assert hub.feed_links == ["https://puzzlepia.com/daily/index.xml"]
assert hub.feed_in_latest == ["/daily/index.xml"]
assert set(hub.cards.values()) == {"word", "block", "ring", "number", "color", "memory", "mixed"}
assert "daily-challenge-title" in hub.ids
assert len(hub.latest["new"]) == len(hub.latest["updated"]) == 3
entries = hub.latest["new"] + hub.latest["updated"]
assert len({route for route, _ in entries}) == len(entries)
assert all(route in hub.cards for route, _ in entries)
for group in hub.latest.values():
    dates = [date for _, date in group]
    assert dates == sorted(dates, reverse=True)
assert len(hub.weekly) == len(set(hub.weekly)) == 6
assert hub.weekly_default == hub.weekly[0]
assert all(route in hub.cards for route in hub.weekly)
assert hub.ids.count("weekly-practice") == 1
checked = 0
for path in (ROOT / "public").rglob("index.html"):
    route = "/" + str(path.parent.relative_to(ROOT / "public")) + "/"
    page = Page(path.read_text())
    assert len(page.ids) == len(set(page.ids)), path
    if route != "/daily/":
        assert "https://puzzlepia.com/daily/index.xml" not in page.feed_links and not page.feed_in_latest, path
        assert not page.shortcuts, path
    check_return(page, route, hub)
    assert len(page.return_scripts) == int(route in hub.cards), route
    assert all((ROOT / "public" / script.lstrip("/")).is_file() for script in page.return_scripts), route
    checked += route in hub.cards
assert checked == len(hub.cards) > 0
urls = {n.text for n in ET.parse(ROOT / "public/sitemap.xml").findall(".//{*}loc")}
assert all("https://puzzlepia.com" + route in urls for route in hub.cards)
assert all("?topic=" not in url for url in urls), "query variants are not new content"
feed_items = check_feed(ROOT / "public", "https://puzzlepia.com")
assert len(feed_items) == min(20, len(hub.cards))
assert ["https://puzzlepia.com" + route for route, _ in hub.latest["new"]] == [
    item.findtext("link") for item in feed_items[:3]
]
for item in feed_items:
    link = item.findtext("link")
    assert link in urls and link.removeprefix("https://puzzlepia.com") in hub.cards
    assert item.findtext("title") and item.findtext("description") and not list(item.find("description"))

with tempfile.TemporaryDirectory(prefix="puzzlepia-challenge-return-") as folder:
    fixture = Path(folder)
    files = {
        "hugo.toml": 'baseURL = "https://example.test/"\n',
        "layouts/_default/baseof.html": '{{ block "main" . }}{{ end }}',
        "layouts/partials/breadcrumbs.html": "",
        "layouts/partials/game-card.html": "",
        "layouts/partials/recent-puzzle.html": "",
        "data/weekly_practice.json": json.dumps(["/daily/words/", "/daily/blocks/"]),
        "content/daily/_index.md": '---\ntitle: Daily\n---\n',
    }
    for name, value in files.items():
        path = fixture / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value)
    for name in ["layouts/daily/list.html", "layouts/daily/single.html", "layouts/daily/rss.xml",
                 "layouts/partials/daily-challenge-topic.html", "layouts/partials/weekly-practice.html"]:
        (fixture / name).parent.mkdir(parents=True, exist_ok=True)
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
        "unlisted": {"title": "Unlisted", "challenge": True, "noindex": True, "date": "2025-02-28"},
    })
    fields_by_slug["words"].update(date="2024-01-01", lastmod="2025-03-03")
    fields_by_slug["blocks"].update(date="2025-03-02", title="Blocks & space", description="Which pieces fit: A < B?")
    fields_by_slug["rings"].update(date="2025-03-01")
    fields_by_slug["blocks"]["lastmod"] = "2025-05-01"
    fields_by_slug["numbers"].update(date="2023-04-01", lastmod="2025-03-04")
    fields_by_slug["memory"].update(date="2023-03-01", lastmod="2025-03-02")
    fields_by_slug["colors"].update(date="2023-02-01", lastmod="2025-03-01")
    fields_by_slug["pattern"].update(date="2023-01-01", lastmod="2999-01-01")
    fields_by_slug["playable"].update(date="2025-04-01")
    fields_by_slug["draft"].update(date="2025-04-02")
    fields_by_slug["unlisted"].update(date="2025-04-03", lastmod="2025-05-02")
    for slug, fields in fields_by_slug.items():
        (fixture / "content/daily" / (slug + ".md")).write_text(json.dumps(fields) + "\nExample.\n")
    result = subprocess.run(["hugo", "--source", folder], capture_output=True, text=True)
    assert result.returncode == 0, result.stdout + result.stderr
    fixture_hub = Page((fixture / "public/daily/index.html").read_text())
    assert fixture_hub.shortcuts == hub.shortcuts
    assert all(link[1:] in fixture_hub.focus_targets for link in fixture_hub.shortcuts)
    assert fixture_hub.weekly == ["/daily/words/", "/daily/blocks/"]
    assert fixture_hub.weekly_default == "/daily/words/"
    assert fixture_hub.latest == {
        "new": [["/daily/blocks/", "2025-03-02"], ["/daily/rings/", "2025-03-01"], ["/daily/words/", "2024-01-01"]],
        "updated": [["/daily/numbers/", "2025-03-04"], ["/daily/memory/", "2025-03-02"], ["/daily/colors/", "2025-03-01"]],
    }
    result = subprocess.run(["hugo", "--source", folder, "-D", "-F", "--destination", "with-drafts"],
                            capture_output=True, text=True)
    assert result.returncode == 0, result.stdout + result.stderr
    assert Page((fixture / "with-drafts/daily/index.html").read_text()).latest == fixture_hub.latest
    items = check_feed(fixture / "with-drafts", "https://example.test")
    assert [item.findtext("link") for item in items] == [
        f"https://example.test/daily/{slug}/" for slug in ("blocks", "rings", "words", "numbers", "memory", "colors", "pattern")
    ]
    assert items[0].findtext("title") == "Blocks & space"
    assert items[0].findtext("description") == "Which pieces fit: A < B?"
    for slug, (_, topic) in cases.items():
        route = f"/daily/{slug}/"
        assert fixture_hub.cards[route] == topic
        check_return(Page((fixture / "public/daily" / slug / "index.html").read_text()), route, fixture_hub)
    for slug in ["ordinary", "playable"]:
        assert not Page((fixture / "public/daily" / slug / "index.html").read_text()).returns
    for slug in ["draft", "future"]:
        assert not (fixture / "public/daily" / slug / "index.html").exists()
    (fixture / "data/weekly_practice.json").write_text("[]")
    (fixture / "content/daily/playable.md").unlink()
    result = subprocess.run(["hugo", "--source", folder], capture_output=True, text=True)
    assert result.returncode == 0, result.stdout + result.stderr
    fixture_hub = Page((fixture / "public/daily/index.html").read_text())
    assert fixture_hub.shortcuts == ["#daily-challenge-title"]
    for slug in ["words", "ordinary", "playable", "draft", "future", "does-not-exist"]:
        (fixture / "data/weekly_practice.json").write_text(json.dumps(["/daily/words/", f"/daily/{slug}/"]))
        result = subprocess.run(["hugo", "--source", folder], capture_output=True, text=True)
        assert result.returncode != 0 and "weekly practice" in (result.stdout + result.stderr).lower(), (
            slug, result.stdout, result.stderr
        )

print(f"Challenge return PASS: {checked} published pages, split recap, weekly links, RSS and sitemap boundaries.")
