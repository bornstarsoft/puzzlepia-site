"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(require.resolve("../static/js/challenge-list-return.js"), "utf8");
const origin = "https://puzzlepia.com";
const fallback = "/daily/?topic=number#daily-challenge-title";

function run(referrer, { missingLink, missingURL } = {}) {
  const link = {
    textContent: "More number challenges",
    href: fallback,
    getAttribute(name) {
      assert.equal(name, "data-challenge-list-return");
      return "/daily/";
    },
    setAttribute(name, value) {
      assert.equal(name, "href");
      this.href = value;
    }
  };
  const document = {
    referrer,
    querySelector(selector) {
      assert.equal(selector, "[data-challenge-list-return]");
      return missingLink ? null : link;
    }
  };
  vm.runInNewContext(source, {
    document,
    window: { location: { origin } },
    URL: missingURL ? undefined : URL,
    URLSearchParams
  });
  return [link.href, link.textContent];
}

const filters = "topic=number&level=easy&q=two+rounds&sort=newest&view=all";
assert.deepEqual(run(origin + "/daily/?" + filters + "&utm_source=other#weekly-practice"), [
  "/daily/?" + filters + "#daily-challenge-title",
  "Back to your challenge list"
]);
assert.deepEqual(run(origin + "/daily/?q=%26%23%2F&topic=number&topic=word"), [
  "/daily/?q=%26%23%2F#daily-challenge-title",
  "Back to your challenge list"
]);
for (const url of [
  "", "not a URL", origin + "/daily/", origin + "/daily/?other=parameter",
  origin + "/daily/?q=" + "x".repeat(81), origin + "/daily/?q=++",
  origin + "/daily/number-puzzle/?topic=number", origin + "/blog/?topic=number",
  "https://other.example/daily/?topic=number", "http://puzzlepia.com/daily/?topic=number"
]) {
  assert.deepEqual(run(url), [fallback, "More number challenges"], url);
}
assert.equal(run(origin + "/daily/?" + filters, { missingLink: true })[0], fallback);
assert.equal(run(origin + "/daily/?" + filters, { missingURL: true })[0], fallback);
console.log("Challenge list return PASS: archive controls only, same-origin path and ordinary fallback.");
