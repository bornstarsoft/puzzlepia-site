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
  var completeActionsEl = helpers.qs(root, "[data-complete-actions]");

  function placedCount() {
    return pieces.filter(function (piece) { return placed[piece.id]; }).length;
  }

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

  function renderCell(index) {
    var cell = boardEl.querySelector('[data-cell="' + index + '"]');
    if (!cell) {
      return;
    }
    cell.innerHTML = "";
    cell.classList.remove("is-invalid");
    var labels = [];
    ["large", "medium", "small"].forEach(function (size) {
      var color = cells[index][size];
      if (!color) {
        return;
      }
      var ring = document.createElement("span");
      ring.className = "ring-layer ring-layer--" + size;
      ring.dataset.color = color;
      cell.appendChild(ring);
      labels.push(color + " " + size);
    });
    cell.classList.toggle("is-filled", labels.length > 0);
    cell.setAttribute("aria-label", "Ring cell " + (index + 1) + (labels.length ? ", contains " + labels.join(", ") : ", empty"));
  }

  function renderBoard() {
    cells.forEach(function (_, index) {
      renderCell(index);
    });
  }

  function completeIfReady() {
    if (pieces.every(function (piece) { return placed[piece.id]; })) {
      selected = null;
      setFeedback("Puzzle complete! Great job.", "complete");
      helpers.showComplete(root);
      showCompletionActions(true);
    }
  }

  function place(index) {
    var cell = boardEl.querySelector('[data-cell="' + index + '"]');
    if (!selected) {
      setFeedback("Tap a ring first.", "warn");
      helpers.pulse(cell, "is-invalid");
      return;
    }
    if (cells[index][selected.size]) {
      setFeedback("That cell already has a " + selected.size + " ring.", "warn");
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
      button.setAttribute("aria-pressed", "false");
    }
    selected = null;
    setFeedback("Ring placed. " + placedCount() + " of " + pieces.length + " done.", "good");
    completeIfReady();
  }

  function selectPiece(piece) {
    if (placed[piece.id]) {
      return;
    }
    selected = piece;
    helpers.qsa(trayEl, ".ring-piece").forEach(function (button) {
      var isSelected = button.dataset.piece === piece.id;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
    setFeedback(piece.label + " selected. Tap a compatible cell.", "good");
  }

  function resetGame(showResetFeedback) {
    cells = Array.from({ length: 9 }, function () { return {}; });
    placed = {};
    selected = null;
    renderBoard();
    helpers.qsa(trayEl, ".ring-piece").forEach(function (button) {
      button.disabled = false;
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });
    helpers.hideComplete(root);
    showCompletionActions(false);
    setFeedback(showResetFeedback ? "Puzzle reset. Tap a ring." : "Tap a ring, then tap a cell.", showResetFeedback ? "good" : "");
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
      button.setAttribute("aria-pressed", "false");
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
