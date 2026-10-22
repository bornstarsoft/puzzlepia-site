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
  var hintButton = helpers.qs(root, "[data-hint]");
  var previousHint = null;
  if (!grid || !list || !select || !title || !schedule || !controls || !todayButton ||
      !nextButton || !actions || !resetButton || !unavailable || !helpers.qs(root, "[data-status]") ||
      !helpers.qs(root, "[data-complete]")) return;

  var progressModel = window.PuzzlepiaWordProgress;
  var remember = helpers.qs(root, "[data-remember]");
  var saveControls = helpers.qs(root, "[data-save-controls]");
  var saveStatus = helpers.qs(root, "[data-save-status]");
  var resumeButton = helpers.qs(root, "[data-resume]");
  var store = progressModel && remember && saveControls && saveStatus && resumeButton ?
    progressModel.create(function () { return window.localStorage; }, catalog) : null;
  var boardDay = "", boardMode = "practice", saved = null;
  var linkedIndex = model.linkedSet(catalog, window.location.search);
  var linkControls = helpers.qs(root, "[data-link-controls]");
  var setLink = helpers.qs(root, "[data-set-link]");
  var linkValue = helpers.qs(root, "[data-link-value]");
  var copyLink = helpers.qs(root, "[data-copy-link]");
  var linkStatus = helpers.qs(root, "[data-link-status]");
  var linkReady = linkControls && setLink && linkValue && copyLink && linkStatus;
  var copyRequest = 0;

  function updateSetLink() {
    if (!linkReady) return;
    copyRequest += 1;
    var path = model.setLink(catalog, currentIndex);
    setLink.setAttribute("href", path);
    setLink.textContent = "Open " + catalog.sets[currentIndex].title;
    linkValue.value = window.location.origin + path;
    linkStatus.textContent = "This link opens a fresh board, without answers or saved progress.";
    copyLink.disabled = false;
    linkControls.hidden = false;
  }

  if (linkReady) {
    copyLink.addEventListener("click", async function () {
      var request = ++copyRequest;
      var url = linkValue.value;
      copyLink.disabled = true;
      try {
        await window.navigator.clipboard.writeText(url);
        if (request === copyRequest) linkStatus.textContent = "Link copied. Come back to this set or share it.";
      } catch (_) {
        if (request === copyRequest) {
          linkStatus.textContent = "Copy is unavailable. Select and copy the link above.";
          linkValue.focus();
          linkValue.select();
        }
      } finally {
        if (request === copyRequest) copyLink.disabled = false;
      }
    });
  }

  function persist() {
    if (!store || !remember.checked) return;
    var ok = store.write({ index: currentIndex, day: boardDay, mode: boardMode,
      found: words.filter(function (word) { return found[word]; }) });
    saveStatus.textContent = ok ? "Progress saved on this browser." :
      "Saving is unavailable. Your latest changes may not be saved.";
    if (ok) { saved = null; resumeButton.hidden = true; }
  }

  function restore(record) {
    var choice = record.mode === "daily" ? model.pick(catalog, new Date(record.day + "T00:00:00Z")) : null;
    loadSet(record.index, choice);
    boardDay = record.day;
    if (boardDay !== new Date().toISOString().slice(0, 10)) {
      schedule.textContent = "Saved set from " + boardDay + " (UTC) - set " + (record.index + 1) + " of " + catalog.sets.length + ".";
    }
    record.found.forEach(function (word) { markWord(word, "restore"); });
    setFeedback(record.found.length === words.length ? "Puzzle complete! Restored from this browser." : "Welcome back. Your progress is restored.");
    saveStatus.textContent = "Saved progress restored. Reset starts this set again.";
    saved = null;
    resumeButton.hidden = true;
  }

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

  function clearHint() {
    cells.forEach(function (cell) {
      if (!cell.el.classList.contains("is-hint")) return;
      cell.el.classList.remove("is-hint");
      cell.el.setAttribute("aria-label", "Letter " + cell.letter + " row " + (cell.row + 1) + " column " + (cell.col + 1));
    });
  }

  if (hintButton) hintButton.addEventListener("click", function () {
    var hint = model.nextHint(catalog.sets[currentIndex], words.filter(function (word) { return found[word]; }), previousHint);
    if (!hint) return;
    cancelInput();
    clearHint();
    previousHint = hint.word;
    var cell = cellAt(hint.row, hint.col);
    cell.el.classList.add("is-hint");
    cell.el.setAttribute("aria-label", "Hint for " + hint.word + ": " + cell.el.getAttribute("aria-label"));
    setFeedback(hint.word + " starts at row " + (hint.row + 1) + ", column " + (hint.col + 1) + ". Follow a straight line from the outlined letter.");
  });

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
    clearHint();
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
    if (source !== "restore") persist();
    if (hintButton) hintButton.disabled = foundCount() === words.length;
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
    clearHint();
    previousHint = null;
    if (hintButton) hintButton.disabled = false;
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
    if (isReset) persist();
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
    boardDay = dayPick && dayPick.day ? dayPick.day : new Date().toISOString().slice(0, 10);
    boardMode = dayPick && dayPick.scheduled ? "daily" : "practice";
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
    updateSetLink();
  }

  function loadToday() {
    var choice = model.pick(catalog, new Date());
    loadSet(choice.index, choice);
  }

  select.addEventListener("change", function () { loadSet(Number(select.value)); persist(); });
  todayButton.addEventListener("click", function () { loadToday(); persist(); });
  nextButton.addEventListener("click", function () {
    loadSet((currentIndex + 1) % catalog.sets.length);
    persist();
    cells[0].el.focus();
  });
  resetButton.addEventListener("click", function () { resetGame(true); });
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", function (event) { if (event.pointerId === activePointer) cancelInput(); });
  window.addEventListener("blur", cancelInput);
  document.addEventListener("visibilitychange", function () { if (document.hidden) cancelInput(); });
  if (linkedIndex >= 0) {
    loadSet(linkedIndex);
    setFeedback("Opened from a set link. Find the four words.");
  } else loadToday();
  controls.hidden = false;
  resetButton.disabled = false;
  unavailable.hidden = true;
  if (store) {
    saveControls.hidden = false;
    var result = store.read();
    saved = result.record;
    remember.checked = !!saved;
    if (!result.ok) saveStatus.textContent = "Saving is unavailable here. You can still play.";
    if (saved) {
      if (linkedIndex >= 0) {
        resumeButton.textContent = "Continue saved " + catalog.sets[saved.index].title + " (" + saved.found.length + " / 4 found)";
        resumeButton.hidden = false;
        saveStatus.textContent = "The linked set is fresh. Your saved set is kept until you play, reset, or change sets.";
      } else if (saved.day === new Date().toISOString().slice(0, 10)) restore(saved);
      else if (saved.found.length) {
        resumeButton.textContent = "Continue " + catalog.sets[saved.index].title + " (" + saved.found.length + " / 4 found)";
        resumeButton.hidden = false;
        saveStatus.textContent = "Today's board is fresh. Your previous set is available above until you play or change sets.";
      } else saveStatus.textContent = "Saving is on. Today's board starts fresh.";
    }
    remember.addEventListener("change", function () {
      if (remember.checked) persist();
      else if (store.clear()) {
        saved = null;
        resumeButton.hidden = true;
        saveStatus.textContent = "Saved progress deleted. Saving is off; this board stays playable.";
      } else {
        remember.checked = true;
        saveStatus.textContent = "The save could not be deleted. Clear this site's data in your browser settings.";
      }
    });
    resumeButton.addEventListener("click", function () {
      if (saved) { restore(saved); cells[0].el.focus(); }
    });
    // An opt-out in another tab must not be silently undone by this tab.
    window.addEventListener("storage", function (event) {
      if ((event.key === progressModel.key || event.key === null) && event.newValue === null) {
        remember.checked = false;
        saved = null;
        resumeButton.hidden = true;
        saveStatus.textContent = "Saved progress cleared in another tab. Saving is off.";
      }
    });
  }
})();
