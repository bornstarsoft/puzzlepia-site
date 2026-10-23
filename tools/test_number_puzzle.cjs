"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const layouts = require("../data/number_order.json");
const model = require("../static/js/puzzlepia-order-layouts.js");
const source = name => fs.readFileSync(path.join(__dirname, "../static/js/" + name), "utf8");

assert.equal(model.valid(layouts), true);
const original = JSON.stringify(layouts);
assert.deepEqual(layouts[0], [7, 1, 12, 4, 10, 3, 15, 8, 2, 14, 5, 11, 16, 6, 13, 9]);
for (const invalid of [null, [], layouts.slice(1), Array(7).fill(layouts[0]),
  [Array(16).fill(1), ...layouts.slice(1)], [[0, ...layouts[0].slice(1)], ...layouts.slice(1)],
  [[17, ...layouts[0].slice(1)], ...layouts.slice(1)], [["7", ...layouts[0].slice(1)], ...layouts.slice(1)],
  [[7.5, ...layouts[0].slice(1)], ...layouts.slice(1)], [layouts[0].slice(1), ...layouts.slice(1)]]) {
  assert.equal(model.valid(invalid), false);
}
assert.equal(model.today(new Date("invalid")), 0);
assert.equal(model.today(new Date("2026-10-21T23:59:59Z")), 0);
assert.equal(model.today(new Date("2026-10-22T23:59:59Z")), 0);
assert.equal(model.today(new Date("2026-10-23T00:00:00Z")), 1);
assert.equal(model.today(new Date("2026-10-23T09:00:00+09:00")), 1);
for (let day = 0; day < 400; day += 1) {
  assert.equal(model.today(new Date(Date.UTC(2026, 9, 22 + day))), day % 7);
}

class Element {
  constructor() {
    this.children = []; this.nodes = {}; this.dataset = {}; this.listeners = {};
    this.attributes = {}; this.hidden = true; this.disabled = false; this.textContent = "";
    const classes = new Set();
    this.classList = { add: n => classes.add(n), remove: (...ns) => ns.forEach(n => classes.delete(n)), contains: n => classes.has(n) };
  }
  querySelector(s) { return this.nodes[s] || null; }
  querySelectorAll() { return this.children; }
  appendChild(e) { this.children.push(e); }
  setAttribute(k, v) { this.attributes[k] = v; }
  addEventListener(k, fn) { this.listeners[k] = fn; }
  click() { if (!this.disabled && this.listeners.click) this.listeners.click({}); }
  focus() { this.focused = true; }
}

function fixture() {
  const root = new Element();
  for (const key of ["grid", "reset", "status", "complete", "complete-actions", "order-select", "order-today", "order-next", "order-controls", "order-note", "order-layouts", "layout-link", "layout-link-row", "unavailable"]) {
    root.nodes["[data-" + key + "]"] = new Element();
  }
  root.querySelector("[data-order-layouts]").textContent = JSON.stringify(layouts);
  root.querySelector("[data-reset]").disabled = true;
  return root;
}

function init(root, search = "", suppliedModel = model, globals = {}) {
  const events = {}, timers = [];
  const window = { PuzzlepiaOrderLayouts: suppliedModel, location: { search }, setTimeout: f => timers.push(f), addEventListener: (n, f) => { events[n] = f; } };
  Object.defineProperty(window, "localStorage", { get() { throw Error("Storage must not be used"); } });
  const document = { querySelector: () => root, createElement: () => new Element() };
  const context = vm.createContext({ window, document, URLSearchParams, ...globals });
  vm.runInContext(source("puzzlepia-games.js"), context);
  vm.runInContext(source("daily-number-puzzle.js"), context);
  return { events, timers };
}

const el = (root, name) => root.querySelector("[data-" + name + "]");
const cells = root => el(root, "grid").children;
const values = root => cells(root).map(b => Number(b.dataset.number));
const tap = (root, n) => cells(root).find(b => Number(b.dataset.number) === n).click();
function initial(root, index) {
  assert.deepEqual(values(root), layouts[index]);
  assert.equal(el(root, "complete").hidden, true);
  assert.equal(el(root, "complete-actions").hidden, true);
  assert.match(el(root, "status").textContent, /1/);
  for (const b of cells(root)) {
    assert.equal(b.disabled, false);
    assert.equal(b.classList.contains("is-done"), false);
    assert.equal(b.classList.contains("is-wrong"), false);
    assert.equal(b.attributes["aria-label"], "Number " + b.dataset.number);
  }
}

