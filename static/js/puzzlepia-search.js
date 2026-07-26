(function () {
  "use strict";

  var root = document.querySelector("[data-site-search]");
  var indexElement = document.querySelector("#puzzlepia-search-index");

  if (!root || !indexElement) {
    return;
  }

  var entries;
  try {
    entries = JSON.parse(indexElement.textContent);
  } catch (error) {
    return;
  }

  var form = root.querySelector("[data-search-form]");
  var input = root.querySelector("[data-search-input]");
  var clear = root.querySelector("[data-search-clear]");
  var status = root.querySelector("[data-search-status]");
  var results = root.querySelector("[data-search-results]");
  var empty = root.querySelector("[data-search-empty]");
  var start = document.querySelector("[data-search-start]");
  var categoryButtons = Array.prototype.slice.call(
    root.querySelectorAll("[data-search-category]")
  );
  var activeCategory = "all";
  var resultLimit = 24;

  if (!Array.isArray(entries) || !input || !results) {
    return;
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function resultScore(entry, query, tokens) {
    var title = normalize(entry.title);
    var description = normalize(entry.description);
    var keywords = normalize(entry.keywords);
    var haystack = title + " " + description + " " + keywords;

    if (
      !tokens.every(function (token) {
        return haystack.indexOf(token) !== -1;
      })
    ) {
      return -1;
    }

    var score = 0;
    if (title === query) {
      score += 120;
    } else if (title.indexOf(query) === 0) {
      score += 80;
    } else if (title.indexOf(query) !== -1) {
      score += 55;
    }

    tokens.forEach(function (token) {
      if (title.indexOf(token) !== -1) {
        score += 20;
      }
      if (keywords.indexOf(token) !== -1) {
        score += 8;
      }
      if (description.indexOf(token) !== -1) {
        score += 3;
      }
    });

    if (entry.category === "playable") {
      score += 35;
    } else if (entry.category === "games") {
      score += 20;
    }

    return score;
  }

  function createResult(entry) {
    var article = document.createElement("article");
    var meta = document.createElement("p");
    var heading = document.createElement("h2");
    var titleLink = document.createElement("a");
    var description = document.createElement("p");
    var action = document.createElement("a");

    article.className = "search-result";
    meta.className = "search-result__meta";
    meta.textContent = entry.typeLabel + " · " + entry.topic;
    titleLink.href = entry.url;
    titleLink.textContent = entry.title;
    heading.appendChild(titleLink);
    description.textContent = entry.description;
    action.className = "search-result__link";
    action.href = entry.url;
    action.textContent = entry.actionLabel;

    article.appendChild(meta);
    article.appendChild(heading);
    article.appendChild(description);
    article.appendChild(action);
    return article;
  }

  function updateURL(query) {
    if (!window.history || !window.history.replaceState) {
      return;
    }

    var parameters = new URLSearchParams();
    if (query) {
      parameters.set("q", query);
    }
    if (activeCategory !== "all") {
      parameters.set("type", activeCategory);
    }

    var suffix = parameters.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (suffix ? "?" + suffix : "")
    );
  }

  function render() {
    var query = normalize(input.value);
    var tokens = query.split(" ").filter(Boolean);

    results.replaceChildren();
    clear.hidden = query.length === 0;
    start.hidden = query.length >= 2;

    categoryButtons.forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-search-category") === activeCategory)
      );
    });

    updateURL(query);

    if (query.length < 2) {
      status.textContent =
        query.length === 1
          ? "Enter one more character to search."
          : "Enter at least two characters to search.";
      empty.hidden = true;
      return;
    }

    var matches = entries
      .filter(function (entry) {
        return activeCategory === "all" || entry.category === activeCategory;
      })
      .map(function (entry) {
        return { entry: entry, score: resultScore(entry, query, tokens) };
      })
      .filter(function (result) {
        return result.score >= 0;
      })
      .sort(function (a, b) {
        return b.score - a.score || a.entry.title.localeCompare(b.entry.title);
      });

    matches.slice(0, resultLimit).forEach(function (match) {
      results.appendChild(createResult(match.entry));
    });

    status.textContent =
      matches.length +
      (matches.length === 1 ? " result" : " results") +
      (matches.length > resultLimit
        ? ". Showing the first " + resultLimit + "."
        : ".");
    empty.hidden = matches.length !== 0;
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });
  }

  input.addEventListener("input", render);

  clear.addEventListener("click", function () {
    input.value = "";
    input.focus();
    render();
  });

  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeCategory = button.getAttribute("data-search-category") || "all";
      render();
    });
  });

  var initialParameters = new URLSearchParams(window.location.search);
  var initialQuery = initialParameters.get("q") || "";
  var initialCategory = initialParameters.get("type") || "all";
  var allowedCategories = ["all", "playable", "games", "guides", "challenges"];

  input.value = initialQuery.slice(0, 100);
  if (allowedCategories.indexOf(initialCategory) !== -1) {
    activeCategory = initialCategory;
  }

  render();
})();
