(function () {
  "use strict";

  var helpers = window.PuzzlepiaGames;
  var root = document.querySelector('[data-game="block-puzzle"]');
  if (!root || !helpers) {
    return;
  }

  var size = 6;
  var board = Array.from({ length: size }, function () {
    return Array(size).fill(false);
  });
  var pieces = [
    { id: "line3", label: "Line 3", cells: [[0, 0], [0, 1], [0, 2]] },
    { id: "square", label: "Square", cells: [[0, 0], [0, 1], [1, 0], [1, 1]] },
    { id: "corner", label: "Corner", cells: [[0, 0], [1, 0], [1, 1]] }
  ];
  var selected = null;
  var placed = {};
  var boardEl = helpers.qs(root, "[data-board]");
  var trayEl = helpers.qs(root, "[data-tray]");

  function canPlace(piece, row, col) {
    return piece.cells.every(function (offset) {
      var r = row + offset[0];
      var c = col + offset[1];
      return r >= 0 && c >= 0 && r < size && c < size && !board[r][c];
    });
  }

  function clearLines() {
    var rows = [];
    var cols = [];
    var r;
    var c;
    for (r = 0; r < size; r += 1) {
      if (board[r].every(Boolean)) {
        rows.push(r);
      }
    }
    for (c = 0; c < size; c += 1) {
      if (board.every(function (row) { return row[c]; })) {
        cols.push(c);
      }
    }
    rows.forEach(function (row) {
      for (c = 0; c < size; c += 1) {
        board[row][c] = false;
      }
    });
    cols.forEach(function (col) {
      for (r = 0; r < size; r += 1) {
        board[r][col] = false;
      }
    });
    return rows.length + cols.length;
  }

  function renderBoard() {
    helpers.qsa(boardEl, ".block-cell").forEach(function (cell) {
      var row = Number(cell.dataset.row);
      var col = Number(cell.dataset.col);
      cell.classList.toggle("is-filled", board[row][col]);
    });
  }

  function place(row, col) {
    if (!selected) {
      helpers.setStatus(root, "Choose a piece first.");
      return;
    }
    if (!canPlace(selected, row, col)) {
      helpers.setStatus(root, "That piece needs more open space.");
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
    var clears = clearLines();
    renderBoard();
    selected = null;
    if (pieces.every(function (piece) { return placed[piece.id]; })) {
      helpers.setStatus(root, "All pieces placed.");
      helpers.showComplete(root);
    } else {
      helpers.setStatus(root, clears ? "Line cleared. Choose the next piece." : "Piece placed. Choose the next piece.");
    }
  }

  function buildBoard() {
    for (var row = 0; row < size; row += 1) {
      for (var col = 0; col < size; col += 1) {
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
        selected = piece;
        helpers.qsa(trayEl, ".piece-button").forEach(function (item) {
          item.classList.toggle("is-selected", item.dataset.piece === piece.id);
        });
        helpers.setStatus(root, piece.label + " selected. Tap the board.");
      });
      trayEl.appendChild(button);
    });
  }

  buildBoard();
  buildTray();
})();
