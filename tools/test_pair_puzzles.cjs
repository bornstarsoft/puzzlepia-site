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
  ["progress", "status", "complete", "complete-actions", "reset", "clear", "controls", "unavailable", "layout-link", "layout-link-row"]
    .forEach((key) => { root.children["[data-" + key + "]"] = new Element(); });
  root.querySelector("[data-layout-link-row]").hidden = true;
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

function init(roots, window = {}, globals = {}) {
  vm.runInNewContext(source, { document: { querySelectorAll: () => roots }, window, URLSearchParams, ...globals });
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

const layouts = require("../data/memory_pairs.json");
const model = require("../static/js/puzzlepia-memory-layouts.js");
assert.equal(model.valid(layouts), true);
for (const bad of [null, [], layouts.slice(1), Array(7).fill(layouts[0]),
  [...layouts.slice(0, 6), Array(12).fill("star")],
  [...layouts.slice(0, 6), [...layouts[6].slice(0, 11), "unknown"]]]) {
  assert.equal(model.valid(bad), false);
}
assert.equal(model.today(new Date("invalid")), 0);
assert.equal(model.today(new Date("2026-10-14T23:59:59Z")), 0);
assert.equal(model.today(new Date("2026-10-15T23:59:59Z")), 0);
assert.equal(model.today(new Date("2026-10-16T00:00:00Z")), 1);
assert.equal(model.today(new Date("2026-10-22T00:00:00Z")), 0);
assert.equal(model.today(new Date("2026-10-16T09:00:00+09:00")), 1);

function rotatingFixture(data = layouts) {
  const root = fixture("memory", layouts[0]);
  ["select", "today", "next", "controls", "note", "layouts"].forEach((name) => {
    root.children["[data-memory-" + name + "]"] = new Element();
  });
  root.querySelector("[data-memory-controls]").hidden = true;
  root.querySelector("[data-memory-next]").hidden = true;
  root.querySelector("[data-memory-layouts]").textContent = JSON.stringify(data);
  return root;
}
const rotated = rotatingFixture();
let dayIndex = 2;
init([rotated], { PuzzlepiaMemoryLayouts: { valid: model.valid, today: () => dayIndex } });
const picker = rotated.querySelector("[data-memory-select]");
const next = rotated.querySelector("[data-memory-next]");
const resetRotated = rotated.querySelector("[data-reset]");
const valuesOf = (root) => root.tiles.map((tile) => tile.dataset.value);
const selectLayout = (index) => { picker.value = String(index); picker.listeners.change(); };
assert.deepEqual(valuesOf(rotated), layouts[2]);
next.click();
assert.equal(picker.value, "2", "cannot skip an unfinished board through completion action");
rotated.tiles[0].click();
dayIndex = 3;
resetRotated.click();
assert.deepEqual(valuesOf(rotated), layouts[2], "reset keeps current board across UTC rollover");
rotated.querySelector("[data-memory-today]").click();
assert.deepEqual(valuesOf(rotated), layouts[3]);
assert.equal(rotated.tiles[0].focused, true);

for (let index = 0; index < 7; index += 1) {
  selectLayout(index);
  checkInitial(rotated);
  for (let replay = 0; replay < 2; replay += 1) {
    for (const symbol of new Set(layouts[index])) {
      const positions = layouts[index].flatMap((value, i) => value === symbol ? [i] : []);
      positions.forEach((i) => rotated.tiles[i].click());
    }
    assert.equal(rotated.querySelector("[data-complete]").hidden, false);
    assert.equal(rotated.querySelector("[data-complete-actions]").hidden, false);
    assert.equal(rotated.querySelector("[data-progress]").textContent, "6 / 6 pairs found");
    if (!replay) { resetRotated.click(); checkInitial(rotated); }
  }
  next.click();
  assert.equal(picker.value, String((index + 1) % 7));
  checkInitial(rotated);
}
selectLayout(0);
rotated.tiles[0].click();
selectLayout(1);
checkInitial(rotated);
for (const bad of [-1, 7, 0.5, "invalid"]) {
  selectLayout(bad);
  assert.deepEqual(valuesOf(rotated), layouts[1]);
}
const missingModel = rotatingFixture();
const badData = rotatingFixture([]);
const brokenJSON = rotatingFixture();
brokenJSON.querySelector("[data-memory-layouts]").textContent = "{";
init([missingModel]);
init([badData, brokenJSON], { PuzzlepiaMemoryLayouts: model });
for (const root of [missingModel, badData, brokenJSON]) {
  checkInitial(root);
  assert.equal(root.querySelector("[data-memory-controls]").hidden, true);
  assert.equal(root.querySelector("[data-memory-next]").hidden, true);
  assert.match(root.querySelector("[data-memory-note]").textContent, /Starter layout/);
  root.tiles[0].click();
  root.tiles[8].click();
  assert.equal(root.querySelector("[data-progress]").textContent, "1 / 6 pairs found");
}
console.log("Memory rotation tests passed: seven valid unique layouts, UTC boundaries, 14 completions, reset/replay, next wrap, and optional-data fallback.");

const numberLayouts = require("../data/number_pairs.json");
const numberModel = require("../static/js/puzzlepia-number-layouts.js");
assert.equal(numberModel.valid(numberLayouts), true);
const changed = (value) => {
  const data = numberLayouts.map(row => row.slice());
  data[6][0] = value;
  return data;
};
for (const bad of [null, [], numberLayouts.slice(1), Array(7).fill(numberLayouts[0]),
  changed(0), changed(10), changed(1.5), changed("8"), changed(7), changed(5),
  [...numberLayouts.slice(0, 6), numberLayouts[6].slice(1)]]) {
  assert.equal(numberModel.valid(bad), false);
}
assert.equal(numberModel.today(new Date("invalid")), 0);
assert.equal(numberModel.today(new Date("2026-10-21T23:59:59Z")), 0);
assert.equal(numberModel.today(new Date("2026-10-22T23:59:59Z")), 0);
assert.equal(numberModel.today(new Date("2026-10-23T00:00:00Z")), 1);
assert.equal(numberModel.today(new Date("2026-10-29T00:00:00Z")), 0);
assert.equal(numberModel.today(new Date("2026-10-23T09:00:00+09:00")), 1);

// Explore every reachable remainder, not just one solution per board.
let remainders = 0;
for (const cards of numberLayouts) {
  const seen = new Set();
  function visit(mask) {
    if (seen.has(mask)) return;
    seen.add(mask);
    if (!mask) return;
    let moves = 0;
    for (let a = 0; a < 16; a += 1) for (let b = a + 1; b < 16; b += 1) {
      if ((mask & (1 << a)) && (mask & (1 << b)) && cards[a] + cards[b] === 10) {
        moves += 1;
        visit(mask ^ (1 << a) ^ (1 << b));
      }
    }
    assert.ok(moves, "every nonempty reachable board has another pair");
  }
  visit(65535);
  remainders += seen.size;
}

function numberFixture(data = numberLayouts) {
  const root = fixture("sum", numberLayouts[0]);
  ["select", "today", "next", "controls", "note", "layouts"].forEach(name => {
    root.children["[data-number-" + name + "]"] = new Element();
  });
  root.querySelector("[data-number-controls]").hidden = true;
  root.querySelector("[data-number-next]").hidden = true;
  root.querySelector("[data-number-layouts]").textContent = JSON.stringify(data);
  return root;
}
const numbered = numberFixture();
let numberDay = 1;
init([numbered], { PuzzlepiaNumberLayouts: { valid: numberModel.valid, today: () => numberDay } });
const numberPicker = numbered.querySelector("[data-number-select]");
const numberNext = numbered.querySelector("[data-number-next]");
const numberReset = numbered.querySelector("[data-reset]");
const pickNumber = i => { numberPicker.value = String(i); numberPicker.listeners.change(); };
assert.deepEqual(valuesOf(numbered), numberLayouts[1].map(String));
numberNext.click();
assert.equal(numberPicker.value, "1");
numbered.tiles[0].click();
numberDay = 2;
numberReset.click();
assert.deepEqual(valuesOf(numbered), numberLayouts[1].map(String));
numbered.querySelector("[data-number-today]").click();
assert.deepEqual(valuesOf(numbered), numberLayouts[2].map(String));

for (let index = 0; index < 7; index += 1) {
  pickNumber(index);
  checkInitial(numbered);
  for (let replay = 0; replay < 2; replay += 1) {
    const available = Array.from({ length: 16 }, (_, i) => i);
    if (replay) available.reverse();
    while (available.length) {
      const a = available.shift();
      const b = available.splice(available.findIndex(i => numberLayouts[index][a] + numberLayouts[index][i] === 10), 1)[0];
      numbered.tiles[a].click(); numbered.tiles[b].click();
    }
    assert.equal(numbered.querySelector("[data-complete]").hidden, false);
    assert.equal(numbered.querySelector("[data-progress]").textContent, "8 / 8 pairs found");
    if (!replay) { numberReset.click(); checkInitial(numbered); }
  }
  numberNext.click();
  assert.equal(numberPicker.value, String((index + 1) % 7));
  checkInitial(numbered);
}
pickNumber(0); numbered.tiles[0].click(); pickNumber(1); checkInitial(numbered);
for (const bad of [-1, 7, 0.5, "invalid"]) {
  pickNumber(bad); assert.deepEqual(valuesOf(numbered), numberLayouts[1].map(String));
}
const noNumberModel = numberFixture(), badNumbers = numberFixture(changed(0)), brokenNumbers = numberFixture();
brokenNumbers.querySelector("[data-number-layouts]").textContent = "{";
init([noNumberModel]);
init([badNumbers, brokenNumbers], { PuzzlepiaNumberLayouts: numberModel });
for (const root of [noNumberModel, badNumbers, brokenNumbers]) {
  checkInitial(root);
  assert.equal(root.querySelector("[data-number-controls]").hidden, true);
  assert.match(root.querySelector("[data-number-note]").textContent, /Starter layout/);
  root.tiles[0].click(); root.tiles[6].click();
  assert.equal(root.querySelector("[data-progress]").textContent, "1 / 8 pairs found");
}
// Both routes described in the new challenge consume each position exactly once.
for (const first of [[[1, 3], [12, 9]], [[1, 9], [12, 3]]]) {
  const pairs = [...first, [2, 7], [4, 10], [5, 8], [6, 11], [13, 14], [15, 16]];
  assert.equal(new Set(pairs.flat()).size, 16);
  pairs.forEach(([a, b]) => assert.equal(numberLayouts[1][a - 1] + numberLayouts[1][b - 1], 10));
}
console.log(`Make 10 rotation passed: seven balanced boards, ${remainders} reachable remainders, 14 completions, UTC/reset/next/fallback and both challenge solutions.`);

for (const [mode, data, gameModel, create, base] of [
  ["memory", layouts, model, rotatingFixture, "/daily/memory-pairs/"],
  ["number", numberLayouts, numberModel, numberFixture, "/daily/number-pairs/"]
]) {
  const property = mode === "memory" ? "PuzzlepiaMemoryLayouts" : "PuzzlepiaNumberLayouts";
  const withLocation = search => ({
    [property]: { valid: gameModel.valid, today: () => 5 },
    location: { search },
    get localStorage() { throw Error("pair links must not access storage"); }
  });
  for (let i = 0; i < 7; i++) {
    const root = create();
    init([root], withLocation("?layout=" + (i + 1) + "&extra=ignored"));
    assert.deepEqual(valuesOf(root), data[i].map(String));
    const link = root.querySelector("[data-layout-link]");
    assert.equal(link.href, base + "?layout=" + (i + 1));
    assert.equal(root.querySelector("[data-layout-link-row]").hidden, false);
    root.tiles[0].click();
    root.querySelector("[data-reset]").click();
    checkInitial(root);
    assert.deepEqual(valuesOf(root), data[i].map(String));
    root.querySelector("[data-" + mode + "-today]").click();
    assert.equal(link.href, base + "?layout=6");
    const select = root.querySelector("[data-" + mode + "-select]");
    select.value = "0"; select.listeners.change();
    assert.equal(link.href, base + "?layout=1");
    const fresh = create();
    init([fresh], withLocation(new URL(link.href, "https://puzzlepia.com").search));
    checkInitial(fresh);
    assert.deepEqual(valuesOf(fresh), data[0].map(String));
  }
  for (const search of ["", "?layout=", "?layout=0", "?layout=8", "?layout=-1", "?layout=1.5",
    "?layout=01", "?layout=+1", "?layout=1&layout=2", "?layout=2&layout=2", "?layout=<script>", "?layout=%FF"]) {
    const root = create();
    init([root], withLocation(search));
    assert.deepEqual(valuesOf(root), data[5].map(String), "invalid link uses today's pick: " + search);
  }
  const missingURL = create();
  init([missingURL], withLocation("?layout=2"), { URLSearchParams: undefined });
  assert.deepEqual(valuesOf(missingURL), data[5].map(String));
  const historyRoot = create();
  const historyWindow = withLocation("?layout=2");
  const historyEvents = {};
  historyWindow.addEventListener = (name, callback) => { historyEvents[name] = callback; };
  init([historyRoot], historyWindow);
  const historyPicker = historyRoot.querySelector("[data-" + mode + "-select]");
  historyRoot.tiles[0].click();
  historyPicker.value = "6";
  historyEvents.pageshow();
  assert.equal(historyPicker.value, "1", "history-restored selector must match the actual board");
  assert.equal(historyRoot.tiles[0].classList.contains("is-selected"), true, "pageshow does not reset progress");
  historyPicker.value = "3"; historyPicker.listeners.change();
  historyPicker.value = "0"; historyEvents.pageshow();
  assert.equal(historyPicker.value, "3");
  const missingLink = create();
  delete missingLink.children["[data-layout-link]"];
  init([missingLink], withLocation("?layout=2"));
  assert.deepEqual(valuesOf(missingLink), data[1].map(String));
  const unavailable = create();
  init([unavailable], { location: { search: "?layout=2" } });
  assert.equal(unavailable.querySelector("[data-layout-link-row]").hidden, true);
  assert.deepEqual(valuesOf(unavailable), data[0].map(String));
}

// The memory exercise uses the exact published Layout 2 positions.
assert.equal(layouts[1][0], "circle");
assert.equal(layouts[1][1], "star");
const exercisePairs = [[7, 2], [10, 1], [3, 8], [4, 9], [5, 12], [6, 11]];
assert.equal(new Set(exercisePairs.flat()).size, 12);
exercisePairs.forEach(([a, b]) => assert.equal(layouts[1][a - 1], layouts[1][b - 1]));
console.log("Pair layout links passed: 14 fixed links, invalid/duplicate queries, reset/today/switch, fresh replay, missing URL API/markup/model, no storage and memory exercise.");

// Round 3 uses two actual mismatches before the two remembered matches.
assert.deepEqual(layouts[2].slice(0, 4), ["moon", "diamond", "circle", "star"]);
const roundThreePairs = [[7, 2], [8, 1], [12, 3], [11, 4], [9, 6], [10, 5]];
assert.equal(new Set(roundThreePairs.flat()).size, 12);
roundThreePairs.forEach(([a, b]) => assert.equal(layouts[2][a - 1], layouts[2][b - 1]));
const practice = rotatingFixture();
init([practice], { PuzzlepiaMemoryLayouts: model, location: { search: "?layout=3" } });
const practiceTap = position => practice.tiles[position - 1].click();
const practiceReset = practice.querySelector("[data-reset]");
practiceTap(1); practiceTap(2); practiceReset.click(); checkInitial(practice);
for (let replay = 0; replay < 2; replay += 1) {
  [1, 2, 3, 4].forEach(practiceTap);
  assert.equal(practice.tiles[0].querySelector(".pair-face").textContent, "?");
  assert.equal(practice.tiles[2].classList.contains("is-mismatch"), true);
  assert.equal(practice.tiles[3].classList.contains("is-mismatch"), true);
  assert.equal(practice.querySelector("[data-progress]").textContent, "0 / 6 pairs found");
  roundThreePairs.forEach(([a, b], i) => {
    practiceTap(a); practiceTap(b);
    assert.equal(practice.querySelector("[data-progress]").textContent, (i + 1) + " / 6 pairs found");
    assert.equal(practice.tiles[a - 1].disabled, true);
    assert.equal(practice.tiles[b - 1].disabled, true);
  });
  assert.equal(practice.querySelector("[data-complete]").hidden, false);
  practiceReset.click(); checkInitial(practice);
  assert.deepEqual(valuesOf(practice), layouts[2]);
}
console.log("Memory practice passed: Layout 3 reveals, two mismatches, six correct pairs, reset before/after completion and replay.");
