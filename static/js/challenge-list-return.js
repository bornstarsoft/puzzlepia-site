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
  if (from.origin !== window.location.origin) return;

  var searchPath = link.getAttribute("data-challenge-search-path");
  var search = from.pathname === searchPath;
  if (!search && from.pathname !== path) return;

  // Forward only the source controls. The destination validates the values.
  var fields = search ? ["q", "type", "batch"] : ["topic", "level", "q", "sort", "view"];
  var params = new URLSearchParams();
  fields.forEach(function (name) {
    var values = from.searchParams.getAll(name);
    if (values.length === 1 && values[0].trim() && values[0].length <= (search ? 100 : 80)) {
      params.set(name, values[0]);
    }
  });
  var query = params.toString();
  if (!query) return;

  link.setAttribute("href", search ? searchPath + "?" + query : path + "?" + query + "#daily-challenge-title");
  link.textContent = search ? "Back to your search results" : "Back to your challenge list";
})();
