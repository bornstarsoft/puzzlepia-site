"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = name => fs.readFileSync(path.join(__dirname, "../static/js/" + name), "utf8");
const targets = ["pink", "mint", "gold", "purple"];
const totals = { pink: 6, mint: 6, gold: 6, purple: 7 };
const board = ["pink", "pink", "mint", "gold", "gold", "purple", "pink", "mint", "mint", "gold", "purple", "purple", "gold", "mint", "mint", "pink", "gold", "gold", "purple", "purple", "pink", "pink", "mint", "purple", "purple"];
const label = s => s[0].toUpperCase() + s.slice(1);

// Keep the static reading exercises aligned with the actual initialized game.
const practiceBoard = require("../data/color_practice.json");
assert.equal(practiceBoard.length, 5);
practiceBoard.forEach(row => assert.equal(row.length, 5));
assert.deepEqual(practiceBoard.flat(), board);

class Element {
  constructor() {
    this.children = []; this.nodes = {}; this.dataset = {}; this.listeners = {};
    this.attributes = {}; this.hidden = true; this.disabled = false; this.textContent = "";
    const classes = new Set();
    this.classList = {
      add: n => classes.add(n), remove: (...ns) => ns.forEach(n => classes.delete(n)),
      contains: n => classes.has(n), toggle: (n, yes) => yes ? classes.add(n) : classes.delete(n)
    };
  }
  querySelector(s) {
    if (s === ".color-cell") return this.children[0];
    const position = s.match(/^\[data-row="(\d+)"\]\[data-col="(\d+)"\]$/);
    if (position) return this.children.find(c => c.dataset.row === Number(position[1]) && c.dataset.col === Number(position[2]));
    return this.nodes[s] || null;
  }
  querySelectorAll() { return this.children; }
  appendChild(e) { this.children.push(e); }
  setAttribute(k, v) { this.attributes[k] = v; }
  addEventListener(k, fn) { this.listeners[k] = fn; }
  click() { if (!this.disabled && this.listeners.click) this.listeners.click({ currentTarget: this }); }
  focus() { this.focused = true; }
}
const el = (root, key) => root.querySelector("[data-" + key + "]");
const cells = root => el(root, "grid").children;
function fixture() {
  const root = new Element();
  for (const key of ["grid", "reset", "status", "complete", "complete-actions", "color-select", "color-controls", "color-title", "color-instructions", "color-target", "color-swatch", "color-next", "target-link", "target-link-row", "unavailable"]) {
    root.nodes["[data-" + key + "]"] = new Element();
  }
  el(root, "reset").disabled = true;
  return root;
}
function init(root, search = "", overrides = {}) {
  const events = {}, timers = [];
  const window = { location: { search }, setTimeout: f => timers.push(f), addEventListener: (n, f) => { events[n] = f; } };
  Object.defineProperty(window, "localStorage", { get() { throw Error("Storage must not be used"); } });
  const document = { querySelector: () => root, createElement: () => new Element() };
  const context = vm.createContext({ window, document, URLSearchParams, ...overrides });
  vm.runInContext(source("puzzlepia-games.js"), context);
  vm.runInContext(source("daily-color-match.js"), context);
  return { events, timers };
}
function initial(root, target, controls = true) {
  assert.deepEqual(cells(root).map(c => c.dataset.color), board);
  assert.equal(el(root, "complete").hidden, true);
  if (el(root, "complete-actions")) assert.equal(el(root, "complete-actions").hidden, true);
  assert.match(el(root, "status").textContent, new RegExp(label(target)));
  cells(root).forEach((c, i) => {
    assert.equal(c.disabled, false); assert.equal(c.textContent, label(board[i]));
    assert.equal(c.classList.contains("is-invalid"), false);
    assert.match(c.attributes["aria-label"], new RegExp(label(board[i]) + " tile, row "));
  });
  if (controls) {
    assert.equal(el(root, "color-select").value, target);
    assert.equal(el(root, "color-controls").hidden, false);
    assert.equal(el(root, "color-target").textContent, "Target: " + label(target) + " (" + totals[target] + " tiles)");
    if (el(root, "target-link")) assert.equal(el(root, "target-link").href, "/daily/color-match/?target=" + target);
  }
}
let completions = 0;
for (const target of targets) {
  const root = fixture(), run = init(root, "?target=" + target);
  initial(root, target); el(root, "color-next").click(); initial(root, target);
  const matching = cells(root).filter(c => c.dataset.color === target);
  const wrong = cells(root).find(c => c.dataset.color !== target);
  wrong.click(); assert.match(el(root, "status").textContent, new RegExp(target));
  assert.equal(wrong.classList.contains("is-invalid"), true);
  el(root, "reset").click(); initial(root, target);
  matching[0].click(); matching[0].click(); assert.equal(cells(root).filter(c => c.disabled).length, 1);
  el(root, "reset").click(); run.timers.forEach(f => f()); initial(root, target);
  for (const order of [matching, matching.slice().reverse()]) {
    order.forEach((c, i) => {
      c.click(); assert.equal(cells(root).filter(b => b.disabled).length, i + 1);
      assert.equal(c.textContent, "Done");
    });
    assert.equal(el(root, "complete").hidden, false);
    assert.equal(el(root, "complete-actions").hidden, false);
    wrong.click(); assert.equal(el(root, "status").textContent, "Puzzle complete! Great job.");
    completions++; el(root, "reset").click(); initial(root, target);
  }
  matching.forEach(c => c.click()); el(root, "color-next").click();
  initial(root, targets[(targets.indexOf(target) + 1) % 4]);
  el(root, "color-select").value = target; el(root, "color-select").listeners.change(); initial(root, target);
  el(root, "color-select").value = "invalid"; el(root, "color-select").listeners.change(); initial(root, target);
  matching[0].click(); el(root, "color-select").value = "invalid"; run.events.pageshow();
  assert.equal(el(root, "color-select").value, target);
  assert.equal(cells(root).filter(c => c.disabled).length, 1);
}
for (const query of ["", "?target=", "?target=red", "?target=Pink", "?target=__proto__", "?target=pink&target=mint", "?target=mint&target=mint", "?target=%FF"]) {
  const r = fixture(); init(r, query); initial(r, "pink");
}
const noURL = fixture(); init(noURL, "?target=mint", { URLSearchParams: undefined }); initial(noURL, "pink");
for (const key of ["color-select", "color-controls", "color-title", "color-instructions", "color-target", "color-swatch"]) {
  const r = fixture(); delete r.nodes["[data-" + key + "]"]; init(r, "?target=mint"); initial(r, "pink", false);
  cells(r).filter(c => c.dataset.color === "pink").forEach(c => c.click());
  assert.equal(el(r, "complete").hidden, false); el(r, "reset").click(); initial(r, "pink", false);
}
for (const key of ["color-next", "complete-actions", "target-link", "target-link-row", "unavailable"]) {
  const r = fixture(); delete r.nodes["[data-" + key + "]"]; init(r, "?target=mint");
  assert.equal(cells(r).length, 25);
}
for (const key of ["grid", "reset", "status", "complete"]) {
  const r = fixture(); delete r.nodes["[data-" + key + "]"]; init(r);
}
init(null);
console.log("Color Match passed: four targets, " + completions + " forward/reverse completions, next wrap, labels/counts, wrong/duplicate taps, reset/history, invalid links, missing markup/URL API and no storage.");
