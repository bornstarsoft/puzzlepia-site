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

  function setProgress() {
    helpers.setStatus(root, "Target color: " + targetLabel + ". " + remainingTargetTiles() + " left.");
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

  function completeIfReady() {
    if (remainingTargetTiles() === 0) {
      helpers.setStatus(root, "All pink tiles cleared.");
      helpers.showComplete(root);
    } else {
      setProgress();
    }
  }

  function tapTile(row, col) {
    var color = colors[row][col];
    var button = grid.querySelector('[data-row="' + row + '"][data-col="' + col + '"]');
    if (!color) {
      return;
    }
    if (color !== targetColor) {
      helpers.setStatus(root, "Look for " + targetLabel + " tiles first.");
      helpers.pulse(button, "is-invalid");
      return;
    }
    colors[row][col] = "";
    render();
    completeIfReady();
  }

  function resetGame() {
    colors = cloneColors();
    render();
    helpers.hideComplete(root);
    setProgress();
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
})();
