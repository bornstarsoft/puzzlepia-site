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

const browserScript = fs.readFileSync(path.join(__dirname, "../static/js/daily-word-search.js"), "utf8");
vm.runInNewContext(browserScript, { window: {}, document: { querySelector: () => null } });
vm.runInNewContext(browserScript, { window: { PuzzlepiaGames: {}, PuzzlepiaWordSearch: model }, document: { querySelector: () => null } });
console.log(`Word Search checks passed: ${paths} unique word paths, 14 boards, UTC boundaries, 400 rotation days, invalid data and missing-root guards.`);
