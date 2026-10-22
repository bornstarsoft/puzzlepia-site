const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../static/js/puzzlepia-return.js'), 'utf8');
const key = 'puzzlepiaRecentPuzzleV1';
const catalog = ['word-search', 'block-puzzle', 'ring-puzzle', 'number-puzzle',
  'color-match', 'memory-pairs', 'number-pairs'].map(slug => ({
  url: `/daily/${slug}/`, title: slug, description: `Current ${slug}`, icon: 'P'
}));

function fixture(options = {}) {
  const data = new Map([['word-progress', 'unchanged']]);
  if (options.stored !== undefined) data.set(key, options.stored);
  const events = {};
  const writes = [];
  const removals = [];
  let focused = false;
  const fields = {};
  for (const name of ['title', 'description', 'icon', 'link', 'clear']) {
    fields[name] = { textContent: '', attributes: {}, handlers: [],
      setAttribute(k, v) { this.attributes[k] = v; },
      addEventListener(type, fn) { this.handlers.push(fn); } };
  }
  const panel = { hidden: false, querySelector(selector) {
    const name = selector.match(/data-recent-(\w+)/)[1];
    return options.missing === name ? null : fields[name];
  } };
  const storage = {
    getItem(k) { if (options.blocked) throw Error('blocked'); return data.get(k) ?? null; },
    setItem(k, v) { if (options.blocked) throw Error('blocked'); writes.push(k); data.set(k, v); },
    removeItem(k) { if (options.blocked) throw Error('blocked'); removals.push(k); data.delete(k); }
  };
  const window = { addEventListener(type, fn) { events[type] = fn; } };
  Object.defineProperty(window, 'localStorage', { get() {
    if (options.blockedGetter) throw Error('blocked getter');
    return storage;
  } });
  const document = {
    querySelectorAll() { return options.noPanels ? [] : [panel]; },
    querySelector(selector) {
      if (selector === '[data-puzzle-entry]') return options.entry ? {
        getAttribute() { return options.entry; }
      } : null;
      if (selector === '#puzzlepia-recent-index') return options.noIndex ? null : {
        textContent: options.index === undefined ? JSON.stringify(catalog) : options.index
      };
      if (selector === 'a[href="/daily/"]') return { focus() { focused = true; } };
      return null;
    }
  };
  vm.runInNewContext(source, { window, document });
  return { data, events, fields, panel, writes, removals,
    focused: () => focused, clear: () => fields.clear.handlers.forEach(fn => fn()) };
}

for (const item of catalog) {
  const f = fixture({ stored: JSON.stringify({ ...item, title: '<old copy>', description: 'old' }) });
  assert.equal(f.panel.hidden, false);
  assert.equal(f.fields.title.textContent, item.title);
  assert.equal(f.fields.description.textContent, item.description);
  assert.equal(f.fields.link.href, item.url);
  assert.equal(f.writes.length, 0);
}

for (const url of ['/daily/removed/', '/daily/challenges/test/', '//example.com/',
  'https://example.com/', 'javascript:alert(1)', '/daily/word-search/?set=fruit',
  '/daily/word-search/#test', '/daily/%2e%2e/', '/daily/word-search\\/']) {
  const f = fixture({ stored: JSON.stringify({ url }) });
  assert.equal(f.panel.hidden, true, url);
}
for (const stored of ['{', 'null', '[]', '1', '"hello"', '{}']) {
  assert.equal(fixture({ stored }).panel.hidden, true);
}
for (const options of [{ noIndex: true }, { index: '{' }, { index: '{}' },
  { index: '[{"url":"https://example.com/"}]' }, { missing: 'title' },
  { missing: 'link' }, { blocked: true }, { blockedGetter: true }]) {
  const f = fixture({ stored: JSON.stringify(catalog[0]), entry: catalog[0].url, ...options });
  assert.equal(f.panel.hidden, true);
}
const f = fixture({ entry: catalog[0].url });
assert.deepEqual(JSON.parse(f.data.get(key)), catalog[0]);
assert.deepEqual(f.writes, [key]);
f.data.set(key, JSON.stringify(catalog[1]));
f.events.pageshow();
assert.equal(f.fields.link.href, catalog[1].url);
assert.deepEqual(f.writes, [key], 'restored page must not overwrite newer pick');
f.data.set(key, JSON.stringify(catalog[2]));
f.events.storage({ key: 'other-key' });
assert.equal(f.fields.link.href, catalog[1].url);
f.events.storage({ key });
assert.equal(f.fields.link.href, catalog[2].url);
assert.equal(f.fields.clear.handlers.length, 1);
f.clear();
assert.equal(f.panel.hidden, true);
assert.equal(f.data.has(key), false);
assert.equal(f.data.get('word-progress'), 'unchanged');
assert.deepEqual(f.removals, [key]);
assert.equal(f.focused(), true);
f.data.set(key, JSON.stringify(catalog[3]));
f.events.storage({ key });
assert.equal(f.panel.hidden, false);
f.data.delete(key);
f.events.storage({ key: null });
assert.equal(f.panel.hidden, true);
fixture({ noPanels: true, entry: catalog[0].url });
const optional = fixture({ missing: 'description', stored: JSON.stringify(catalog[0]) });
assert.equal(optional.panel.hidden, false);
const blocked = fixture({ blocked: true });
blocked.clear();
assert.equal(blocked.panel.hidden, true);
console.log('Recent puzzle: catalog, lifecycle, storage, clear and fallback checks PASS');
