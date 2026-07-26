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
    var count = group.querySelector("[data-filter-count]");
    var empty = group.querySelector("[data-filter-empty]");
    var more = group.querySelector("[data-filter-more]");
    var limit = Number.parseInt(group.getAttribute("data-limit"), 10) || items.length;
    var unit = group.getAttribute("data-unit") || "items";
    var activeTopic = "all";
    var query = "";
    var expanded = false;

    if (!items.length) {
      return;
    }

    function render() {
      var matched = items.filter(function (item) {
        var topicMatches =
          activeTopic === "all" || item.getAttribute("data-topic") === activeTopic;
        var searchText = item.getAttribute("data-search-text") || "";
        return topicMatches && (!query || searchText.indexOf(query) !== -1);
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
        count.textContent = matched.length + " " + unit;
      }

      if (empty) {
        empty.hidden = matched.length !== 0;
      }

      if (more) {
        more.hidden = expanded || matched.length <= limit;
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeTopic = button.getAttribute("data-filter-value") || "all";
        expanded = false;
        render();
      });
    });

    if (search) {
      search.addEventListener("input", function () {
        query = search.value.trim().toLowerCase();
        expanded = false;
        render();
      });
    }

    if (more) {
      more.addEventListener("click", function () {
        expanded = true;
        render();
      });
    }

    render();
  });
})();
