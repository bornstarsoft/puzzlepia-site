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
  var dragStartCell = null;
  var dragPath = [];
  var isPointerDown = false;
  var isDragging = false;
  var suppressNextClick = false;
  var grid = helpers.qs(root, "[data-grid]");

  function foundCount() {
    return words.filter(function (word) {
      return found[word];
    }).length;
  }

  function progressText() {
    return foundCount() + " / " + words.length + " words found.";
  }

  function setFeedback(message) {
    helpers.setStatus(root, progressText() + " " + message);
  }

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

  function markWord(word, source) {
    if (!word) {
      return;
    }
    if (found[word]) {
      setFeedback(word + " is already found.");
      return;
    }
    found[word] = true;
    clearSelection();
    startCell = null;
    dragStartCell = null;
    dragPath = [];
    highlightPath(wordPaths[word], "is-found");
    var item = root.querySelector('[data-word="' + word + '"]');
    var button = root.querySelector('[data-word-button="' + word + '"]');
    if (item) {
      item.classList.add("is-found");
    }
    if (button) {
      button.setAttribute("aria-pressed", "true");
      button.setAttribute("aria-label", word + " found");
    }
    if (words.every(function (target) { return found[target]; })) {
      helpers.setStatus(root, progressText() + " Puzzle complete!");
      helpers.showComplete(root);
    } else {
      setFeedback(source === "list" ? word + " marked from the list." : "Great find: " + word + ".");
    }
  }

  function submitPath(path) {
    if (!path || !path.length) {
      setFeedback("Choose a straight line.");
      return;
    }
    var forward = pathWord(path);
    var backward = forward.split("").reverse().join("");
    var alreadyFound = words.find(function (target) {
      return found[target] && (target === forward || target === backward);
    });
    if (alreadyFound) {
      clearSelection();
      highlightPath(wordPaths[alreadyFound], "is-found");
      setFeedback(alreadyFound + " is already found.");
      return;
    }
    var word = words.find(function (target) {
      return !found[target] && (target === forward || target === backward);
    });
    if (word) {
      markWord(word);
      return;
    }
    clearSelection();
    path.forEach(function (cell) {
      cell.el.classList.add("is-invalid");
    });
    setFeedback("Try a straight line that matches a word.");
    window.setTimeout(function () {
      path.forEach(function (cell) {
        cell.el.classList.remove("is-invalid");
      });
    }, 360);
  }

  function tapCell(event) {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    var cell = cellAt(Number(event.currentTarget.dataset.row), Number(event.currentTarget.dataset.col));
    if (!cell) {
      return;
    }
    if (!startCell) {
      startCell = cell;
      clearSelection();
      cell.el.classList.add("is-selected");
      setFeedback("Now tap the last letter of the word.");
      return;
    }
    var path = pathBetween(startCell, cell);
    startCell = null;
    if (!path.length) {
      clearSelection();
      setFeedback("Choose letters in a straight line.");
      return;
    }
    clearSelection();
    highlightPath(path, "is-selected");
    submitPath(path);
  }

  function cellFromPoint(x, y) {
    var element = document.elementFromPoint(x, y);
    if (!element || !element.classList || !element.classList.contains("letter-cell")) {
      return null;
    }
    return cellAt(Number(element.dataset.row), Number(element.dataset.col));
  }

  function previewPath(path) {
    clearSelection();
    highlightPath(path, "is-selected");
  }

  function beginDrag(event) {
    var cell = cellAt(Number(event.currentTarget.dataset.row), Number(event.currentTarget.dataset.col));
    if (!cell) {
      return;
    }
    isPointerDown = true;
    isDragging = false;
    dragStartCell = cell;
    dragPath = [cell];
    previewPath(dragPath);
  }

  function updateDrag(event) {
    var cell;
    var path;
    if (!isPointerDown || !dragStartCell) {
      return;
    }
    cell = cellFromPoint(event.clientX, event.clientY);
    if (!cell) {
      return;
    }
    if (cell !== dragStartCell) {
      isDragging = true;
    }
    path = pathBetween(dragStartCell, cell);
    if (path.length) {
      dragPath = path;
      previewPath(path);
    }
    event.preventDefault();
  }

  function endDrag() {
    if (!isPointerDown) {
      return;
    }
    isPointerDown = false;
    dragStartCell = null;
    if (isDragging) {
      suppressNextClick = true;
      window.setTimeout(function () {
        suppressNextClick = false;
      }, 400);
      submitPath(dragPath);
    }
    isDragging = false;
    dragPath = [];
  }

  function resetGame() {
    found = {};
    startCell = null;
    dragStartCell = null;
    dragPath = [];
    isPointerDown = false;
    isDragging = false;
    suppressNextClick = false;
    clearSelection();
    cells.forEach(function (cell) {
      cell.el.classList.remove("is-found", "is-invalid");
    });
    helpers.qsa(root, "[data-word]").forEach(function (item) {
      item.classList.remove("is-found");
    });
    helpers.qsa(root, "[data-word-button]").forEach(function (button) {
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", button.dataset.wordButton);
    });
    helpers.hideComplete(root);
    helpers.setStatus(root, progressText() + " Tap or drag across a word.");
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
        button.addEventListener("pointerdown", beginDrag);
        button.addEventListener("pointermove", updateDrag);
        button.addEventListener("pointerup", endDrag);
        button.addEventListener("pointercancel", endDrag);
        button.addEventListener("click", tapCell);
        grid.appendChild(button);
        cells.push({ row: rowIndex, col: colIndex, letter: letter, el: button });
      });
    });
  }

  helpers.qsa(root, "[data-word-button]").forEach(function (button) {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", function () {
      markWord(button.dataset.wordButton, "list");
    });
  });
  buildGrid();
  helpers.wireReset(root, resetGame);
  resetGame();
})();
