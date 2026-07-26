(function () {
  "use strict";

  var storageKey = "puzzlepiaRecentPuzzleV1";
  var entry = document.querySelector("[data-puzzle-entry]");
  var panels = Array.prototype.slice.call(
    document.querySelectorAll("[data-recent-puzzle]")
  );

  function readRecent() {
    try {
      var value = window.localStorage.getItem(storageKey);
      var recent = value ? JSON.parse(value) : null;

      if (
        !recent ||
        typeof recent.title !== "string" ||
        typeof recent.url !== "string" ||
        recent.url.indexOf("/daily/") !== 0
      ) {
        return null;
      }

      return {
        title: recent.title.slice(0, 80),
        description:
          typeof recent.description === "string"
            ? recent.description.slice(0, 180)
            : "Return to your latest Puzzlepia pick.",
        icon:
          typeof recent.icon === "string" ? recent.icon.slice(0, 2) : "P",
        url: recent.url,
      };
    } catch (error) {
      return null;
    }
  }

  function saveEntry() {
    if (!entry) {
      return;
    }

    var recent = {
      title: entry.getAttribute("data-puzzle-title") || "Daily Puzzle",
      description:
        entry.getAttribute("data-puzzle-description") ||
        "Return to your latest Puzzlepia pick.",
      icon: entry.getAttribute("data-puzzle-icon") || "P",
      url: entry.getAttribute("data-puzzle-url") || "/daily/",
    };

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
    var clear = panel.querySelector("[data-recent-clear]");

    if (title) {
      title.textContent = recent.title;
    }
    if (description) {
      description.textContent = recent.description;
    }
    if (icon) {
      icon.textContent = recent.icon;
    }
    if (link) {
      link.href = recent.url;
      link.setAttribute("aria-label", "Play " + recent.title + " again");
    }
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
      });
    }

    panel.hidden = false;
  }

  saveEntry();

  var recent = readRecent();
  if (!recent) {
    return;
  }

  panels.forEach(function (panel) {
    renderPanel(panel, recent);
  });
})();
