(function () {
  "use strict";

  var helpers = window.PuzzlepiaGames;
  var root = document.querySelector('[data-game="number-puzzle"]');
  if (!root || !helpers) {
    return;
  }

  var numbers = [7, 1, 12, 4, 10, 3, 15, 8, 2, 14, 5, 11, 16, 6, 13, 9];
  var next = 1;
  var grid = helpers.qs(root, "[data-grid]");
  var completeActionsEl = helpers.qs(root, "[data-complete-actions]");
  var reset = helpers.qs(root, "[data-reset]");
  if (!grid || !reset || !helpers.qs(root, "[data-status]") || !helpers.qs(root, "[data-complete]")) return;

  var model = window.PuzzlepiaOrderLayouts;
  var layouts = null;
  var layoutIndex = 0;
  var picker = helpers.qs(root, "[data-order-select]");
  var today = helpers.qs(root, "[data-order-today]");
  var nextLayout = helpers.qs(root, "[data-order-next]");
  var controls = helpers.qs(root, "[data-order-controls]");
  var note = helpers.qs(root, "[data-order-note]");
  var data = helpers.qs(root, "[data-order-layouts]");
  var link = helpers.qs(root, "[data-layout-link]");
  var linkRow = helpers.qs(root, "[data-layout-link-row]");
  var unavailable = helpers.qs(root, "[data-unavailable]");
  if (model && picker && today && nextLayout && controls && note && data && completeActionsEl) {
    try {
      var parsed = JSON.parse(data.textContent);
      if (model.valid(parsed)) layouts = parsed;
    } catch (_) { /* The original board remains playable without optional data. */ }
  }

  function setFeedback(message, tone) {
    var status = helpers.qs(root, "[data-status]");
    helpers.setStatus(root, message);
    if (status) {
      status.classList.remove("is-good", "is-warn", "is-complete");
      if (tone) {
        status.classList.add("is-" + tone);
      }
    }
  }

  function showCompletionActions(show) {
    if (completeActionsEl) {
      completeActionsEl.hidden = !show;
    }
  }

  function setProgress(tone) {
    setFeedback("Next number: " + next + ". " + (next - 1) + " of " + numbers.length + " done.", tone);
  }

  function completeIfReady() {
    if (next > numbers.length) {
      setFeedback("Puzzle complete! Great job.", "complete");
      helpers.showComplete(root);
      showCompletionActions(true);
    }
  }

  function tapNumber(button, number) {
    if (button.disabled) return;
    if (number !== next) {
      setFeedback("Look for " + next + " first.", "warn");
      helpers.pulse(button, "is-wrong");
      return;
    }
    button.classList.add("is-done");
    button.disabled = true;
    button.setAttribute("aria-label", "Number " + number + ", completed");
    next += 1;
    if (next <= numbers.length) {
      setProgress("good");
    }
    completeIfReady();
  }

  function resetGame(showResetFeedback) {
    next = 1;
    helpers.qsa(grid, ".number-cell").forEach(function (button) {
      button.disabled = false;
      button.classList.remove("is-done", "is-wrong");
      button.setAttribute("aria-label", "Number " + button.dataset.number);
    });
    helpers.hideComplete(root);
    showCompletionActions(false);
    setFeedback(showResetFeedback ? "Puzzle reset. Start with 1." : "Next number: 1. 0 of " + numbers.length + " done.", showResetFeedback ? "good" : "");
  }

  var buttons = numbers.map(function (number) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "number-cell";
    button.textContent = number;
    button.dataset.number = number;
    button.setAttribute("aria-label", "Number " + number);
    button.addEventListener("click", function () {
      tapNumber(button, Number(button.dataset.number));
    });
    grid.appendChild(button);
    return button;
  });

  function loadLayout(index, focusBoard) {
    if (!layouts || !Number.isInteger(index) || index < 0 || index >= layouts.length) return;
    layoutIndex = index;
    numbers = layouts[index].slice();
    picker.value = String(index);
    buttons.forEach(function (button, position) {
      button.dataset.number = numbers[position];
      button.textContent = numbers[position];
    });
    note.textContent = "Layout " + (index + 1) + ". Seven fixed layouts repeat weekly; today's pick changes at 00:00 UTC. Changing layouts starts a fresh board.";
    if (link && linkRow) {
      link.href = "/daily/number-puzzle/?layout=" + (index + 1);
      link.textContent = "Open a fresh Layout " + (index + 1);
      linkRow.hidden = false;
    }
    resetGame(false);
    if (focusBoard) buttons[0].focus();
  }

  helpers.wireReset(root, resetGame);
  resetGame();
  if (layouts) {
    picker.addEventListener("change", function () { loadLayout(Number(picker.value), false); });
    today.addEventListener("click", function () { loadLayout(model.today(), true); });
    nextLayout.addEventListener("click", function () {
      if (next > numbers.length) loadLayout((layoutIndex + 1) % layouts.length, true);
    });
    var initialLayout = model.today();
    try {
      var params = new URLSearchParams(window.location.search);
      var requested = params.get("layout");
      if (params.getAll("layout").length === 1 && /^[1-7]$/.test(requested)) {
        initialLayout = Number(requested) - 1;
      }
    } catch (_) { /* Missing URL APIs keep the daily pick. */ }
    loadLayout(initialLayout, false);
    if (typeof window.addEventListener === "function") {
      window.addEventListener("pageshow", function () { picker.value = String(layoutIndex); });
    }
    controls.hidden = false;
    nextLayout.hidden = false;
  } else if (note) {
    note.textContent = "Starter layout. Other layouts are unavailable, but you can still play this board.";
  }
  reset.disabled = false;
  if (unavailable) unavailable.hidden = true;
})();
