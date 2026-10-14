(function () {
  "use strict";

  var helpers = window.PuzzlepiaGames;
  var model = window.PuzzlepiaWordSearch;
  var root = document.querySelector('[data-game="word-search"]');
  if (!root || !helpers || !model) {
    return;
  }

  var catalogEl = helpers.qs(root, "[data-word-search-catalog]");
  var catalog;
  try { catalog = model.prepare(JSON.parse(catalogEl.textContent)); } catch (error) { return; }
  if (!catalog) return;
  var letters = [], wordPaths = {}, words = [];
  var currentIndex = 0;
  var found = {};
  var cells = [];
  var startCell = null;
  var dragStartCell = null;
  var dragPath = [];
  var isPointerDown = false;
  var isDragging = false;
  var suppressNextClick = false;
  var activePointer = null;
  var capturedCell = null;
  var invalidTimer = null;
  var clickTimer = null;
  var grid = helpers.qs(root, "[data-grid]");
  var list = helpers.qs(root, "[data-word-list]");
  var select = helpers.qs(root, "[data-set-select]");
  var title = helpers.qs(root, "[data-set-title]");
  var schedule = helpers.qs(root, "[data-schedule]");
  var controls = helpers.qs(root, "[data-set-controls]");
  var todayButton = helpers.qs(root, "[data-today]");
  var nextButton = helpers.qs(root, "[data-next-set]");
  var actions = helpers.qs(root, "[data-complete-actions]");
  var resetButton = helpers.qs(root, "[data-reset]");
  var unavailable = helpers.qs(root, "[data-unavailable]");
  if (!grid || !list || !select || !title || !schedule || !controls || !todayButton ||
      !nextButton || !actions || !resetButton || !unavailable || !helpers.qs(root, "[data-status]") ||
      !helpers.qs(root, "[data-complete]")) return;

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
      actions.hidden = false;
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
    window.clearTimeout(invalidTimer);
    cells.forEach(function (cell) { cell.el.classList.remove("is-invalid"); });
    path.forEach(function (cell) {
      cell.el.classList.add("is-invalid");
    });
    setFeedback("Try a straight line that matches a word.");
    invalidTimer = window.setTimeout(function () {
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
    if (!element || !grid.contains(element) || !element.classList.contains("letter-cell")) {
      return null;
    }
    return cellAt(Number(element.dataset.row), Number(element.dataset.col));
  }

  function previewPath(path) {
    clearSelection();
    highlightPath(path, "is-selected");
  }

  function beginDrag(event) {
    if (event.button !== 0 || event.isPrimary === false || activePointer !== null) return;
    var cell = cellAt(Number(event.currentTarget.dataset.row), Number(event.currentTarget.dataset.col));
    if (!cell) {
      return;
    }
    isPointerDown = true;
    activePointer = event.pointerId;
    capturedCell = event.currentTarget;
    if (capturedCell.setPointerCapture) capturedCell.setPointerCapture(event.pointerId);
    isDragging = false;
    dragStartCell = cell;
    dragPath = [cell];
    previewPath(dragPath);
  }

  function updateDrag(event) {
    var cell;
    var path;
    if (!isPointerDown || !dragStartCell || event.pointerId !== activePointer) {
      return;
    }
    cell = cellFromPoint(event.clientX, event.clientY);
    if (!cell) {
      isDragging = true;
      dragPath = [];
      clearSelection();
      return;
    }
    if (cell !== dragStartCell) {
      isDragging = true;
    }
    path = pathBetween(dragStartCell, cell);
    dragPath = path;
    previewPath(path);
    event.preventDefault();
  }

  function endDrag(event) {
    if (!isPointerDown || event.pointerId !== activePointer) {
      return;
    }
    isPointerDown = false;
    activePointer = null;
    capturedCell = null;
    dragStartCell = null;
    if (isDragging) {
      startCell = null;
      suppressNextClick = true;
      window.clearTimeout(clickTimer);
      clickTimer = window.setTimeout(function () {
        suppressNextClick = false;
      }, 400);
      submitPath(dragPath);
    }
    isDragging = false;
    dragPath = [];
  }

  function cancelInput() {
    var pointer = activePointer;
    var captured = capturedCell;
    activePointer = null;
    capturedCell = null;
    if (captured && captured.hasPointerCapture && captured.hasPointerCapture(pointer)) captured.releasePointerCapture(pointer);
    startCell = null;
    dragStartCell = null;
    dragPath = [];
    isPointerDown = false;
    isDragging = false;
    suppressNextClick = false;
    window.clearTimeout(invalidTimer);
    window.clearTimeout(clickTimer);
    clearSelection();
    cells.forEach(function (cell) { cell.el.classList.remove("is-invalid"); });
  }

  function resetGame(isReset) {
    cancelInput();
    found = {};
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
    actions.hidden = true;
    helpers.setStatus(root, progressText() + (isReset ? " Puzzle reset. Find the four words." : " Tap or drag across a word."));
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
        button.addEventListener("pointercancel", function (event) {
          if (event.pointerId === activePointer) cancelInput();
        });
        button.addEventListener("click", tapCell);
        grid.appendChild(button);
        cells.push({ row: rowIndex, col: colIndex, letter: letter, el: button });
      });
    });
  }

  function loadSet(index, dayPick) {
    if (!Number.isInteger(index) || !catalog.sets[index]) return;
    cancelInput();
    currentIndex = index;
    var set = catalog.sets[index];
    letters = set.rows.map(function (row) { return row.split(""); });
    words = set.words.slice();
    wordPaths = set.paths;
    grid.replaceChildren();
    list.replaceChildren();
    cells = [];
    buildGrid();
    words.forEach(function (word) {
      var item = document.createElement("li");
      var button = document.createElement("button");
      item.dataset.word = word;
      button.type = "button";
      button.dataset.wordButton = word;
      button.textContent = word;
      button.addEventListener("click", function () { cancelInput(); markWord(word, "list"); });
      item.appendChild(button);
      list.appendChild(item);
    });
    select.value = String(index);
    title.textContent = set.title;
    var label = "Practice";
    if (dayPick && dayPick.scheduled) label = (dayPick.replay ? "Replay pick" : "Daily pick") + " for " + dayPick.day + " (UTC)";
    schedule.textContent = label + " - set " + (index + 1) + " of " + catalog.sets.length + ".";
    grid.setAttribute("aria-label", set.title + ", 6 by 6 word search grid");
    resetGame();
  }

  function loadToday() {
    var choice = model.pick(catalog, new Date());
    loadSet(choice.index, choice);
  }

  select.addEventListener("change", function () { loadSet(Number(select.value)); });
  todayButton.addEventListener("click", loadToday);
  nextButton.addEventListener("click", function () {
    loadSet((currentIndex + 1) % catalog.sets.length);
    cells[0].el.focus();
  });
  resetButton.addEventListener("click", function () { resetGame(true); });
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", function (event) { if (event.pointerId === activePointer) cancelInput(); });
  window.addEventListener("blur", cancelInput);
  document.addEventListener("visibilitychange", function () { if (document.hidden) cancelInput(); });
  loadToday();
  controls.hidden = false;
  resetButton.disabled = false;
  unavailable.hidden = true;
})();
