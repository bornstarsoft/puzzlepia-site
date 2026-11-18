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
const preview = { hidden: true };
const previewLink = {};
const previewDate = {};
const elements = {
  "[data-weekly-label]": label,
  "[data-weekly-link]": link,
  "[data-weekly-preview]": preview,
  "[data-weekly-preview-link]": previewLink,
  "[data-weekly-preview-date]": previewDate
};
const root = { querySelector: key => elements[key], querySelectorAll: () => picks };
let now = start;
const callbacks = {};
const document = {
  hidden: false,
  querySelector: () => root,
  addEventListener(name, fn) { callbacks[name] = fn; }
};
const context = {
  document,
  window: { addEventListener: (event, callback) => { callbacks[event] = callback; } },
  Date: class extends Date { static now() { return now; } }
};
Object.defineProperty(context.window, "localStorage", { get() { assert.fail("Unexpected storage access"); } });
vm.runInNewContext(source, context);
assert.equal(label.textContent, "This week's practice:");
assert.equal(preview.hidden, false);
assert.equal(previewLink.href, picks[1].href);
assert.equal(previewDate.dateTime, "2026-11-23T00:00:00.000Z");
assert.equal(previewDate.textContent, "Nov 23, 2026, 00:00 UTC");

for (let index = 0; index <= picks.length; index++) {
  for (const diff of [0, week - 1]) {
    now = start + index * week + diff;
    callbacks.pageshow();
    const expected = picks[index % picks.length];
    assert.equal(link.href, expected.href);
    assert.equal(link.textContent, expected.textContent);
    assert.deepEqual(picks.filter(p => p["aria-current"]), [expected]);
    const next = picks[(index + 1) % picks.length];
    assert.equal(previewLink.href, next.href);
    assert.equal(previewLink.textContent, next.textContent);
    assert.equal(previewDate.dateTime, new Date(start + (index + 1) * week).toISOString());
  }
}
now = start - 1;
callbacks.pageshow();
assert.equal(link.href, picks.at(-1).href, "rotation before the anchor");
assert.equal(previewLink.href, picks[0].href, "upcoming pick wraps to the beginning");
assert.equal(previewDate.dateTime, new Date(start).toISOString());
now = NaN;
callbacks.pageshow();
assert.equal(link.href, picks.at(-1).href, "invalid time leaves the link intact");
assert.equal(previewLink.href, picks[0].href);

now = start + week;
document.hidden = true;
callbacks.visibilitychange();
assert.equal(link.href, picks.at(-1).href, "a hidden tab does not rewrite the pick");
document.hidden = false;
callbacks.visibilitychange();
assert.equal(link.href, picks[1].href);
assert.equal(previewLink.href, picks[2].href);
assert.equal(previewDate.dateTime, "2026-11-30T00:00:00.000Z");

delete elements["[data-weekly-preview-date]"];
now = start;
assert.doesNotThrow(() => vm.runInNewContext(source, context));
assert.equal(link.href, picks[0].href, "current pick still works without optional preview markup");

for (const page of [null, { querySelector: () => null, querySelectorAll: () => [] }]) {
  assert.doesNotThrow(() => vm.runInNewContext(source, { document: { querySelector: () => page } }));
}
console.log("Weekly practice passed: six current and next picks, UTC boundaries, wrap, pageshow, tab return and missing markup.");
