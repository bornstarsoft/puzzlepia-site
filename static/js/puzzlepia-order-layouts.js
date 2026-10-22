(function (root) {
  "use strict";

  var start = Date.UTC(2026, 9, 22);
  var day = 86400000;

  function valid(layouts) {
    return Array.isArray(layouts) && layouts.length === 7 &&
      layouts.every(function (numbers) {
        return Array.isArray(numbers) && numbers.length === 16 &&
          numbers.every(function (n) { return Number.isInteger(n) && n >= 1 && n <= 16; }) &&
          new Set(numbers).size === 16;
      }) && new Set(layouts.map(function (numbers) { return numbers.join(","); })).size === 7;
  }

  function today(date) {
    var time = (date || new Date()).getTime();
    if (!Number.isFinite(time) || time < start) return 0;
    return Math.floor((time - start) / day) % 7;
  }

  var api = { valid: valid, today: today };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PuzzlepiaOrderLayouts = api;
})(typeof window === "object" ? window : this);
