(function () {
  "use strict";

  var storageKey = "puzzlepiaRecentPuzzleV1";
  var entry = document.querySelector("[data-puzzle-entry]");
  var panels = Array.prototype.slice.call(
    document.querySelectorAll("[data-recent-puzzle]")
  );
  var indexElement = document.querySelector("#puzzlepia-recent-index");
  var entries;

  panels.forEach(function (panel) { panel.hidden = true; });
  try {
    entries = JSON.parse(indexElement ? indexElement.textContent : "null");
    if (!Array.isArray(entries) || !entries.every(function (item) {
      return item && typeof item.url === "string" &&
        /^\/daily\/[a-z0-9-]+\/$/.test(item.url) &&
        typeof item.title === "string" && typeof item.description === "string" &&
        typeof item.icon === "string";
    })) return;
  } catch (_) {
    return;
  }

  function findEntry(url) {
    return entries.find(function (item) { return item.url === url; }) || null;
  }

  function readRecent() {
    try {
      var value = window.localStorage.getItem(storageKey);
      var recent = value ? JSON.parse(value) : null;

      // Resolve stored URLs against current published pages, not stored copy.
      return recent && typeof recent.url === "string" ? findEntry(recent.url) : null;
    } catch (error) {
      return null;
    }
  }

  function saveEntry() {
    if (!entry) {
      return;
    }

    var recent = findEntry(entry.getAttribute("data-puzzle-url"));
    if (!recent) return;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(recent));
    } catch (error) {
      // The puzzle remains fully playable when browser storage is unavailable.
    }
  }

  function renderPanel(panel, recent) {
    var title = panel.querySelector("[data-recent-title]");
    var description = panel.querySelector("[data-recent-description]");
    var icon = panel.querySelector("[data-recent-icon]");
    var link = panel.querySelector("[data-recent-link]");
    if (!title || !link) return;

    title.textContent = recent.title;
    if (description) {
      description.textContent = recent.description;
    }
    if (icon) {
      icon.textContent = recent.icon;
    }
    link.href = recent.url;
    link.setAttribute("aria-label", "Play " + recent.title + " again");
    panel.hidden = false;
  }

  function refresh() {
    var recent = readRecent();
    panels.forEach(function (panel) {
      panel.hidden = true;
      if (recent) renderPanel(panel, recent);
    });
  }

  panels.forEach(function (panel) {
    var clear = panel.querySelector("[data-recent-clear]");
    if (clear) {
      clear.addEventListener("click", function () {
        try {
          window.localStorage.removeItem(storageKey);
        } catch (error) {
          // Hiding the panel still works when storage access is unavailable.
        }

        panels.forEach(function (item) {
          item.hidden = true;
        });
        var dailyLink = document.querySelector('a[href="/daily/"]');
        if (dailyLink) dailyLink.focus();
      });
    }
  });

  saveEntry();
  refresh();
  // Refresh only: a restored page must not overwrite another tab's newer pick.
  window.addEventListener("pageshow", refresh);
  window.addEventListener("storage", function (event) {
    if (event.key === storageKey || event.key === null) refresh();
  });
})();
