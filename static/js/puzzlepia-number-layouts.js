(function (root) {
  "use strict";

  var start = Date.UTC(2026, 9, 22);
  var day = 86400000;

  function valid(layouts) {
    return Array.isArray(layouts) && layouts.length === 7 &&
      layouts.every(function (cards) {
        if (!Array.isArray(cards) || cards.length !== 16 || !cards.every(function (n) {
          return Number.isInteger(n) && n >= 1 && n <= 9;
        })) return false;
        var counts = Array(10).fill(0);
        cards.forEach(function (n) { counts[n] += 1; });
        return counts[5] % 2 === 0 && [1, 2, 3, 4].every(function (n) {
          return counts[n] === counts[10 - n];
        });
      }) && new Set(layouts.map(function (cards) { return cards.join(","); })).size === 7;
  }

  function today(date) {
    var time = (date || new Date()).getTime();
    if (!Number.isFinite(time) || time < start) return 0;
    return Math.floor((time - start) / day) % 7;
  }

  var api = { valid: valid, today: today };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PuzzlepiaNumberLayouts = api;
})(typeof window === "object" ? window : this);
