(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PuzzlepiaWordProgress = factory();
})(typeof window === "undefined" ? this : window, function () {
  "use strict";
  var key = "puzzlepiaWordProgressV1";
  var lifetime = 30 * 86400000;

  function signature(catalog, set) {
    return JSON.stringify([catalog.start, set.id, set.rows, set.words]);
  }

  function validate(value, catalog, now) {
    if (!value || value.version !== 1 || !Number.isFinite(now) ||
        !Number.isFinite(value.savedAt) || value.savedAt > now || now - value.savedAt >= lifetime ||
        typeof value.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.day) ||
        (value.mode !== "daily" && value.mode !== "practice")) return null;
    var day = Date.parse(value.day + "T00:00:00Z");
    if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== value.day ||
        day > value.savedAt) return null;
    var index = catalog.sets.findIndex(function (set) { return set.id === value.setId; });
    var set = catalog.sets[index];
    if (!set || value.signature !== signature(catalog, set) || !Array.isArray(value.found) ||
        value.found.length > set.words.length || new Set(value.found).size !== value.found.length ||
        !value.found.every(function (word) { return set.words.indexOf(word) !== -1; })) return null;
    if (value.mode === "daily" && (day < catalog.start ||
        Math.floor((day - catalog.start) / 86400000) % catalog.sets.length !== index)) return null;
    return { index: index, day: value.day, mode: value.mode, found: value.found.slice() };
  }

  function create(getStorage, catalog, clock) {
    clock = clock || Date.now;
    return {
      read: function () {
        try {
          var storage = getStorage(), raw = storage.getItem(key);
          if (raw === null) return { ok: true, record: null };
          var value = null;
          if (raw.length <= 4096) {
            try { value = validate(JSON.parse(raw), catalog, clock()); } catch (error) { /* Invalid save. */ }
          }
          if (!value) storage.removeItem(key);
          return { ok: true, record: value };
        } catch (error) { return { ok: false, record: null }; }
      },
      write: function (state) {
        try {
          var set = catalog.sets[state.index];
          if (!set) return false;
          var now = clock();
          var value = { version: 1, setId: set.id, signature: signature(catalog, set),
            day: state.day, mode: state.mode, found: state.found.slice(), savedAt: now };
          if (!validate(value, catalog, now)) return false;
          getStorage().setItem(key, JSON.stringify(value));
          return true;
        } catch (error) { return false; }
      },
      clear: function () {
        try { getStorage().removeItem(key); return true; } catch (error) { return false; }
      }
    };
  }

  return { create: create, key: key };
});
