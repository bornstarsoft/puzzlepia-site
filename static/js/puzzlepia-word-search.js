(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PuzzlepiaWordSearch = factory();
})(typeof window === "undefined" ? this : window, function () {
  "use strict";

  // Scan the fixed board in eight directions; never generate a board at runtime.
  function findPaths(rows, word) {
    var paths = [];
    var seen = new Set();
    for (var r = 0; r < 6; r += 1) {
      for (var c = 0; c < 6; c += 1) {
        for (var dr = -1; dr <= 1; dr += 1) {
          for (var dc = -1; dc <= 1; dc += 1) {
            if (!dr && !dc) continue;
            var path = [];
            for (var i = 0; i < word.length; i += 1) {
              var y = r + dr * i, x = c + dc * i;
              if (y < 0 || y >= 6 || x < 0 || x >= 6 || rows[y][x] !== word[i]) break;
              path.push([y, x]);
            }
            if (path.length === word.length) {
              var key = path.map(function (p) { return p.join(","); }).sort().join(";");
              if (!seen.has(key)) { seen.add(key); paths.push(path); }
            }
          }
        }
      }
    }
    return paths;
  }

  function prepare(catalog) {
    if (!catalog || !/^\d{4}-\d{2}-\d{2}$/.test(catalog.startDate) ||
        !Array.isArray(catalog.sets) || !catalog.sets.length || catalog.sets.length > 60) return null;
    var start = Date.parse(catalog.startDate + "T00:00:00Z");
    if (!Number.isFinite(start) || new Date(start).toISOString().slice(0, 10) !== catalog.startDate) return null;
    var ids = new Set();
    var sets = [];
    for (var set of catalog.sets) {
      if (!set || typeof set.id !== "string" || !/^[a-z0-9-]+$/.test(set.id) || ids.has(set.id) ||
          typeof set.title !== "string" || !set.title.trim() || set.title.length > 64 ||
          !Array.isArray(set.rows) || set.rows.length !== 6 ||
          !set.rows.every(function (row) { return typeof row === "string" && /^[A-Z]{6}$/.test(row); }) ||
          !Array.isArray(set.words) || set.words.length !== 4 || new Set(set.words).size !== 4 ||
          !set.words.every(function (word) { return typeof word === "string" && /^[A-Z]{3,6}$/.test(word); })) return null;
      var paths = {};
      for (var word of set.words) {
        var matches = findPaths(set.rows, word);
        if (matches.length !== 1) return null;
        paths[word] = matches[0];
      }
      ids.add(set.id);
      sets.push({ id: set.id, title: set.title, rows: set.rows.slice(), words: set.words.slice(), paths: paths });
    }
    return { start: start, sets: sets };
  }

  function pick(prepared, date) {
    var time = date && date.getTime();
    if (!Number.isFinite(time)) return { index: 0, day: "", replay: false, scheduled: false };
    var days = Math.floor((time - prepared.start) / 86400000);
    return {
      index: days < 0 ? 0 : days % prepared.sets.length,
      day: date.toISOString().slice(0, 10),
      replay: days >= prepared.sets.length,
      scheduled: days >= 0
    };
  }

  function linkedSet(prepared, search) {
    try {
      var params = new URLSearchParams(search);
      if (params.getAll("set").length !== 1) return -1;
      var id = params.get("set");
      return prepared.sets.findIndex(function (set) { return set.id === id; });
    } catch (_) { return -1; }
  }

  function setLink(prepared, index) {
    if (!Number.isInteger(index) || !prepared.sets[index]) return "";
    return "/daily/word-search/?set=" + encodeURIComponent(prepared.sets[index].id);
  }

  return { prepare: prepare, pick: pick, findPaths: findPaths, linkedSet: linkedSet, setLink: setLink };
});
