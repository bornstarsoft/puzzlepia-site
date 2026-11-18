"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(require.resolve("../static/js/puzzlepia-discovery.js"), "utf8");

function element(attrs = {}, text = "") {
  return {
    attrs: { ...attrs }, textContent: text, hidden: false, value: "", events: {},
    getAttribute(name) { return this.attrs[name] ?? null; },
    hasAttribute(name) { return Object.hasOwn(this.attrs, name); },
    setAttribute(name, value) { this.attrs[name] = value; },
    addEventListener(name, fn) { this.events[name] = fn; },
    fire(name) { this.events[name]?.(); }
  };
}

function setup(search = "", options = {}) {
  const topics = ["all", "word", "block", "ring", "number", "color", "memory", "mixed"];
  const buttons = topics.map(topic => element({ "data-filter-value": topic }, topic));
  const items = options.noItems ? [] : ["ring", "block", "ring", "number", "block", "word"].map((topic, index) =>
    element({ "data-topic": topic, "data-search-text": topic + " practice",
      "data-level": ["easy", "normal", "normal", "easy", "easy", ""][index],
      "data-id": index, "data-updated": [10, 20, 50, 40, 20, 60][index] }));
  const domOrder = items.slice();
  const controls = Object.fromEntries(["search", "search-wrap", "count", "empty", "more", "link", "link-wrap"].map(key =>
    ["[data-filter-" + key + "]", element()]));
  if (!options.blog) {
    controls["[data-filter-level]"] = Object.assign(element(), {
      options: ["all", "easy", "normal"].map(value => ({ value })), value: "all"
    });
    controls["[data-filter-level-wrap]"] = element();
    controls["[data-filter-level-wrap]"].hidden = true;
    controls["[data-filter-sort]"] = element();
    controls["[data-filter-sort-wrap]"] = element();
    controls["[data-filter-sort-wrap]"].hidden = true;
    controls["[data-filter-list]"] = { appendChild(item) { domOrder.splice(domOrder.indexOf(item), 1); domOrder.push(item); } };
  }
  controls["[data-filter-link-wrap]"].hidden = true;
  controls["[data-filter-search-wrap]"].hidden = true;
  const group = element({ "data-limit": "2", "data-unit": "challenges",
    ...(options.blog ? {} : { "data-discovery-url": "", "data-unit-singular": "challenge" }) });
  group.querySelectorAll = selector => selector === "[data-filter-value]" ? buttons : items;
  group.querySelector = selector => options.noControls ? null : controls[selector];
  const events = {}, pushes = [], replacements = [];
  const location = { pathname: options.blog ? "/blog/" : "/daily/", search, hash: "#daily-challenge-title" };
  function changeState(log) {
    return function (state, title, url) {
      if (options.blockHistory) throw Error("History unavailable");
      assert.deepEqual(state, { existing: true });
      log.push(url);
      const parsed = new URL(url, "https://puzzlepia.com");
      location.search = parsed.search; location.hash = parsed.hash;
    };
  }
  const history = { state: { existing: true }, pushState: changeState(pushes), replaceState: changeState(replacements) };
  const window = { location, history, URLSearchParams: options.noURL ? undefined : URLSearchParams,
    addEventListener(name, fn) { events[name] = fn; } };
  Object.defineProperty(window, "localStorage", { get() { throw Error("No storage should be used"); } });
  vm.runInNewContext(source, { document: { querySelectorAll: () => [group] }, window });
  return {
    buttons, items, controls, events, pushes, replacements, location,
    visible: () => domOrder.filter(item => !item.hidden).map(item => item.getAttribute("data-topic")),
    visibleIDs: () => domOrder.filter(item => !item.hidden).map(item => item.getAttribute("data-id")),
    active: () => buttons.find(button => button.getAttribute("aria-pressed") === "true")?.getAttribute("data-filter-value"),
    click(topic) { buttons.find(button => button.getAttribute("data-filter-value") === topic).fire("click"); },
    more() { controls["[data-filter-more]"].fire("click"); },
    level(value) {
      controls["[data-filter-level]"].value = value;
      controls["[data-filter-level]"].fire("change");
    },
    sort(value) {
      controls["[data-filter-sort]"].value = value;
      controls["[data-filter-sort]"].fire("change");
    },
    type(value) {
      controls["[data-filter-search]"].value = value;
      controls["[data-filter-search]"].fire("input");
    },
    link: () => controls["[data-filter-link]"].getAttribute("href"),
    restore(search, event = "popstate") { location.search = search; events[event]?.(); }
  };
}

