"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(require.resolve("../static/js/puzzlepia-weekly-practice.js"), "utf8");
const start = Date.UTC(2026, 10, 16);
const week = 604800000;
const picks = Array.from({ length: 6 }, (_, index) => ({
  href: "/daily/challenges/" + (index + 1) + "/",
  textContent: "Pick " + (index + 1),
  setAttribute(name, value) { this[name] = value; },
  removeAttribute(name) { delete this[name]; }
}));
const label = { textContent: "Practice pick:" };
const link = { href: picks[0].href, textContent: picks[0].textContent };
const schedule = { hidden: true };
const elements = {
  "[data-weekly-label]": label,
  "[data-weekly-link]": link,
  "[data-weekly-schedule]": schedule
};
const root = { querySelector: key => elements[key], querySelectorAll: () => picks };
let now = start;
const callbacks = {};
const context = {
  document: { querySelector: () => root },
  window: { addEventListener: (event, callback) => { callbacks[event] = callback; } },
  Date: { UTC: Date.UTC, now: () => now }
};
Object.defineProperty(context.window, "localStorage", { get() { assert.fail("Unexpected storage access"); } });
vm.runInNewContext(source, context);
assert.equal(label.textContent, "This week's practice:");
assert.equal(schedule.hidden, false);

for (let index = 0; index <= picks.length; index++) {
  for (const diff of [0, week - 1]) {
    now = start + index * week + diff;
    callbacks.pageshow();
    const expected = picks[index % picks.length];
    assert.equal(link.href, expected.href);
    assert.equal(link.textContent, expected.textContent);
    assert.deepEqual(picks.filter(p => p["aria-current"]), [expected]);
  }
}
now = start - 1;
callbacks.pageshow();
assert.equal(link.href, picks.at(-1).href, "rotation before the anchor");
now = NaN;
callbacks.pageshow();
assert.equal(link.href, picks.at(-1).href, "invalid time leaves the link intact");

for (const page of [null, { querySelector: () => null, querySelectorAll: () => [] }]) {
  assert.doesNotThrow(() => vm.runInNewContext(source, { document: { querySelector: () => page } }));
}
console.log("Weekly practice passed: all six picks, UTC boundaries, cycle, pageshow, no storage and missing markup.");
