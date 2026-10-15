"use strict";

const assert = require("node:assert/strict");
const model = require("../static/js/puzzlepia-word-search.js");
const progress = require("../static/js/puzzlepia-word-progress.js");
const catalog = model.prepare(require("../data/word_search.json"));
const start = Date.parse("2026-10-15T12:00:00Z");
let now = start;
const values = new Map();
const storage = {
  getItem: key => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key)
};
const store = progress.create(() => storage, catalog, () => now);
const state = { index: 1, day: "2026-10-15", mode: "daily", found: ["PEAR"] };
assert.deepEqual(store.read(), { ok: true, record: null });
assert.equal(values.size, 0, "reading must not opt a player in");
assert.equal(store.write(state), true);
const good = values.get(progress.key);
assert.deepEqual(store.read().record, state);
assert.equal(store.write({ ...state, found: catalog.sets[1].words }), true);
assert.equal(store.read().record.found.length, 4, "completion restores like partial progress");
assert.equal(store.write({ ...state, found: [] }), true);
assert.deepEqual(store.read().record.found, [], "reset replaces saved markers");
assert.equal(store.clear(), true);
assert.equal(store.read().record, null);

for (let index = 0; index < catalog.sets.length; index += 1) {
  const practice = { index, day: state.day, mode: "practice", found: catalog.sets[index].words.slice(0, 2) };
  assert.equal(store.write(practice), true);
  assert.deepEqual(store.read().record, practice);
  assert.equal(values.size, 1, "only the latest set is stored");
}
const reject = mutate => {
  const value = JSON.parse(good); mutate(value);
  values.set(progress.key, JSON.stringify(value));
  assert.deepEqual(store.read(), { ok: true, record: null });
  assert.equal(values.has(progress.key), false);
};
reject(v => { v.version = 2; });
reject(v => { v.setId = "missing"; });
reject(v => { v.signature = "old board"; });
reject(v => { v.savedAt = now + 1; });
reject(v => { v.savedAt = "invalid"; });
reject(v => { v.savedAt = now - 30 * 86400000; });
reject(v => { v.day = "2026-02-30"; });
reject(v => { v.day = "2026-10-16"; });
reject(v => { v.mode = "unknown"; });
reject(v => { v.day = "2026-10-14"; });
reject(v => { v.found = ["PEAR", "PEAR"]; });
reject(v => { v.found = ["<script>"]; });
reject(v => { v.found = ["STAR"]; });
reject(v => { v.found = null; });
for (const raw of ["invalid", "null", "{}", "[]", "x".repeat(4097)]) {
  values.set(progress.key, raw);
  assert.equal(store.read().record, null);
}
values.set(progress.key, good);
now += 86400000;
assert.equal(store.read().record.day, "2026-10-15", "day rollover retains a separate saved set");
now = start + 30 * 86400000 - 1;
assert.ok(store.read().record);
now += 1;
assert.equal(store.read().record, null);
now = start;
values.set(progress.key, good);
const changedCatalog = model.prepare(require("../data/word_search.json"));
changedCatalog.sets[1].rows[0] = "ABCDEF";
assert.equal(progress.create(() => storage, changedCatalog, () => now).read().record, null);

const blocked = progress.create(() => { throw Error("blocked"); }, catalog, () => now);
assert.deepEqual(blocked.read(), { ok: false, record: null });
assert.equal(blocked.write(state), false);
assert.equal(blocked.clear(), false);
const quota = progress.create(() => ({ ...storage, setItem: () => { throw Error("quota"); } }), catalog, () => now);
assert.equal(quota.write(state), false);
assert.equal(store.write({ ...state, index: 100 }), false);
assert.equal(store.write({ ...state, found: ["WRONG"] }), false);
assert.equal(store.write(null), false);
console.log("Word progress checks passed: opt-in boundary, 14 sets, partial/completed/reset state, expiry, UTC rollover, changed/corrupt data, blocked storage and quota failures.");