let view = setup();
assert.equal(view.active(), "all");
assert.equal(view.visible().length, 2);
assert.equal(view.pushes.length, 0, "initialization must not alter browser history");
view.click("ring");
assert.deepEqual(view.visible(), ["ring", "ring"]);
assert.equal(view.location.search, "?topic=ring");
assert.equal(view.link(), "/daily/?topic=ring#daily-challenge-title");
view.click("ring");
assert.equal(view.pushes.length, 1, "same selection must not add a history entry");
view.click("all");
assert.equal(view.location.search, "");
view.more();
assert.equal(view.visible().length, 6);
assert.equal(view.location.search, "?view=all");
assert.equal(view.link(), "/daily/?view=all#daily-challenge-title");
view.restore("?topic=block");
assert.equal(view.active(), "block");
assert.deepEqual(view.visible(), ["block", "block"]);
view.restore("?view=all", "pageshow");
assert.equal(view.active(), "all");
assert.equal(view.visible().length, 6);
view.click("word");
assert.equal(view.location.search, "?topic=word", "new filter collapses expanded list");
assert.deepEqual(view.visible(), ["word"]);
assert.equal(view.controls["[data-filter-count]"].textContent, "1 challenge");

for (const topic of ["all", "word", "block", "ring", "number", "color", "memory", "mixed"]) {
  view = setup("?topic=" + topic + "&view=all");
  assert.equal(view.active(), topic);
  assert.equal(view.pushes.length, 0);
  assert.equal(view.controls["[data-filter-empty]"].hidden, view.visible().length > 0);
  assert.ok(!view.link().includes("topic=all"));
}
for (const search of ["?topic=unknown", "?topic=ring&topic=block", "?topic=", "?topic=RING", "?topic=%E0%A4%A", "?topic=https://example.com", "?topic=%3Cscript%3E"]) {
  view = setup(search);
  assert.equal(view.active(), "all");
  assert.equal(view.link(), "/daily/#daily-challenge-title");
}
for (const search of ["?view=unknown", "?view=all&view=all", "?view="]) {
  assert.equal(setup(search).visible().length, 2);
}
view = setup("?topic=ring&unrelated=ignored");
assert.equal(view.link(), "/daily/?topic=ring#daily-challenge-title");
view.click("block");
assert.equal(view.location.search, "?topic=block");

view = setup("?topic=block&q=Practice&view=all");
assert.deepEqual(view.visible(), ["block", "block"]);
assert.equal(view.controls["[data-filter-search]"].value, "Practice");
assert.equal(view.controls["[data-filter-search-wrap]"].hidden, false);
view.type(" RING ");
assert.deepEqual(view.visible(), [], "topic and keyword are combined");
assert.equal(view.location.search, "?topic=block&q=RING");
assert.equal(view.pushes.length, 0, "typing does not add history entries");
assert.equal(view.replacements.length, 1);
view.click("all");
assert.deepEqual(view.visible(), ["ring", "ring"]);
assert.equal(view.link(), "/daily/?q=RING#daily-challenge-title");
view.restore("?topic=block&q=RING");
assert.deepEqual(view.visible(), []);
view.type("");
assert.deepEqual(view.visible(), ["block", "block"]);
assert.equal(view.link(), "/daily/?topic=block#daily-challenge-title");
view.restore("?topic=word", "pageshow");
assert.equal(view.controls["[data-filter-search]"].value, "");
assert.deepEqual(view.visible(), ["word"]);
for (const search of ["?q=ring&q=block", "?q=" + "a".repeat(81), "?q=+++"]) {
  assert.equal(setup(search).link(), "/daily/#daily-challenge-title");
}
view = setup("?q=" + encodeURIComponent("<script> & plan"));
assert.equal(view.link(), "/daily/?q=%3Cscript%3E+%26+plan#daily-challenge-title");

