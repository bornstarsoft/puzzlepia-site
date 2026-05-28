(function () {
  "use strict";

  var helpers = window.PuzzlepiaGames;
  var root = document.querySelector('[data-game="color-match"]');
  if (!root || !helpers) {
    return;
  }

  var size = 5;
  var colors = [
    ["pink", "pink", "mint", "gold", "gold"],
    ["purple", "pink", "mint", "mint", "gold"],
    ["purple", "purple", "gold", "mint", "mint"],
    ["pink", "gold", "gold", "purple", "purple"],
    ["pink", "pink", "mint", "purple", "purple"]
  ];
  var grid = helpers.qs(root, "[data-grid]");

  function neighbors(row, col) {
    return [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]].filter(function (point) {
      return point[0] >= 0 && point[1] >= 0 && point[0] < size && point[1] < size;
    });
  }

  function group(row, col, color, seen) {
    var key = row + "," + col;
    if (seen[key] || colors[row][col] !== color) {
      return [];
    }
    seen[key] = true;
    return [[row, col]].concat.apply([], neighbors(row, col).map(function (point) {
      return group(point[0], point[1], color, seen);
    }));
  }

  function render() {
    helpers.qsa(grid, ".color-cell").forEach(function (cell) {
      var row = Number(cell.dataset.row);
      var col = Number(cell.dataset.col);
      var color = colors[row][col];
      cell.dataset.color = color || "";
      cell.classList.toggle("is-empty", !color);
      cell.disabled = !color;
      cell.setAttribute("aria-label", color ? color + " tile" : "cleared tile");
    });
  }

  function isComplete() {
    return colors.every(function (row) {
      return row.every(function (color) { return !color; });
    });
  }

  function clearGroup(row, col) {
    var color = colors[row][col];
    if (!color) {
      return;
    }
    var matches = group(row, col, color, {});
    if (matches.length < 2) {
      helpers.setStatus(root, "Find a connected group of two or more.");
      return;
    }
    matches.forEach(function (point) {
      colors[point[0]][point[1]] = "";
    });
    render();
    if (isComplete()) {
      helpers.setStatus(root, "All colors cleared.");
      helpers.showComplete(root);
    } else {
      helpers.setStatus(root, matches.length + " tiles cleared.");
    }
  }

  for (var row = 0; row < size; row += 1) {
    for (var col = 0; col < size; col += 1) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "color-cell";
      button.dataset.row = row;
      button.dataset.col = col;
      button.addEventListener("click", function (event) {
        clearGroup(Number(event.currentTarget.dataset.row), Number(event.currentTarget.dataset.col));
      });
      grid.appendChild(button);
    }
  }
  render();
})();
