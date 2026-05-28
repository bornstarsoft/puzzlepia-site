(function () {
  "use strict";

  var helpers = window.PuzzlepiaGames;
  var root = document.querySelector('[data-game="ring-puzzle"]');
  if (!root || !helpers) {
    return;
  }

  var cells = Array.from({ length: 9 }, function () { return {}; });
  var pieces = [
    { id: "pink-large", color: "pink", size: "large", label: "Pink large" },
    { id: "pink-medium", color: "pink", size: "medium", label: "Pink medium" },
    { id: "pink-small", color: "pink", size: "small", label: "Pink small" },
    { id: "mint-large", color: "mint", size: "large", label: "Mint large" },
    { id: "gold-medium", color: "gold", size: "medium", label: "Gold medium" }
  ];
  var lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  var selected = null;
  var placed = {};
  var boardEl = helpers.qs(root, "[data-board]");
  var trayEl = helpers.qs(root, "[data-tray]");

  function renderCell(index) {
    var cell = boardEl.querySelector('[data-cell="' + index + '"]');
    cell.innerHTML = "";
    ["large", "medium", "small"].forEach(function (size) {
      var color = cells[index][size];
      if (!color) {
        return;
      }
      var ring = document.createElement("span");
      ring.className = "ring-layer ring-layer--" + size;
      ring.dataset.color = color;
      cell.appendChild(ring);
    });
  }

  function markMatches() {
    var matched = 0;
    ["pink", "mint", "gold"].forEach(function (color) {
      lines.forEach(function (line) {
        var match = line.every(function (index) {
          return Object.keys(cells[index]).some(function (size) {
            return cells[index][size] === color;
          });
        });
        if (match) {
          line.forEach(function (index) {
            matched += 1;
            helpers.pulse(boardEl.querySelector('[data-cell="' + index + '"]'), "is-match");
          });
        }
      });
    });
    return matched;
  }

  function place(index) {
    if (!selected) {
      helpers.setStatus(root, "Choose a ring first.");
      return;
    }
    if (cells[index][selected.size]) {
      helpers.setStatus(root, "That cell already has a " + selected.size + " ring.");
      helpers.pulse(boardEl.querySelector('[data-cell="' + index + '"]'), "is-invalid");
      return;
    }
    cells[index][selected.size] = selected.color;
    placed[selected.id] = true;
    renderCell(index);
    var button = trayEl.querySelector('[data-piece="' + selected.id + '"]');
    if (button) {
      button.disabled = true;
      button.classList.remove("is-selected");
    }
    var matched = markMatches();
    selected = null;
    if (pieces.every(function (piece) { return placed[piece.id]; })) {
      helpers.setStatus(root, "All rings placed.");
      helpers.showComplete(root);
    } else {
      helpers.setStatus(root, matched ? "Color line matched. Choose another ring." : "Ring placed. Choose another ring.");
    }
  }

  function resetGame() {
    cells = Array.from({ length: 9 }, function () { return {}; });
    selected = null;
    placed = {};
    helpers.qsa(boardEl, ".ring-cell").forEach(function (cell) {
      cell.innerHTML = "";
      cell.classList.remove("is-invalid", "is-match");
    });
    helpers.qsa(trayEl, ".ring-piece").forEach(function (button) {
      button.disabled = false;
      button.classList.remove("is-selected");
    });
    helpers.hideComplete(root);
    helpers.setStatus(root, "Select a ring, then tap a cell.");
  }

  function buildBoard() {
    for (var i = 0; i < 9; i += 1) {
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "ring-cell";
      cell.dataset.cell = i;
      cell.setAttribute("aria-label", "Ring cell " + (i + 1));
      cell.addEventListener("click", function (event) {
        place(Number(event.currentTarget.dataset.cell));
      });
      boardEl.appendChild(cell);
    }
  }

  function buildTray() {
    pieces.forEach(function (piece) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "ring-piece";
      button.dataset.piece = piece.id;
      button.dataset.color = piece.color;
      button.textContent = piece.label;
      button.addEventListener("click", function () {
        selected = piece;
        helpers.qsa(trayEl, ".ring-piece").forEach(function (item) {
          item.classList.toggle("is-selected", item.dataset.piece === piece.id);
        });
        helpers.setStatus(root, piece.label + " selected.");
      });
      trayEl.appendChild(button);
    });
  }

  buildBoard();
  buildTray();
  helpers.wireReset(root, resetGame);
})();
