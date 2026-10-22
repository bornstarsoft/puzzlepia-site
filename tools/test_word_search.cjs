"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const model = require("../static/js/puzzlepia-word-search.js");
const source = require("../data/word_search.json");
const original = JSON.stringify(source);
const copy = () => JSON.parse(JSON.stringify(source));
const catalog = model.prepare(source);
assert.ok(catalog);
assert.equal(catalog.sets.length, 14);
assert.equal(new Set(catalog.sets.map(s => s.rows.join(""))).size, 14);

// Independently walk each returned solution, including reversed selection.
let paths = 0;
for (const set of catalog.sets) {
  assert.equal(set.words.length, 4);
  for (const word of set.words) {
    const cells = set.paths[word];
    assert.equal(cells.map(([r, c]) => set.rows[r][c]).join(""), word);
    assert.equal(cells.slice().reverse().map(([r, c]) => set.rows[r][c]).join(""), word.split("").reverse().join(""));
    const [dr, dc] = [cells[1][0] - cells[0][0], cells[1][1] - cells[0][1]];
    assert.ok(Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr || dc));
    cells.forEach(([r, c], i) => {
      assert.equal(r, cells[0][0] + dr * i);
      assert.equal(c, cells[0][1] + dc * i);
      assert.ok(r >= 0 && r < 6 && c >= 0 && c < 6);
    });
    paths += 1;
  }
}

const at = value => model.pick(catalog, new Date(value));
assert.equal(at("2026-10-13T23:59:59.999Z").scheduled, false);
assert.equal(at("2026-10-14T00:00:00Z").index, 0);
assert.equal(at("2026-10-14T23:59:59.999Z").index, 0);
assert.equal(at("2026-10-15T00:00:00Z").index, 1);
assert.equal(at("2026-10-15T08:59:59+09:00").index, 0);
assert.equal(at("2026-10-15T09:00:00+09:00").index, 1);
assert.equal(at("2026-10-14T17:00:00-07:00").index, 1);
assert.equal(at("2026-10-27T23:59:59Z").replay, false);
assert.equal(at("2026-10-28T00:00:00Z").index, 0);
assert.equal(at("2026-10-28T00:00:00Z").replay, true);
assert.equal(at("bad date").scheduled, false);
assert.equal(model.pick(catalog, null).index, 0);
for (let day = 0; day < 400; day += 1) {
  const pick = model.pick(catalog, new Date(catalog.start + day * 86400000));
  assert.equal(pick.index, day % 14);
  assert.equal(pick.replay, day >= 14);
}

const reject = mutate => { const data = copy(); mutate(data); assert.equal(model.prepare(data), null); };
reject(c => { c.startDate = "2026-02-30"; });
reject(c => { c.startDate = "not a date"; });
reject(c => { c.sets = []; });
reject(c => { c.sets[1].id = c.sets[0].id; });
reject(c => { c.sets[0].rows[0] = "TOOSHORT?"; });
reject(c => { c.sets[0].rows[0] = "starpm"; });
reject(c => { c.sets[0].words = ["STAR", "STAR", "MINT", "PLAY"]; });
reject(c => { c.sets[0].words[0] = "ZZZZ"; });
reject(c => { c.sets[0].rows[1] = "STARIO"; });
reject(c => { c.sets[0].title = ""; });
assert.equal(model.prepare(null), null);
assert.equal(model.prepare({}), null);
assert.equal(JSON.stringify(source), original, "preparation must not modify the source catalog");

for (const [index, set] of catalog.sets.entries()) {
  const link = model.setLink(catalog, index);
  assert.equal(link, "/daily/word-search/?set=" + set.id);
  assert.equal(model.linkedSet(catalog, link.slice(link.indexOf("?"))), index);
  assert.equal(model.linkedSet(catalog, "?set=" + set.id + "&utm_source=test"), index);
  const reordered = { sets: catalog.sets.slice().reverse() };
  assert.equal(reordered.sets[model.linkedSet(reordered, "?set=" + set.id)].id, set.id);
}
for (const search of ["", "?set=", "?set=unknown", "?set=STARTER", "?set=0", "?set=starter&set=fruit",
  "?set=starter&set=starter", "?set=%3Cscript%3E", "?set=//evil.example/", "?set=%E0%A4%A"])
  assert.equal(model.linkedSet(catalog, search), -1);
for (const index of [-1, 14, NaN, 0.5, "0"]) assert.equal(model.setLink(catalog, index), "");
assert.equal(model.linkedSet(null, "?set=starter"), -1);
console.log("Set links passed: 14 stable IDs, reordered catalog, unknown/duplicate/malformed parameters, no arbitrary URL destinations.");

const browserScript = fs.readFileSync(path.join(__dirname, "../static/js/daily-word-search.js"), "utf8");
for (const set of catalog.sets) {
  const before = JSON.stringify(set);
  const found = [];
  let previous = null;
  for (const word of set.words) {
    const hint = model.nextHint(set, found, previous);
    assert.equal(hint.word, word);
    assert.deepEqual([hint.row, hint.col], set.paths[word][0]);
    assert.equal(set.rows[hint.row][hint.col], word[0]);
    previous = word;
  }
  assert.equal(model.nextHint(set, found, previous).word, set.words[0]);
  found.push(set.words[0], set.words[1], set.words[3]);
  assert.equal(model.nextHint(set, found, set.words[2]).word, set.words[2]);
  assert.equal(found.length, 3, "hints never mark words found");
  assert.equal(model.nextHint(set, set.words, null), null);
  assert.equal(JSON.stringify(set), before);
}
assert.equal(model.nextHint(null, [], null), null);
assert.deepEqual(catalog.sets.find(s => s.id === "fruit").paths.KIWI, [[5, 5], [5, 4], [5, 3], [5, 2]]);
assert.deepEqual(catalog.sets.find(s => s.id === "night-sky").paths.STAR, [[0, 0], [1, 1], [2, 2], [3, 3]]);
console.log("Hint checks passed: 56 starting cells, cycling, skipping found words, completion and no mutation; worked example paths match.");

vm.runInNewContext(browserScript, { window: {}, document: { querySelector: () => null } });
vm.runInNewContext(browserScript, { window: { PuzzlepiaGames: {}, PuzzlepiaWordSearch: model }, document: { querySelector: () => null } });
console.log(`Word Search checks passed: ${paths} unique word paths, 14 boards, UTC boundaries, 400 rotation days, invalid data and missing-root guards.`);
