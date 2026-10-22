(function () {
  "use strict";

  var root = document.querySelector("[data-site-search]");
  var indexElement = document.querySelector("#puzzlepia-search-index");

  if (!root || !indexElement) {
    return;
  }

  var form = root.querySelector("[data-search-form]");
  var input = root.querySelector("[data-search-input]");
  var clear = root.querySelector("[data-search-clear]");
  var status = root.querySelector("[data-search-status]");
  var results = root.querySelector("[data-search-results]");
  var empty = root.querySelector("[data-search-empty]");
  var allTypes = root.querySelector("[data-search-all]");
  var more = root.querySelector("[data-search-more]");
  var moreWrap = root.querySelector("[data-search-more-wrap]");
  var start = document.querySelector("[data-search-start]");
  var savedLink = root.querySelector("[data-search-link]");
  var savedLinkWrap = root.querySelector("[data-search-link-wrap]");
  var categoryButtons = Array.prototype.slice.call(
    root.querySelectorAll("[data-search-category]")
  );
  var activeCategory = "all";
  var resultLimit = 24;
  var matches = [];
  var shown = 0;
  var batches = 1;
  var allowedCategories = ["all", "playable", "games", "guides", "challenges"];
  var linked = typeof window.URLSearchParams === "function";

  if (!form || !input || !clear || !status || !results || !empty ||
      !start || !allTypes || !more || !moreWrap) {
    return;
  }

  var entries;
  try {
    entries = JSON.parse(indexElement.textContent);
    if (!Array.isArray(entries) || !entries.every(function (entry) {
      return entry && typeof entry.title === "string" &&
        typeof entry.url === "string" &&
        /^\/(daily|games|blog)\/[a-z0-9/-]+\/$/.test(entry.url);
    })) {
      throw new Error("Invalid search index");
    }
  } catch (error) {
    status.textContent = "Search is unavailable right now. Browse a collection below.";
    return;
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[-_\u2010-\u2015]+/g, " ")
      .replace(/\bk\s+pop\b/g, "kpop")
      .replace(/\s+/g, " ")
      .trim();
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
    if (!linked) return;

    var parameters = new window.URLSearchParams();
    if (query) {
      parameters.set("q", query);
    }
    if (activeCategory !== "all") {
      parameters.set("type", activeCategory);
    }
    if (batches > 1) parameters.set("batch", String(batches));

    var suffix = parameters.toString();
    var nextURL = window.location.pathname + (suffix ? "?" + suffix : "");
    if (savedLink && savedLinkWrap) {
      savedLink.href = nextURL;
      savedLinkWrap.hidden = matches.length === 0;
    }
    if (!window.history || !window.history.replaceState) return;
    if (nextURL === window.location.pathname + window.location.search) {
      return;
    }
    try {
      window.history.replaceState(window.history.state, "", nextURL);
    } catch (error) {
      // Search remains usable if the browser restricts history updates.
    }
  }

  function appendResults(count) {
    var next = matches.slice(shown, shown + (count || resultLimit));
    var fragment = document.createDocumentFragment();
    next.forEach(function (match) {
      fragment.appendChild(createResult(match.entry));
    });
    results.appendChild(fragment);
    shown += next.length;
    batches = Math.max(1, Math.ceil(shown / resultLimit));
    moreWrap.hidden = shown >= matches.length;
    status.textContent = shown < matches.length
      ? "Showing " + shown + " of " + matches.length + " results."
      : matches.length + (matches.length === 1 ? " result." : " results.");
  }

  function render() {
    var rawQuery = input.value.slice(0, 100).trim();
    var query = normalize(rawQuery);
    var tokens = query.split(" ").filter(Boolean);

    results.replaceChildren();
    shown = 0;
    matches = [];
    moreWrap.hidden = true;
    clear.hidden = input.value.length === 0;
    start.hidden = false;
    empty.hidden = true;
    allTypes.hidden = activeCategory === "all";

    categoryButtons.forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-search-category") === activeCategory)
      );
    });

    if ((query.length < 2 && query.length > 0) ||
        (!query && (activeCategory === "all" || rawQuery))) {
      status.textContent =
        query.length === 1
          ? "Enter one more character to search."
          : "Search by name or choose a puzzle type.";
      batches = 1;
      updateURL(rawQuery);
      return;
    }

    matches = entries
      .filter(function (entry) {
        return activeCategory === "all" || entry.category === activeCategory;
      })
      .map(function (entry) {
        return { entry: entry, score: query ? resultScore(entry, query, tokens) : 0 };
      })
      .filter(function (result) {
        return result.score >= 0;
      })
      .sort(function (a, b) {
        return b.score - a.score || a.entry.title.localeCompare(b.entry.title);
      });

    appendResults(batches * resultLimit);
    updateURL(rawQuery);
    empty.hidden = matches.length !== 0;
    start.hidden = matches.length !== 0;
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
  }

  input.addEventListener("input", function () {
    batches = 1;
    render();
  });

  more.addEventListener("click", function () {
    var previousCount = shown;
    appendResults();
    updateURL(input.value.slice(0, 100).trim());
    var firstNewResult = results.children[previousCount];
    if (firstNewResult) {
      firstNewResult.querySelector("h2 a").focus();
    }
  });

  allTypes.addEventListener("click", function () {
    activeCategory = "all";
    batches = 1;
    render();
    input.focus();
  });

  clear.addEventListener("click", function () {
    input.value = "";
    activeCategory = "all";
    batches = 1;
    input.focus();
    render();
  });

  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var category = button.getAttribute("data-search-category");
      activeCategory = allowedCategories.indexOf(category) !== -1 ? category : "all";
      batches = 1;
      render();
    });
  });

  function restoreURL() {
    activeCategory = "all";
    batches = 1;
    input.value = "";
    if (linked) {
      var parameters = new window.URLSearchParams(window.location.search);
      var category = parameters.getAll("type").length === 1 ? parameters.get("type") : "all";
      activeCategory = allowedCategories.indexOf(category) !== -1 ? category : "all";
      if (parameters.getAll("q").length === 1) input.value = parameters.get("q").slice(0, 100);
      var batch = parameters.get("batch") || "";
      // Bound URL-controlled rendering to the actual local index size.
      if (parameters.getAll("batch").length === 1 && /^[1-9][0-9]{0,5}$/.test(batch)) {
        batches = Math.min(Number(batch), Math.max(1, Math.ceil(entries.length / resultLimit)));
      }
    }
    render();
  }

  form.hidden = false;
  if (linked) {
    window.addEventListener("pageshow", restoreURL);
    window.addEventListener("popstate", restoreURL);
  }
  restoreURL();
})();
