(function () {
  "use strict";

  var helpers = window.PuzzlepiaGames;
  var root = document.querySelector('[data-game="color-match"]');
  if (!root || !helpers) {
    return;
  }

  var size = 5;
  var targetColor = "pink";
  var targetLabel = "Pink";
  var startingColors = [
    ["pink", "pink", "mint", "gold", "gold"],
    ["purple", "pink", "mint", "mint", "gold"],
    ["purple", "purple", "gold", "mint", "mint"],
    ["pink", "gold", "gold", "purple", "purple"],
    ["pink", "pink", "mint", "purple", "purple"]
  ];
  var labels = {
    gold: "Gold",
    mint: "Mint",
    pink: "Pink",
    purple: "Purple"
  };
  var colors = [];
  var grid = helpers.qs(root, "[data-grid]");
  var reset = helpers.qs(root, "[data-reset]");
  if (!grid || !reset || !helpers.qs(root, "[data-status]") || !helpers.qs(root, "[data-complete]")) return;
  var completeActionsEl = helpers.qs(root, "[data-complete-actions]");
  var picker = helpers.qs(root, "[data-color-select]");
  var controls = helpers.qs(root, "[data-color-controls]");
  var heading = helpers.qs(root, "[data-color-title]");
  var instructions = helpers.qs(root, "[data-color-instructions]");
  var targetText = helpers.qs(root, "[data-color-target]");
  var swatch = helpers.qs(root, "[data-color-swatch]");
  var nextTarget = helpers.qs(root, "[data-color-next]");
  var targetLink = helpers.qs(root, "[data-target-link]");
  var linkRow = helpers.qs(root, "[data-target-link-row]");
  var unavailable = helpers.qs(root, "[data-unavailable]");
  var targets = ["pink", "mint", "gold", "purple"];
  var targetTotal = startingColors.reduce(function (total, row) {
    return total + row.filter(function (tile) { return tile === targetColor; }).length;
  }, 0);

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

  function cloneColors() {
    return startingColors.map(function (row) {
      return row.slice();
    });
  }

  function remainingTargetTiles() {
    return colors.reduce(function (total, row) {
      return total + row.filter(function (tile) { return tile === targetColor; }).length;
    }, 0);
  }

  function setProgress(tone) {
    var cleared = targetTotal - remainingTargetTiles();
    setFeedback(targetLabel + " tiles: " + cleared + " of " + targetTotal + " cleared.", tone);
  }

  function render() {
    helpers.qsa(grid, ".color-cell").forEach(function (cell) {
      var row = Number(cell.dataset.row);
      var col = Number(cell.dataset.col);
      var color = colors[row][col];
      cell.dataset.color = color || "";
      cell.classList.remove("is-invalid");
      cell.classList.toggle("is-empty", !color);
      cell.disabled = !color;
      cell.textContent = color ? labels[color] : "Done";
      cell.setAttribute("aria-label", (color ? labels[color] + " tile" : "Cleared tile") + ", row " + (row + 1) + ", column " + (col + 1));
    });
  }

  function completeIfReady() {
    if (remainingTargetTiles() === 0) {
      setFeedback("Puzzle complete! Great job.", "complete");
      helpers.showComplete(root);
      showCompletionActions(true);
    } else {
      setProgress("good");
    }
  }

  function tapTile(row, col) {
    var color = colors[row][col];
    var button = grid.querySelector('[data-row="' + row + '"][data-col="' + col + '"]');
    if (!color || remainingTargetTiles() === 0) {
      return;
    }
    if (color !== targetColor) {
      setFeedback("Look for " + targetColor + " tiles. Try another.", "warn");
      helpers.pulse(button, "is-invalid");
      return;
    }
    colors[row][col] = "";
    render();
    completeIfReady();
  }

  function resetGame(showResetFeedback) {
    colors = cloneColors();
    render();
    helpers.hideComplete(root);
    showCompletionActions(false);
    setFeedback((showResetFeedback ? "Puzzle reset. " : "") + targetLabel + " tiles: 0 of " + targetTotal + " cleared.", showResetFeedback ? "good" : "");
  }

  function changeTarget(color, focusBoard) {
    if (targets.indexOf(color) === -1) {
      picker.value = targetColor;
      return;
    }
    targetColor = color;
    targetLabel = labels[color];
    targetTotal = startingColors.reduce(function (total, row) {
      return total + row.filter(function (tile) { return tile === color; }).length;
    }, 0);
    picker.value = color;
    heading.textContent = "Find every " + color + " tile";
    instructions.textContent = "Tap all " + targetTotal + " " + color + " tiles, in any order. Tiles do not need to touch.";
    targetText.textContent = "Target: " + targetLabel + " (" + targetTotal + " tiles)";
    swatch.dataset.color = color;
    if (targetLink && linkRow) {
      targetLink.href = "/daily/color-match/?target=" + color;
      targetLink.textContent = "Open a fresh " + targetLabel + " round";
      linkRow.hidden = false;
    }
    resetGame(false);
    if (focusBoard) grid.querySelector(".color-cell").focus();
  }

  function buildGrid() {
    var row;
    var col;
    for (row = 0; row < size; row += 1) {
      for (col = 0; col < size; col += 1) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "color-cell";
        button.dataset.row = row;
        button.dataset.col = col;
        button.addEventListener("click", function (event) {
          tapTile(Number(event.currentTarget.dataset.row), Number(event.currentTarget.dataset.col));
        });
        grid.appendChild(button);
      }
    }
  }

  buildGrid();
  helpers.wireReset(root, resetGame);
  resetGame();
  if (picker && controls && heading && instructions && targetText && swatch) {
    picker.addEventListener("change", function () { changeTarget(picker.value, false); });
    if (nextTarget && completeActionsEl) {
      nextTarget.addEventListener("click", function () {
        if (remainingTargetTiles() === 0) changeTarget(targets[(targets.indexOf(targetColor) + 1) % targets.length], true);
      });
      nextTarget.hidden = false;
    }
    var initial = "pink";
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.getAll("target").length === 1 && targets.indexOf(params.get("target")) !== -1) initial = params.get("target");
    } catch (_) { /* Missing URL APIs keep the original pink target. */ }
    changeTarget(initial, false);
    controls.hidden = false;
    if (typeof window.addEventListener === "function") {
      window.addEventListener("pageshow", function () { picker.value = targetColor; });
    }
  }
  reset.disabled = false;
  if (unavailable) unavailable.hidden = true;
})();
