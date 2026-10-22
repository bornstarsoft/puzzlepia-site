"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(require.resolve("../static/js/puzzlepia-search.js"), "utf8");

class Element {
  constructor(attrs = {}) {
    this.attrs = attrs; this.children = []; this.events = {};
    this.value = ""; this.textContent = ""; this.hidden = true;
  }
  getAttribute(key) { return this.attrs[key] ?? null; }
  setAttribute(key, value) { this.attrs[key] = value; }
  addEventListener(key, fn) { this.events[key] = fn; }
  fire(key, event = {}) { this.events[key]?.(event); }
  appendChild(child) {
    if (child.fragment) this.children.push(...child.children);
    else this.children.push(child);
  }
  replaceChildren() { this.children = []; }
  querySelector(selector) {
    if (selector === "h2 a") return this.children[1].children[0];
    return null;
  }
  focus() { this.focused = true; }
}

const categories = ["all", "playable", "games", "guides", "challenges"];
const entries = Array.from({ length: 100 }, (_, i) => ({
  title: "Block practice " + String(i).padStart(3, "0"),
  description: "A fixed block puzzle exercise.", keywords: "block puzzle",
  url: "/daily/challenges/block-" + i + "/",
  category: i < 70 ? "challenges" : i < 84 ? "guides" : i < 92 ? "games" : "playable",
  typeLabel: "Exercise", topic: "block", actionLabel: "Read exercise"
}));

function setup(search = "", options = {}) {
  const keys = ["form", "input", "clear", "status", "results", "empty", "all", "more", "more-wrap", "link", "link-wrap"];
  const nodes = Object.fromEntries(keys.map(k => ["[data-search-" + k + "]", new Element()]));
  if (options.missing) delete nodes["[data-search-" + options.missing + "]"];
  const buttons = categories.map(c => new Element({ "data-search-category": c }));
  const start = new Element(), index = new Element();
  index.textContent = options.index ?? JSON.stringify(entries);
  const root = { querySelector: s => nodes[s], querySelectorAll: () => buttons };
  const events = {}, updates = [], location = { pathname: "/search/", search };
  const history = { state: { retained: true }, replaceState(state, title, url) {
    assert.deepEqual(state, { retained: true });
    if (options.blockHistory) throw Error("Restricted history");
    updates.push(url); location.search = new URL(url, "https://puzzlepia.com").search;
  } };
  const window = { location, history: options.noHistory ? undefined : history,
    URLSearchParams: options.noURL ? undefined : URLSearchParams,
    addEventListener: (n, fn) => { events[n] = fn; } };
  Object.defineProperty(window, "localStorage", { get() { throw Error("No storage allowed"); } });
  const document = {
    querySelector: s => s === "[data-site-search]" ? (options.noRoot ? null : root) : s === "#puzzlepia-search-index" ? index : start,
    createElement: () => new Element(),
    createDocumentFragment: () => Object.assign(new Element(), { fragment: true })
  };
  vm.runInNewContext(source, { document, window });
  return {
    nodes, buttons, start, events, location, updates,
    get: key => nodes["[data-search-" + key + "]"],
    count: () => nodes["[data-search-results]"].children.length,
    click(key) { nodes["[data-search-" + key + "]"].fire("click"); },
    category(key) { buttons[categories.indexOf(key)].fire("click"); },
    input(query) { nodes["[data-search-input]"].value = query; nodes["[data-search-input]"].fire("input"); },
    restore(query, event = "pageshow") { location.search = query; events[event]?.(); }
  };
}

let view = setup();
assert.equal(view.count(), 0); assert.equal(view.start.hidden, false);
assert.equal(view.get("form").hidden, false);
assert.equal(view.get("link-wrap").hidden, true);
view.category("challenges"); assert.equal(view.count(), 24);
view.click("more"); assert.equal(view.count(), 48);
assert.equal(view.location.search, "?type=challenges&batch=2");
assert.equal(view.get("link").href, "/search/?type=challenges&batch=2");
assert.equal(view.get("results").children[24].querySelector("h2 a").focused, true);
view.restore(view.location.search); assert.equal(view.count(), 48);
view.click("more"); assert.equal(view.count(), 70);
assert.equal(view.get("more-wrap").hidden, true);
view.restore(view.location.search, "popstate"); assert.equal(view.count(), 70);
assert.equal(setup(view.location.search).count(), 70);
view.category("guides"); assert.equal(view.count(), 14);
assert.equal(view.location.search, "?type=guides");
view.input("missing"); assert.equal(view.count(), 0);
assert.equal(view.get("empty").hidden, false); assert.equal(view.get("link-wrap").hidden, true);
view.click("all"); assert.equal(view.count(), 0); assert.equal(view.get("input").value, "missing");
view.input("block"); assert.equal(view.count(), 24);
assert.equal(view.get("results").children[0].querySelector("h2 a").href, "/daily/challenges/block-92/");
view.click("more"); assert.equal(view.count(), 48);
view.input("block puzzle"); assert.equal(view.count(), 24);
view.click("clear"); assert.equal(view.count(), 0); assert.equal(view.location.search, "");
assert.equal(view.get("input").focused, true);
view.input("b"); assert.match(view.get("status").textContent, /one more/);
view.input("---"); assert.equal(view.count(), 0);
let prevented = false;
view.get("input").value = "block";
view.get("form").fire("submit", { preventDefault() { prevented = true; } });
assert.equal(prevented, true); assert.equal(view.count(), 24);

for (const batch of ["", "0", "-2", "1.5", "Infinity", "all", "9999999", "2&batch=3"]) {
  assert.equal(setup("?type=challenges&batch=" + batch).count(), 24, batch);
}
assert.equal(setup("?type=challenges&batch=999999").count(), 70);
assert.equal(setup("?q=missing&batch=5").get("link-wrap").hidden, true);
assert.equal(setup("?q=block&q=word").count(), 0);
assert.equal(setup("?type=challenges&type=guides").count(), 0);
assert.equal(setup("?type=unknown").count(), 0);
assert.equal(setup("?q=" + "x".repeat(200)).get("input").value.length, 100);
for (const q of ["%3Cscript%3E", "%FF", "https%3A%2F%2Fevil.test"]) {
  assert.equal(setup("?q=" + q).count(), 0);
}
for (const options of [{ blockHistory: true }, { noHistory: true }]) {
  view = setup("", options); view.category("challenges"); view.click("more");
  assert.equal(view.count(), 48);
  assert.equal(view.get("link").href, "/search/?type=challenges&batch=2");
}
view = setup("?q=block", { noURL: true });
assert.equal(view.count(), 0); view.input("block"); view.click("more");
assert.equal(view.count(), 48); assert.equal(view.get("link-wrap").hidden, true);
assert.equal(Object.keys(view.events).length, 0);
for (const missing of ["link", "link-wrap"]) {
  view = setup("?type=challenges", { missing }); view.click("more"); assert.equal(view.count(), 48);
}
for (const missing of ["form", "input", "clear", "status", "results", "empty", "all", "more", "more-wrap"]) {
  assert.doesNotThrow(() => setup("", { missing }));
}
for (const index of ["{", "{}", '[{"title":"Unsafe","url":"https://evil.test/"}]']) {
  view = setup("", { index }); assert.match(view.get("status").textContent, /unavailable/);
  assert.equal(view.get("form").hidden, true);
}
assert.doesNotThrow(() => setup("", { noRoot: true }));
console.log("Search passed: expanded URL/reload/history, bounds/duplicates, category/query reset, ranking, keyboard-submit/focus, malformed index, missing controls, no storage and restricted history/URL fallbacks.");
