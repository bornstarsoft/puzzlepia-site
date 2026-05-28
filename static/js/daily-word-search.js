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
  var wordPaths = {
    MINT: [[5, 0], [5, 1], [5, 2], [5, 3]],
    MOON: [[0, 5], [1, 5], [2, 5], [3, 5]],
    PLAY: [[4, 0], [4, 1], [4, 2], [4, 3]],
    STAR: [[0, 0], [0, 1], [0, 2], [0, 3]]
  };
  var words = Object.keys(wordPaths);
  var found = {};
  var cells = [];
  var startCell = null;
  var grid = helpers.qs(root, "[data-grid]");

  function cellAt(row, col) {
    return cells.find(function (cell) {
      return cell.row === row && cell.col === col;
    });
  }

  function pathBetween(start, end) {
    var rowDelta = end.row - start.row;
    var colDelta = end.col - start.col;
    var rowStep = Math.sign(rowDelta);
    var colStep = Math.sign(colDelta);
    var length = Math.max(Math.abs(rowDelta), Math.abs(colDelta));
    var path = [];
    var index;

    if (!(rowDelta === 0 || colDelta === 0 || Math.abs(rowDelta) === Math.abs(colDelta))) {
      return [];
    }

    for (index = 0; index <= length; index += 1) {
      var cell = cellAt(start.row + rowStep * index, start.col + colStep * index);
      if (!cell) {
        return [];
      }
      path.push(cell);
    }
    return path;
  }

  function pathWord(path) {
    return path.map(function (cell) { return cell.letter; }).join("");
  }

  function clearSelection() {
    cells.forEach(function (cell) {
      cell.el.classList.remove("is-selected");
    });
  }

  function highlightPath(path, className) {
    path.forEach(function (point) {
      var cell = Array.isArray(point) ? cellAt(point[0], point[1]) : point;
      if (cell) {
        cell.el.classList.add(className);
      }
    });
  }

  function markWord(word) {
    if (!word || found[word]) {
      return;
    }
    found[word] = true;
    clearSelection();
    highlightPath(wordPaths[word], "is-found");
    var item = root.querySelector('[data-word="' + word + '"]');
    var button = root.querySelector('[data-word-button="' + word + '"]');
    if (item) {
      item.classList.add("is-found");
    }
    if (button) {
      button.disabled = true;
    }
    if (words.every(function (target) { return found[target]; })) {
      helpers.setStatus(root, "All words found.");
      helpers.showComplete(root);
    } else {
      helpers.setStatus(root, "Found " + word + ". Keep going.");
    }
  }

  function submitPath(path) {
    var forward = pathWord(path);
    var backward = forward.split("").reverse().join("");
    var word = words.find(function (target) {
      return !found[target] && (target === forward || target === backward);
    });
    if (word) {
      markWord(word);
      return;
    }
    helpers.setStatus(root, "That line is not one of today's words.");
    clearSelection();
  }

  function tapCell(event) {
    var cell = cellAt(Number(event.currentTarget.dataset.row), Number(event.currentTarget.dataset.col));
    if (!cell) {
      return;
    }
    if (!startCell) {
      startCell = cell;
      clearSelection();
      cell.el.classList.add("is-selected");
      helpers.setStatus(root, "Now tap the last letter of the word.");
      return;
    }
    var path = pathBetween(startCell, cell);
    startCell = null;
    if (!path.length) {
      clearSelection();
      helpers.setStatus(root, "Choose letters in a straight line.");
      return;
    }
    clearSelection();
    highlightPath(path, "is-selected");
    submitPath(path);
  }

  function resetGame() {
    found = {};
    startCell = null;
    clearSelection();
    cells.forEach(function (cell) {
      cell.el.classList.remove("is-found");
    });
    helpers.qsa(root, "[data-word]").forEach(function (item) {
      item.classList.remove("is-found");
    });
    helpers.qsa(root, "[data-word-button]").forEach(function (button) {
      button.disabled = false;
    });
    helpers.hideComplete(root);
    helpers.setStatus(root, "Tap the first letter of a word, or tap a word in the list.");
  }

  function buildGrid() {
    letters.forEach(function (row, rowIndex) {
      row.forEach(function (letter, colIndex) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "letter-cell";
        button.textContent = letter;
        button.dataset.row = rowIndex;
        button.dataset.col = colIndex;
        button.setAttribute("aria-label", "Letter " + letter + " row " + (rowIndex + 1) + " column " + (colIndex + 1));
        button.addEventListener("click", tapCell);
        grid.appendChild(button);
        cells.push({ row: rowIndex, col: colIndex, letter: letter, el: button });
      });
    });
  }

  helpers.qsa(root, "[data-word-button]").forEach(function (button) {
    button.addEventListener("click", function () {
      markWord(button.dataset.wordButton);
    });
  });
  buildGrid();
  helpers.wireReset(root, resetGame);
  resetGame();
})();
