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
  const items = options.noItems ? [] : ["ring", "block", "ring", "number", "block", "word"].map(topic =>
    element({ "data-topic": topic, "data-search-text": topic + " practice" }));
  const controls = Object.fromEntries(["search", "search-wrap", "count", "empty", "more", "link", "link-wrap"].map(key =>
    ["[data-filter-" + key + "]", element()]));
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
    visible: () => items.filter(item => !item.hidden).map(item => item.getAttribute("data-topic")),
    active: () => buttons.find(button => button.getAttribute("aria-pressed") === "true")?.getAttribute("data-filter-value"),
    click(topic) { buttons.find(button => button.getAttribute("data-filter-value") === topic).fire("click"); },
    more() { controls["[data-filter-more]"].fire("click"); },
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

view = setup("?topic=ring", { blockHistory: true });
view.click("word");
assert.deepEqual(view.visible(), ["word"]);
assert.equal(view.link(), "/daily/?topic=word#daily-challenge-title");
assert.equal(view.location.search, "?topic=ring");
view.type("Word");
assert.equal(view.location.search, "?topic=ring");
assert.equal(view.link(), "/daily/?topic=word&q=Word#daily-challenge-title");
view = setup("?topic=ring", { noURL: true });
assert.equal(view.active(), "all");
view.click("block");
assert.deepEqual(view.visible(), ["block", "block"]);
assert.equal(view.controls["[data-filter-link-wrap]"].hidden, true);
assert.equal(view.pushes.length, 0);

// The shared script must not change Blog URL/search behavior.
view = setup("?topic=ring&view=all&q=missing", { blog: true });
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
assert.equal(view.location.search, "?topic=ring&view=all&q=missing");
assert.equal(Object.keys(view.events).length, 0);
assert.doesNotThrow(() => setup("?topic=ring", { noControls: true }));
assert.doesNotThrow(() => setup("?topic=ring", { noItems: true }));
console.log("Discovery passed: topic/keyword intersection, share links, replace/push/restore, malformed queries, blocked history and unchanged Blog search.");
