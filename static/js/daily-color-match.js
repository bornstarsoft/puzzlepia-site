(function () {
  "use strict";

  var helpers = window.PuzzlepiaGames;
  var root = document.querySelector('[data-game="color-match"]');
  if (!root || !helpers) {
    return;
  }

  var size = 5;
  var startingColors = [
    ["pink", "pink", "mint", "gold", "gold"],
    ["purple", "pink", "mint", "mint", "gold"],
    ["purple", "purple", "gold", "mint", "mint"],
    ["pink", "gold", "gold", "purple", "purple"],
    ["pink", "pink", "mint", "purple", "purple"]
  ];
  var targets = ["pink", "mint", "gold", "purple"];
  var labels = {
    gold: "Gold",
    mint: "Mint",
    pink: "Pink",
    purple: "Purple"
  };
  var colors = [];
  var targetIndex = 0;
  var grid = helpers.qs(root, "[data-grid]");

  function cloneColors() {
    return startingColors.map(function (row) {
      return row.slice();
    });
  }

  function currentTarget() {
    return targets[targetIndex];
  }

  function remainingFor(color) {
    return colors.reduce(function (total, row) {
      return total + row.filter(function (tile) { return tile === color; }).length;
    }, 0);
  }

  function setProgress() {
    var target = currentTarget();
    if (!target) {
      helpers.setStatus(root, "All colors cleared.");
      return;
    }
    helpers.setStatus(root, "Target color: " + labels[target] + ". " + remainingFor(target) + " left.");
  }

  function render() {
    helpers.qsa(grid, ".color-cell").forEach(function (cell) {
      var row = Number(cell.dataset.row);
      var col = Number(cell.dataset.col);
      var color = colors[row][col];
      cell.dataset.color = color || "";
      cell.classList.toggle("is-empty", !color);
      cell.disabled = !color;
      cell.setAttribute("aria-label", color ? labels[color] + " tile" : "cleared tile");
    });
  }

  function advanceTarget() {
    while (currentTarget() && remainingFor(currentTarget()) === 0) {
      targetIndex += 1;
    }
    if (!currentTarget()) {
      helpers.setStatus(root, "All colors cleared.");
      helpers.showComplete(root);
      return;
    }
    setProgress();
  }

  function tapTile(row, col) {
    var color = colors[row][col];
    var target = currentTarget();
    var button = grid.querySelector('[data-row="' + row + '"][data-col="' + col + '"]');
    if (!color || !target) {
      return;
    }
    if (color !== target) {
      helpers.setStatus(root, "Look for " + labels[target] + " tiles first.");
      helpers.pulse(button, "is-invalid");
      return;
    }
    colors[row][col] = "";
    render();
    advanceTarget();
  }

  function resetGame() {
    colors = cloneColors();
    targetIndex = 0;
    render();
    helpers.hideComplete(root);
    setProgress();
  }

  for (var row = 0; row < size; row += 1) {
    for (var col = 0; col < size; col += 1) {
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
  resetGame();
  helpers.wireReset(root, resetGame);
})();
