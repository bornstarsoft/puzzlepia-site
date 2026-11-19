"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(require.resolve("../static/js/challenge-list-return.js"), "utf8");
const origin = "https://puzzlepia.com";
const fallback = "/daily/?topic=number#daily-challenge-title";

function run(referrer, { missingLink, missingURL, missingSearch } = {}) {
  const link = {
    textContent: "More number challenges",
    href: fallback,
    getAttribute(name) {
      if (name === "data-challenge-list-return") return "/daily/";
      assert.equal(name, "data-challenge-search-path");
      return missingSearch ? null : "/search/";
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

const searchURL = "/search/?q=word+search&type=challenges&batch=2";
assert.deepEqual(run(origin + searchURL + "&topic=word&next=https%3A%2F%2Fother.example%2F#top"), [
  searchURL, "Back to your search results"
]);
assert.deepEqual(run(origin + "/search/?q=" + "x".repeat(100)), [
  "/search/?q=" + "x".repeat(100), "Back to your search results"
]);
assert.deepEqual(run(origin + "/search/?type=challenges&batch=2&batch=3"), [
  "/search/?type=challenges", "Back to your search results"
]);
for (const url of [
  origin + "/search/", origin + "/search/?topic=number",
  origin + "/search/?q=" + "x".repeat(101), origin + "/search/?q=++",
  origin + "/search/child/?q=block", "https://other.example/search/?q=block"
]) {
  assert.deepEqual(run(url), [fallback, "More number challenges"], url);
}
assert.equal(run(origin + searchURL, { missingSearch: true })[0], fallback);
console.log("Challenge return PASS: Daily and Search controls, same-origin paths, bounds and ordinary fallbacks.");