view = setup("?sort=updated&view=all");
assert.equal(view.controls["[data-filter-sort-wrap]"].hidden, false);
assert.deepEqual(view.visibleIDs(), [5, 2, 3, 1, 4, 0], "updated, then original order on ties");
assert.equal(view.pushes.length, 0);
view.sort("suggested");
assert.deepEqual(view.visibleIDs(), [0, 1, 2, 3, 4, 5]);
assert.equal(view.link(), "/daily/?view=all#daily-challenge-title");
view.click("ring");
view.sort("updated");
view.type("Practice");
assert.equal(view.link(), "/daily/?topic=ring&q=Practice&sort=updated#daily-challenge-title");
assert.deepEqual(view.visibleIDs(), [2, 0]);
view.restore("?topic=ring");
assert.equal(view.controls["[data-filter-sort]"].value, "suggested");
assert.deepEqual(view.visibleIDs(), [0, 2]);
view.restore("?sort=updated", "pageshow");
assert.equal(view.controls["[data-filter-sort]"].value, "updated");
assert.deepEqual(view.visibleIDs(), [5, 2], "sort applies before the visible limit");
for (const search of ["?sort=other", "?sort=updated&sort=updated"]) {
  assert.deepEqual(setup(search).visibleIDs(), [0, 1]);
}

view = setup("?level=easy&sort=updated&view=all");
assert.equal(view.controls["[data-filter-level-wrap]"].hidden, false);
assert.deepEqual(view.visibleIDs(), [3, 4, 0], "difficulty and ordering before the limit");
view.level("normal");
assert.deepEqual(view.visibleIDs(), [2, 1]);
assert.equal(view.link(), "/daily/?level=normal&sort=updated#daily-challenge-title");
view.click("ring");
view.type("Practice");
assert.deepEqual(view.visibleIDs(), [2]);
assert.equal(view.link(), "/daily/?topic=ring&level=normal&q=Practice&sort=updated#daily-challenge-title");
view.level("easy");
assert.deepEqual(view.visibleIDs(), [0]);
view.restore("?topic=ring&level=normal&q=Practice&sort=updated");
assert.equal(view.controls["[data-filter-level]"].value, "normal");
assert.deepEqual(view.visibleIDs(), [2]);
view.restore("?topic=word&level=normal", "pageshow");
assert.deepEqual(view.visibleIDs(), []);
assert.equal(view.controls["[data-filter-empty]"].hidden, false);
view.level("all");
assert.deepEqual(view.visibleIDs(), [5], "unclassified challenge remains in All levels");
assert.equal(view.link(), "/daily/?topic=word#daily-challenge-title");
for (const search of ["?level=hard", "?level=easy&level=normal", "?level=EASY", "?level="]) {
  assert.equal(setup(search).link(), "/daily/#daily-challenge-title");
}

view = setup("?topic=ring", { blockHistory: true });
view.click("word");
assert.deepEqual(view.visible(), ["word"]);
assert.equal(view.link(), "/daily/?topic=word#daily-challenge-title");
assert.equal(view.location.search, "?topic=ring");
view.type("Word");
assert.equal(view.location.search, "?topic=ring");
assert.equal(view.link(), "/daily/?topic=word&q=Word#daily-challenge-title");
view.sort("updated");
assert.equal(view.link(), "/daily/?topic=word&q=Word&sort=updated#daily-challenge-title");
assert.equal(view.location.search, "?topic=ring");
view.level("easy");
assert.equal(view.link(), "/daily/?topic=word&level=easy&q=Word&sort=updated#daily-challenge-title");
assert.equal(view.location.search, "?topic=ring");
view = setup("?topic=ring", { noURL: true });
assert.equal(view.active(), "all");
view.click("block");
assert.deepEqual(view.visible(), ["block", "block"]);
assert.equal(view.controls["[data-filter-link-wrap]"].hidden, true);
assert.equal(view.pushes.length, 0);

// The shared script must not change Blog URL/search behavior.
view = setup("?topic=ring&view=all&q=missing&sort=updated&level=easy", { blog: true });
assert.equal(view.active(), "all");
assert.equal(view.visible().length, 2);
view.click("block");
view.controls["[data-filter-search]"].value = "missing";
view.controls["[data-filter-search]"].fire("input");
assert.equal(view.visible().length, 0);
view.controls["[data-filter-search]"].value = " Block ";
view.controls["[data-filter-search]"].fire("input");
assert.deepEqual(view.visible(), ["block", "block"]);
assert.equal(view.pushes.length, 0);
assert.equal(view.replacements.length, 0);
assert.equal(view.location.search, "?topic=ring&view=all&q=missing&sort=updated&level=easy");
assert.equal(Object.keys(view.events).length, 0);
assert.doesNotThrow(() => setup("?topic=ring", { noControls: true }));
assert.doesNotThrow(() => setup("?topic=ring", { noItems: true }));
console.log("Discovery passed: topic, difficulty, keyword, sort, links, history, malformed queries and unchanged Blog search.");
