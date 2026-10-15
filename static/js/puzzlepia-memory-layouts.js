(function (root) {
  "use strict";

  var symbols = ["star", "moon", "sun", "diamond", "circle", "triangle"];
  var start = Date.UTC(2026, 9, 15);
  var day = 86400000;

  function valid(layouts) {
    return Array.isArray(layouts) && layouts.length === 7 &&
      layouts.every(function (cards) {
        return Array.isArray(cards) && cards.length === 12 && symbols.every(function (symbol) {
          return cards.filter(function (card) { return card === symbol; }).length === 2;
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
  else root.PuzzlepiaMemoryLayouts = api;
})(typeof window === "object" ? window : this);
