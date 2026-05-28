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

  function completeIfReady() {
    if (next > 16) {
      helpers.setStatus(root, "Complete.");
      helpers.showComplete(root);
    }
  }

  function tapNumber(button, number) {
    if (number !== next) {
      helpers.setStatus(root, "Look for " + next + " first.");
      helpers.pulse(button, "is-wrong");
      return;
    }
    button.classList.add("is-done");
    button.disabled = true;
    next += 1;
    if (next <= 16) {
      helpers.setStatus(root, "Next number: " + next);
    }
    completeIfReady();
  }

  function resetGame() {
    next = 1;
    helpers.qsa(grid, ".number-cell").forEach(function (button) {
      button.disabled = false;
      button.classList.remove("is-done", "is-wrong");
    });
    helpers.hideComplete(root);
    helpers.setStatus(root, "Next number: 1");
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
