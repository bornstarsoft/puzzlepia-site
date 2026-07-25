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

  numbers.forEach(function (number) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "number-cell";
    button.textContent = number;
    button.dataset.number = number;
    button.setAttribute("aria-label", "Number " + number);
    button.addEventListener("click", function () {
      tapNumber(button, number);
    });
    grid.appendChild(button);
  });
  helpers.wireReset(root, resetGame);
  resetGame();
})();
