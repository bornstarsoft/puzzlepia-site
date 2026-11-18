(function () {
  "use strict";

  var groups = document.querySelectorAll("[data-discovery]");

  groups.forEach(function (group) {
    var items = Array.prototype.slice.call(
      group.querySelectorAll("[data-discovery-item]")
    );
    var buttons = Array.prototype.slice.call(
      group.querySelectorAll("[data-filter-value]")
    );
    var search = group.querySelector("[data-filter-search]");
    var searchWrap = group.querySelector("[data-filter-search-wrap]");
    var count = group.querySelector("[data-filter-count]");
    var empty = group.querySelector("[data-filter-empty]");
    var more = group.querySelector("[data-filter-more]");
    var limit = Number.parseInt(group.getAttribute("data-limit"), 10) || items.length;
    var unit = group.getAttribute("data-unit") || "items";
    var singularUnit = group.getAttribute("data-unit-singular") || unit;
    var activeTopic = "all";
    var query = "";
    var expanded = false;
    var linked = group.hasAttribute("data-discovery-url") &&
      typeof window.URLSearchParams === "function";
    var collectionLink = group.querySelector("[data-filter-link]");
    var linkWrap = group.querySelector("[data-filter-link-wrap]");

    if (!items.length) {
      return;
    }

    function readLocation() {
      activeTopic = "all";
      query = "";
      expanded = false;
      try {
        var params = new window.URLSearchParams(window.location.search);
        var topic = params.get("topic");
        if (params.getAll("topic").length === 1 && buttons.some(function (button) {
          return button.getAttribute("data-filter-value") === topic;
        })) activeTopic = topic;
        expanded = params.getAll("view").length === 1 && params.get("view") === "all";
        var savedQuery = params.get("q");
        if (search && params.getAll("q").length === 1 && savedQuery.length <= 80) {
          query = savedQuery.trim();
        }
      } catch (_) { /* Keep the complete default collection available. */ }
      if (search) search.value = query;
    }

    function collectionURL() {
      var params = new window.URLSearchParams();
      if (activeTopic !== "all") params.set("topic", activeTopic);
      if (query) params.set("q", query);
      if (expanded) params.set("view", "all");
      var queryString = params.toString();
      return window.location.pathname + (queryString ? "?" + queryString : "");
    }

    function updateLocation(replace) {
      if (!linked) return;
      var url = collectionURL() + window.location.hash;
      if (url === window.location.pathname + window.location.search + window.location.hash) return;
      try {
        var method = replace ? "replaceState" : "pushState";
        window.history[method](window.history.state, "", url);
      } catch (_) { /* Filtering and the ordinary collection link still work. */ }
    }

    function render() {
      var needle = query.toLowerCase();
      var matched = items.filter(function (item) {
        var topicMatches =
          activeTopic === "all" || item.getAttribute("data-topic") === activeTopic;
        var searchText = item.getAttribute("data-search-text") || "";
        return topicMatches && (!needle || searchText.indexOf(needle) !== -1);
      });

      items.forEach(function (item) {
        item.hidden = true;
      });

      matched.forEach(function (item, index) {
        item.hidden = !expanded && index >= limit;
      });

      buttons.forEach(function (button) {
        button.setAttribute(
          "aria-pressed",
          String(button.getAttribute("data-filter-value") === activeTopic)
        );
      });

      if (count) {
        count.textContent = matched.length + " " + (matched.length === 1 ? singularUnit : unit);
      }

      if (empty) {
        empty.hidden = matched.length !== 0;
      }

      if (more) {
        more.hidden = expanded || matched.length <= limit;
      }

      if (linked && collectionLink) {
        collectionLink.setAttribute("href", collectionURL() + "#daily-challenge-title");
        if (linkWrap) linkWrap.hidden = false;
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeTopic = button.getAttribute("data-filter-value") || "all";
        expanded = false;
        render();
        updateLocation();
      });
    });

    if (search) {
      search.addEventListener("input", function () {
        query = search.value.trim();
        expanded = false;
        render();
        updateLocation(true);
      });
      if (searchWrap) searchWrap.hidden = false;
    }

    if (more) {
      more.addEventListener("click", function () {
        expanded = true;
        render();
        updateLocation();
      });
    }

    if (linked) {
      function restoreLocation() {
        readLocation();
        render();
      }
      window.addEventListener("popstate", restoreLocation);
      window.addEventListener("pageshow", restoreLocation);
      readLocation();
    }
    render();
  });
})();
