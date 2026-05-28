(function () {
  "use strict";

  var helpers = window.PuzzlepiaGames;
  var root = document.querySelector('[data-game="block-puzzle"]');
  if (!root || !helpers) {
    return;
  }

  var size = 6;
  var pieces = [
    { id: "line3", label: "Line 3", cells: [[0, 0], [0, 1], [0, 2]] },
    { id: "square", label: "Square", cells: [[0, 0], [0, 1], [1, 0], [1, 1]] },
    { id: "corner", label: "Corner", cells: [[0, 0], [1, 0], [1, 1]] }
  ];
  var board = [];
  var placed = {};
  var selected = null;
  var boardEl = helpers.qs(root, "[data-board]");
  var trayEl = helpers.qs(root, "[data-tray]");

  function makeBoard() {
    return Array.from({ length: size }, function () {
      return Array(size).fill(false);
    });
  }

  function canPlace(piece, row, col) {
    return piece.cells.every(function (offset) {
      var r = row + offset[0];
      var c = col + offset[1];
      return r >= 0 && c >= 0 && r < size && c < size && !board[r][c];
    });
  }

  function renderBoard() {
    helpers.qsa(boardEl, ".block-cell").forEach(function (cell) {
      var row = Number(cell.dataset.row);
      var col = Number(cell.dataset.col);
      cell.classList.toggle("is-filled", board[row][col]);
      cell.classList.remove("is-invalid");
    });
  }

  function completeIfReady() {
    if (pieces.every(function (piece) { return placed[piece.id]; })) {
      selected = null;
      helpers.setStatus(root, "All pieces placed.");
      helpers.showComplete(root);
    }
  }

  function place(row, col) {
    var cell = boardEl.querySelector('[data-row="' + row + '"][data-col="' + col + '"]');
    if (!selected) {
      helpers.setStatus(root, "Choose a piece first.");
      helpers.pulse(cell, "is-invalid");
      return;
    }
    if (!canPlace(selected, row, col)) {
      helpers.setStatus(root, "That piece needs more open space.");
      helpers.pulse(cell, "is-invalid");
      return;
    }
    selected.cells.forEach(function (offset) {
      board[row + offset[0]][col + offset[1]] = true;
    });
    placed[selected.id] = true;
    var button = trayEl.querySelector('[data-piece="' + selected.id + '"]');
    if (button) {
      button.disabled = true;
      button.classList.remove("is-selected");
    }
    selected = null;
    renderBoard();
    helpers.setStatus(root, "Piece placed. Choose the next piece.");
    completeIfReady();
  }

  function selectPiece(piece) {
    if (placed[piece.id]) {
      return;
    }
    selected = piece;
    helpers.qsa(trayEl, ".piece-button").forEach(function (button) {
      button.classList.toggle("is-selected", button.dataset.piece === piece.id);
    });
    helpers.setStatus(root, piece.label + " selected. Tap a board cell.");
  }

  function resetGame() {
    board = makeBoard();
    placed = {};
    selected = null;
    renderBoard();
    helpers.qsa(trayEl, ".piece-button").forEach(function (button) {
      button.disabled = false;
      button.classList.remove("is-selected");
    });
    helpers.hideComplete(root);
    helpers.setStatus(root, "Select a piece, then tap the board.");
  }

  function buildBoard() {
    var row;
    var col;
    for (row = 0; row < size; row += 1) {
      for (col = 0; col < size; col += 1) {
        var cell = document.createElement("button");
        cell.type = "button";
        cell.className = "block-cell";
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.setAttribute("aria-label", "Board cell row " + (row + 1) + ", column " + (col + 1));
        cell.addEventListener("click", function (event) {
          place(Number(event.currentTarget.dataset.row), Number(event.currentTarget.dataset.col));
        });
        boardEl.appendChild(cell);
      }
    }
  }

  function buildTray() {
    pieces.forEach(function (piece) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "piece-button";
      button.dataset.piece = piece.id;
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
