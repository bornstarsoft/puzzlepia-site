(function () {
  "use strict";

  var link = document.querySelector("[data-challenge-list-return]");
  if (!link || !document.referrer || typeof URL !== "function" || typeof URLSearchParams !== "function") return;

  var path = link.getAttribute("data-challenge-list-return");
  var from;
  try {
    from = new URL(document.referrer);
  } catch (_) {
    return;
  }
  if (from.origin !== window.location.origin || from.pathname !== path) return;

  // Forward only the collection controls; the archive validates their values.
  var params = new URLSearchParams();
  ["topic", "level", "q", "sort", "view"].forEach(function (name) {
    var values = from.searchParams.getAll(name);
    if (values.length === 1 && values[0].trim() && values[0].length <= 80) {
      params.set(name, values[0]);
    }
  });
  var query = params.toString();
  if (!query) return;

  link.setAttribute("href", path + "?" + query + "#daily-challenge-title");
  link.textContent = "Back to your challenge list";
})();
