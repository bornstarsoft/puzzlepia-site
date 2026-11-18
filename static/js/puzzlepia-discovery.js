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
    var level = group.querySelector("[data-filter-level]");
    var levelWrap = group.querySelector("[data-filter-level-wrap]");
    var sort = group.querySelector("[data-filter-sort]");
    var sortWrap = group.querySelector("[data-filter-sort-wrap]");
    var list = group.querySelector("[data-filter-list]");
    var count = group.querySelector("[data-filter-count]");
    var empty = group.querySelector("[data-filter-empty]");
    var more = group.querySelector("[data-filter-more]");
    var clear = group.querySelector("[data-filter-clear]");
    var limit = Number.parseInt(group.getAttribute("data-limit"), 10) || items.length;
    var unit = group.getAttribute("data-unit") || "items";
    var singularUnit = group.getAttribute("data-unit-singular") || unit;
    var activeTopic = "all";
    var activeLevel = "all";
    var query = "";
    var expanded = false;
    var linked = group.hasAttribute("data-discovery-url") &&
      typeof window.URLSearchParams === "function";
    var collectionLink = group.querySelector("[data-filter-link]");
    var linkWrap = group.querySelector("[data-filter-link-wrap]");

    if (!items.length) {
      return;
    }

    var canSort = sort && list;
    var dateOrders = canSort ? { newest: byDate("data-published"), updated: byDate("data-updated") } : {};
    var order = items;
    var sortMode = "suggested";

    function byDate(attribute) {
      return items.slice().sort(function (a, b) {
        return Number(b.getAttribute(attribute)) - Number(a.getAttribute(attribute));
      });
    }

    function validSort(mode) {
      return Object.prototype.hasOwnProperty.call(dateOrders, mode) ? mode : "suggested";
    }

    function knownLevel(value) {
      return level && Array.prototype.some.call(level.options, function (option) {
        return option.value === value;
      });
    }

    function readLocation() {
      activeTopic = "all";
      activeLevel = "all";
      query = "";
      expanded = false;
      sortMode = "suggested";
      try {
        var params = new window.URLSearchParams(window.location.search);
        var topic = params.get("topic");
        if (params.getAll("topic").length === 1 && buttons.some(function (button) {
          return button.getAttribute("data-filter-value") === topic;
        })) activeTopic = topic;
        var selectedLevel = params.get("level");
        if (params.getAll("level").length === 1 && knownLevel(selectedLevel)) {
          activeLevel = selectedLevel;
        }
        expanded = params.getAll("view").length === 1 && params.get("view") === "all";
        if (params.getAll("sort").length === 1) {
          sortMode = validSort(params.get("sort"));
        }
        var savedQuery = params.get("q");
        if (search && params.getAll("q").length === 1 && savedQuery.length <= 80) {
          query = savedQuery.trim();
        }
      } catch (_) { /* Keep the complete default collection available. */ }
      if (search) search.value = query;
      if (level) level.value = activeLevel;
      if (canSort) sort.value = sortMode;
    }

    function collectionURL() {
      var params = new window.URLSearchParams();
      if (activeTopic !== "all") params.set("topic", activeTopic);
      if (activeLevel !== "all") params.set("level", activeLevel);
      if (query) params.set("q", query);
      if (sortMode !== "suggested") params.set("sort", sortMode);
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
      var nextOrder = dateOrders[sortMode] || items;
      if (order !== nextOrder) {
        nextOrder.forEach(function (item) { list.appendChild(item); });
        order = nextOrder;
      }
      var matched = order.filter(function (item) {
        var topicMatches =
          activeTopic === "all" || item.getAttribute("data-topic") === activeTopic;
        var levelMatches = activeLevel === "all" || item.getAttribute("data-level") === activeLevel;
        var searchText = item.getAttribute("data-search-text") || "";
        return topicMatches && levelMatches && (!needle || searchText.indexOf(needle) !== -1);
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

      if (clear) {
        clear.hidden = activeTopic === "all" && activeLevel === "all" && !query;
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

    if (clear) {
      clear.addEventListener("click", function () {
        activeTopic = "all";
        activeLevel = "all";
        query = "";
        expanded = false;
        if (search) search.value = "";
        if (level) level.value = "all";
        render();
        updateLocation();
        var all = buttons.find(function (button) {
          return button.getAttribute("data-filter-value") === "all";
        });
        if (all) all.focus();
      });
    }

    if (level) {
      level.addEventListener("change", function () {
        activeLevel = knownLevel(level.value) ? level.value : "all";
        expanded = false;
        render();
        updateLocation();
      });
      if (levelWrap) levelWrap.hidden = false;
    }

    if (canSort) {
      sort.addEventListener("change", function () {
        sortMode = validSort(sort.value);
        render();
        updateLocation();
      });
      if (sortWrap) sortWrap.hidden = false;
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
