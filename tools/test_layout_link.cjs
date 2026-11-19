"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(require.resolve("../static/js/puzzlepia-layout-link.js"), "utf8");
const url = (layout) => "https://puzzlepia.com/daily/number-puzzle/?layout=" + layout;

function setup(clipboard, { hidden = false, observe = true } = {}) {
  let mutation;
  let copy;
  const link = { href: url(3) };
  const share = { hidden: true };
  const status = { textContent: "" };
  const input = {
    value: "",
    focus() { this.focused = true; },
    select() { this.selected = true; }
  };
  const button = {
    disabled: false,
    addEventListener(event, handler) {
      assert.equal(event, "click");
      copy = handler;
    }
  };
  const elements = { "layout-link": link, "layout-share": share, "layout-link-value": input,
    "copy-layout": button, "layout-share-status": status };
  const panel = { hidden, querySelector: (s) => elements[s.slice(6, -1)] };
  class Observer {
    constructor(handler) { mutation = handler; }
    observe(target, options) {
      assert.equal(target, link);
      assert.equal(options.attributes, true);
      assert.equal(options.attributeFilter.join(","), "href");
    }
  }
  vm.runInNewContext(source, {
    document: { querySelector: () => panel },
    window: { navigator: { clipboard } },
    MutationObserver: observe ? Observer : undefined
  });
  return { share, status, input, button, copy, select(layout) { link.href = url(layout); mutation(); } };
}

(async () => {
  let copied;
  const working = setup({ writeText: async (text) => { copied = text; } });
  assert.equal(working.share.hidden, false);
  assert.equal(working.input.value, url(3));
  await working.copy();
  assert.equal(copied, url(3));
  assert.equal(working.status.textContent, "Link copied.");
  working.select(4);
  assert.equal(working.input.value, url(4));
  assert.equal(working.status.textContent, "");

  for (const clipboard of [undefined, { writeText: async () => { throw Error("Denied"); } }]) {
    const manual = setup(clipboard);
    await manual.copy();
    assert.match(manual.status.textContent, /manual copying/);
    assert.equal(manual.input.focused, true);
    assert.equal(manual.input.selected, true);
    assert.equal(manual.button.disabled, false);
  }

  let markOldCopyDone;
  const delayed = setup({ writeText: () => new Promise((resolve) => { markOldCopyDone = resolve; }) });
  const pending = delayed.copy();
  assert.equal(delayed.button.disabled, true);
  delayed.select(5);
  markOldCopyDone();
  await pending;
  assert.equal(delayed.input.value, url(5));
  assert.equal(delayed.status.textContent, "");
  assert.equal(delayed.button.disabled, false);
  assert.equal(setup(null, { hidden: true }).share.hidden, true);
  assert.equal(setup(null, { observe: false }).share.hidden, true);
  console.log("Layout link PASS: exact copy, changed layouts, delayed clipboard, manual fallback and unavailable board.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
