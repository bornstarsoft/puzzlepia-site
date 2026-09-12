"use strict";

// Dependency-free state tests; browser QA still checks native focus, touch, and layout.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../static/js/puzzlepia-pairs.js"), "utf8");

class Element {
  constructor() {
    this.dataset = {};
    this.children = {};
    this.attributes = {};
    this.listeners = {};
    this.hidden = false;
    this.disabled = false;
    this.textContent = "";
    const classes = new Set();
    this.classList = {
      add: (name) => classes.add(name),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
      toggle: (name, on) => on ? classes.add(name) : classes.delete(name)
    };
  }
  querySelector(selector) { return this.children[selector] || null; }
  querySelectorAll() { return this.tiles || []; }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  click() { if (!this.disabled && this.listeners.click) this.listeners.click(); }
  focus() { this.focused = true; }
}

function fixture(mode, values) {
  const root = new Element();
  root.dataset.pairGame = mode;
  ["progress", "status", "complete", "complete-actions", "reset", "clear", "controls", "unavailable"]
    .forEach((key) => { root.children["[data-" + key + "]"] = new Element(); });
  root.tiles = values.map((value) => {
    const tile = new Element();
    tile.dataset = { value: String(value), label: String(value) };
    tile.children[".pair-face"] = new Element();
    if (mode === "memory") {
      tile.children["[data-symbol]"] = new Element();
      tile.children["[data-symbol]"].textContent = String(value);
    }
    return tile;
  });
  return root;
}

function init(roots) {
  vm.runInNewContext(source, { document: { querySelectorAll: () => roots } });
}

function checkInitial(root) {
  assert.equal(root.querySelector("[data-progress]").textContent, "0 / " + root.tiles.length / 2 + " pairs found");
  assert.equal(root.querySelector("[data-complete]").hidden, true);
  assert.equal(root.querySelector("[data-complete-actions]").hidden, true);
  assert.equal(root.querySelector("[data-clear]").disabled, true);
  root.tiles.forEach((tile) => {
    assert.equal(tile.disabled, false);
    ["is-selected", "is-matched", "is-mismatch"].forEach((name) => assert.equal(tile.classList.contains(name), false));
    assert.equal(tile.attributes["aria-pressed"], "false");
    if (root.dataset.pairGame === "memory") assert.equal(tile.querySelector(".pair-face").textContent, "?");
  });
}

const memory = fixture("memory", ["star", "moon", "sun", "diamond", "circle", "triangle", "moon", "circle", "star", "triangle", "diamond", "sun"]);
const sum = fixture("sum", [1, 6, 3, 8, 5, 2, 9, 4, 7, 1, 5, 8, 2, 6, 9, 4]);
init([memory, sum]);

for (const root of [memory, sum]) {
  checkInitial(root);
  const reset = root.querySelector("[data-reset]");
  const clear = root.querySelector("[data-clear]");
  const status = root.querySelector("[data-status]");
  const values = root.tiles.map((tile) => tile.dataset.value);
  const matches = (a, b) => root.dataset.pairGame === "memory" ? a === b : Number(a) + Number(b) === 10;
  const tap = (index) => root.tiles[index].click();

  tap(0);
  tap(0);
  assert.equal(root.tiles.filter((tile) => tile.classList.contains("is-selected")).length, 1);
  assert.match(status.textContent, /different tile/);
  clear.click();
  checkInitial(root);
  assert.equal(root.tiles[0].focused, true);

  tap(0);
  tap(1);
  assert.equal(status.classList.contains("is-warn"), true);
  assert.equal(root.tiles.filter((tile) => tile.classList.contains("is-mismatch")).length, 2);
  tap(2);
  assert.equal(root.tiles.filter((tile) => tile.classList.contains("is-selected")).length, 1);
  reset.click();
  checkInitial(root);
  assert.match(status.textContent, /reset/i);
  tap(0);
  tap(1);
  reset.click();
  checkInitial(root);

  // Check different removal orders and interchangeable duplicate number partners.
  for (let pass = 0; pass < values.length; pass += 1) {
    const available = values.map((_, index) => (index + pass) % values.length);
    while (available.length) {
      const first = available.shift();
      const partnerIndex = available.findIndex((index) => matches(values[first], values[index]));
      assert.notEqual(partnerIndex, -1, "remaining board always has a partner");
      const second = available.splice(partnerIndex, 1)[0];
      tap(first);
      tap(second);
      assert.equal(root.tiles[first].disabled, true);
      assert.equal(root.tiles[second].disabled, true);
      if (available.length === values.length - 2 && pass === 0) {
        reset.click();
        checkInitial(root);
        tap(first);
        tap(second);
      }
    }
    assert.equal(root.querySelector("[data-complete]").hidden, false);
    assert.equal(root.querySelector("[data-complete-actions]").hidden, false);
    assert.equal(root.tiles.filter((tile) => tile.classList.contains("is-matched")).length, values.length);
    assert.match(status.textContent, /All pairs found/);
    tap(0);
    assert.match(status.textContent, /All pairs found/);
    reset.click();
    checkInitial(root);
  }
}

// Missing or unsupported markup must leave the explanatory fallback intact.
init([]);
const missing = fixture("sum", [1, 9]);
delete missing.children["[data-reset]"];
init([missing, fixture("unknown", [1, 9]), fixture("sum", ["bad", 9])]);
assert.equal(missing.querySelector("[data-unavailable]").hidden, false);
assert.equal(missing.tiles[0].listeners.click, undefined);
console.log("Pair puzzle tests passed: selection, mismatch, duplicate taps, reset, 28 completions, independent games, and missing markup.");
