(function () {
  "use strict";

  var helpers = window.PuzzlepiaGames;
  var root = document.querySelector('[data-game="word-search"]');
  if (!root || !helpers) {
    return;
  }

  var letters = [
    ["S", "T", "A", "R", "P", "M"],
    ["U", "L", "A", "Y", "I", "O"],
    ["N", "P", "M", "I", "N", "O"],
    ["C", "A", "T", "R", "T", "N"],
    ["P", "L", "A", "Y", "S", "Q"],
    ["M", "I", "N", "T", "A", "R"]
  ];
  var words = ["STAR", "MOON", "MINT", "PLAY"];
  var found = {};
  var cells = [];
  var dragStart = null;
  var currentSelection = [];

  function cellAt(row, col) {
    return cells.find(function (cell) {
      return cell.row === row && cell.col === col;
    });
  }

  function makePath(start, end) {
    var rowDelta = end.row - start.row;
    var colDelta = end.col - start.col;
    var rowStep = Math.sign(rowDelta);
    var colStep = Math.sign(colDelta);
    var length = Math.max(Math.abs(rowDelta), Math.abs(colDelta));

    if (!(rowDelta === 0 || colDelta === 0 || Math.abs(rowDelta) === Math.abs(colDelta))) {
      return [];
    }

    var path = [];
    for (var i = 0; i <= length; i += 1) {
      var cell = cellAt(start.row + rowStep * i, start.col + colStep * i);
      if (cell) {
        path.push(cell);
      }
    }
    return path;
  }

  function clearSelection() {
    currentSelection.forEach(function (cell) {
      cell.el.classList.remove("is-selected");
    });
    currentSelection = [];
  }

  function renderSelection(path) {
    clearSelection();
    currentSelection = path;
    path.forEach(function (cell) {
      if (!cell.el.classList.contains("is-found")) {
        cell.el.classList.add("is-selected");
      }
    });
  }

  function markFound(word, path) {
    found[word] = true;
    path.forEach(function (cell) {
      cell.el.classList.add("is-found");
      cell.el.classList.remove("is-selected");
    });
    var item = root.querySelector('[data-word="' + word + '"]');
    if (item) {
      item.classList.add("is-found");
    }
    helpers.setStatus(root, "Found " + word + ".");
    if (words.every(function (target) { return found[target]; })) {
      helpers.setStatus(root, "All words found.");
      helpers.showComplete(root);
    }
  }

  function finishSelection() {
    if (!currentSelection.length) {
      return;
    }
    var selected = currentSelection.map(function (cell) { return cell.letter; }).join("");
    var reversed = selected.split("").reverse().join("");
    var word = words.find(function (target) {
      return !found[target] && (target === selected || target === reversed);
    });
    if (word) {
      markFound(word, currentSelection);
    } else {
      helpers.setStatus(root, "Try another straight line.");
      clearSelection();
    }
    dragStart = null;
  }

  function pointerCell(event) {
    var point = event.touches ? event.touches[0] : event;
    var target = document.elementFromPoint(point.clientX, point.clientY);
    if (!target || !target.classList.contains("letter-cell")) {
      return null;
    }
    return {
      row: Number(target.dataset.row),
      col: Number(target.dataset.col),
      letter: target.textContent,
      el: target
    };
  }

  function startDrag(event) {
    var cell = pointerCell(event);
    if (!cell) {
      return;
    }
    event.preventDefault();
    dragStart = cell;
    renderSelection([cell]);
  }

  function moveDrag(event) {
    if (!dragStart) {
      return;
    }
    var cell = pointerCell(event);
    if (!cell) {
      return;
    }
    event.preventDefault();
    var path = makePath(dragStart, cell);
    if (path.length) {
      renderSelection(path);
    }
  }

  function buildGrid() {
    var grid = helpers.qs(root, "[data-grid]");
    letters.forEach(function (row, rowIndex) {
      row.forEach(function (letter, colIndex) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "letter-cell";
        button.textContent = letter;
        button.dataset.row = rowIndex;
        button.dataset.col = colIndex;
        button.setAttribute("aria-label", "Letter " + letter);
        grid.appendChild(button);
        cells.push({ row: rowIndex, col: colIndex, letter: letter, el: button });
      });
    });
    grid.addEventListener("pointerdown", startDrag);
    grid.addEventListener("pointermove", moveDrag);
    grid.addEventListener("pointerup", finishSelection);
    grid.addEventListener("pointercancel", finishSelection);
  }

  buildGrid();
})();