let completions = 0;
for (let index = 0; index < 7; index += 1) {
  const root = fixture(), run = init(root, "?layout=" + (index + 1));
  initial(root, index);
  assert.equal(el(root, "layout-link").href, "/daily/number-puzzle/?layout=" + (index + 1));
  assert.equal(el(root, "order-controls").hidden, false);
  el(root, "order-next").click(); initial(root, index);
  tap(root, 2); assert.match(el(root, "status").textContent, /Look for 1/);
  el(root, "reset").click(); initial(root, index);
  tap(root, 1); el(root, "reset").click(); initial(root, index);
  run.timers.forEach(f => f()); initial(root, index);
  for (let replay = 0; replay < 2; replay += 1) {
    for (let n = 1; n <= 16; n += 1) {
      tap(root, n);
      assert.equal(cells(root).filter(b => b.disabled).length, n);
      if (n < 16) assert.match(el(root, "status").textContent, new RegExp("Next number: " + (n + 1) + "\\."));
    }
    assert.equal(el(root, "complete").hidden, false);
    assert.equal(el(root, "complete-actions").hidden, false);
    tap(root, 16); assert.match(el(root, "status").textContent, /Puzzle complete/);
    completions += 1;
    if (!replay) { el(root, "reset").click(); initial(root, index); }
  }
  el(root, "order-next").click(); initial(root, (index + 1) % 7);
  el(root, "reset").click(); initial(root, (index + 1) % 7);
}

const recovery = fixture(), recoveryRun = init(recovery, "?layout=4");
for (let replay = 0; replay < 2; replay += 1) {
  initial(recovery, 3);
  for (let n = 1; n <= 5; n += 1) tap(recovery, n);
  tap(recovery, 7);
  assert.equal(el(recovery, "status").textContent, "Look for 6 first.");
  assert.deepEqual(cells(recovery).filter(b => b.disabled).map(b => Number(b.dataset.number)).sort((a, b) => a - b), [1, 2, 3, 4, 5]);
  assert.equal(cells(recovery).find(b => Number(b.dataset.number) === 7).disabled, false);
  for (let n = 6; n <= 16; n += 1) tap(recovery, n);
  assert.equal(el(recovery, "complete").hidden, false);
  el(recovery, "reset").click();
  recoveryRun.timers.forEach(f => f());
  initial(recovery, 3);
}

let today = 2;
const root = fixture(), run = init(root, "", { valid: model.valid, today: () => today });
initial(root, 2); tap(root, 1); today = 3;
el(root, "reset").click(); initial(root, 2);
el(root, "order-today").click(); initial(root, 3);
el(root, "order-select").value = "5"; el(root, "order-select").listeners.change(); initial(root, 5);
tap(root, 1); el(root, "order-select").value = "0"; run.events.pageshow();
assert.equal(el(root, "order-select").value, "5");
assert.equal(cells(root).filter(b => b.disabled).length, 1);
for (const bad of ["?layout=", "?layout=0", "?layout=8", "?layout=-1", "?layout=1.5", "?layout=01", "?layout=1&layout=2", "?layout=2&layout=2", "?layout=%FF"]) {
  const r = fixture(); init(r, bad, { valid: model.valid, today: () => 4 }); initial(r, 4);
}
const noURL = fixture(); init(noURL, "?layout=7", { valid: model.valid, today: () => 2 }, { URLSearchParams: undefined }); initial(noURL, 2);
for (const missing of ["order-select", "order-next", "order-controls", "order-note", "order-layouts"]) {
  const r = fixture(); delete r.nodes["[data-" + missing + "]"]; init(r, "?layout=7"); initial(r, 0);
}
for (const bad of ["{", "null", "[]"]) {
  const r = fixture(); el(r, "order-layouts").textContent = bad; init(r); initial(r, 0);
}
const fallback = fixture(); init(fallback, "?layout=7", null); initial(fallback, 0);
for (let n = 1; n <= 16; n += 1) tap(fallback, n);
assert.equal(el(fallback, "complete").hidden, false);
el(fallback, "reset").click(); initial(fallback, 0);
for (const missing of ["layout-link", "layout-link-row"]) {
  const r = fixture(); delete r.nodes["[data-" + missing + "]"]; init(r, "?layout=7"); initial(r, 6);
}
for (const missing of ["grid", "reset", "status", "complete"]) {
  const r = fixture(); delete r.nodes["[data-" + missing + "]"]; init(r);
}
init(null);
assert.equal(JSON.stringify(layouts), original);
console.log("Number Puzzle passed: seven permutations, 400 UTC days, " + completions + " completions plus fallback, two Layout 4 wrong-tap recovery/replays, partial/completed reset, next wrap, fixed links, history, invalid/missing inputs and no storage.");
