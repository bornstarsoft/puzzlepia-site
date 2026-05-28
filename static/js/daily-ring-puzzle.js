(function () {
  "use strict";

  var helpers = window.PuzzlepiaGames;
  var root = document.querySelector('[data-game="ring-puzzle"]');
  if (!root || !helpers) {
    return;
  }

  var pieces = [
    { id: "pink-large", color: "pink", size: "large", label: "Pink large" },
    { id: "pink-medium", color: "pink", size: "medium", label: "Pink medium" },
    { id: "pink-small", color: "pink", size: "small", label: "Pink small" },
    { id: "mint-large", color: "mint", size: "large", label: "Mint large" },
    { id: "gold-medium", color: "gold", size: "medium", label: "Gold medium" }
  ];
  var cells = [];
  var placed = {};
  var selected = null;
  var boardEl = helpers.qs(root, "[data-board]");
  var trayEl = helpers.qs(root, "[data-tray]");

  function renderCell(index) {
    var cell = boardEl.querySelector('[data-cell="' + index + '"]');
    if (!cell) {
      return;
    }
    cell.innerHTML = "";
    cell.classList.remove("is-invalid", "is-match");
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

  function renderBoard() {
    cells.forEach(function (_, index) {
      renderCell(index);
    });
  }

  function completeIfReady() {
    if (pieces.every(function (piece) { return placed[piece.id]; })) {
      selected = null;
      helpers.setStatus(root, "All rings placed.");
      helpers.showComplete(root);
    }
  }

  function place(index) {
    var cell = boardEl.querySelector('[data-cell="' + index + '"]');
    if (!selected) {
      helpers.setStatus(root, "Choose a ring first.");
      helpers.pulse(cell, "is-invalid");
      return;
    }
    if (cells[index][selected.size]) {
      helpers.setStatus(root, "That cell already has a " + selected.size + " ring.");
      helpers.pulse(cell, "is-invalid");
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
    selected = null;
    helpers.setStatus(root, "Ring placed. Choose another ring.");
    completeIfReady();
  }

  function selectPiece(piece) {
    if (placed[piece.id]) {
      return;
    }
    selected = piece;
    helpers.qsa(trayEl, ".ring-piece").forEach(function (button) {
      button.classList.toggle("is-selected", button.dataset.piece === piece.id);
    });
    helpers.setStatus(root, piece.label + " selected. Tap a compatible cell.");
  }

  function resetGame() {
    cells = Array.from({ length: 9 }, function () { return {}; });
    placed = {};
    selected = null;
    renderBoard();
    helpers.qsa(trayEl, ".ring-piece").forEach(function (button) {
      button.disabled = false;
      button.classList.remove("is-selected");
    });
    helpers.hideComplete(root);
    helpers.setStatus(root, "Select a ring, then tap a cell.");
  }

  function buildBoard() {
    for (var index = 0; index < 9; index += 1) {
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "ring-cell";
      cell.dataset.cell = index;
      cell.setAttribute("aria-label", "Ring cell " + (index + 1));
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
        selectPiece(piece);
      });
      trayEl.appendChild(button);
    });
  }

  buildBoard();
  buildTray();
  helpers.wireReset(root, resetGame);
  resetGame();
})();
