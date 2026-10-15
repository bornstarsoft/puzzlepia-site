(function () {
  "use strict";

  document.querySelectorAll("[data-pair-game]").forEach(function (root) {
    var mode = root.dataset.pairGame;
    var tiles = Array.from(root.querySelectorAll(".pair-tile"));
    var progress = root.querySelector("[data-progress]");
    var status = root.querySelector("[data-status]");
    var complete = root.querySelector("[data-complete]");
    var actions = root.querySelector("[data-complete-actions]");
    var reset = root.querySelector("[data-reset]");
    var clear = root.querySelector("[data-clear]");
    var controls = root.querySelector("[data-controls]");
    var unavailable = root.querySelector("[data-unavailable]");
    if ((mode !== "memory" && mode !== "sum") || !tiles.length || tiles.length % 2 ||
        !progress || !status || !complete || !actions || !reset || !clear || !controls ||
        !tiles.every(function (tile) {
          return tile.querySelector(".pair-face") && tile.dataset.label &&
            (mode === "memory" ? tile.querySelector("[data-symbol]") :
              /^[1-9]$/.test(tile.dataset.value));
        })) {
      return;
    }

    var selected = [];
    var found = new Set();
    var total = tiles.length / 2;
    var layoutIndex = 0;
    var layouts = null;
    var model = typeof window === "object" && window.PuzzlepiaMemoryLayouts;
    var picker = root.querySelector("[data-memory-select]");
    var today = root.querySelector("[data-memory-today]");
    var nextLayout = root.querySelector("[data-memory-next]");
    var layoutControls = root.querySelector("[data-memory-controls]");
    var layoutNote = root.querySelector("[data-memory-note]");
    var layoutData = root.querySelector("[data-memory-layouts]");
    var faces = {};
    if (mode === "memory" && model && picker && today && nextLayout &&
        layoutControls && layoutNote && layoutData && tiles.length === 12) {
      try {
        var parsed = JSON.parse(layoutData.textContent);
        if (model.valid(parsed)) layouts = parsed;
      } catch (_) { /* Keep the original practice board if optional data is unavailable. */ }
      tiles.forEach(function (tile) {
        faces[tile.dataset.value] = tile.querySelector("[data-symbol]").textContent;
      });
      if (layouts && !layouts[0].every(function (symbol) { return faces[symbol]; })) layouts = null;
    }

    function feedback(message, tone) {
      status.textContent = message;
      status.classList.remove("is-good", "is-warn", "is-complete");
      if (tone) status.classList.add("is-" + tone);
    }

    function render() {
      tiles.forEach(function (tile, index) {
        var matched = found.has(index);
        var active = selected.indexOf(index) !== -1;
        var visible = mode === "sum" || matched || active;
        var face = tile.querySelector(".pair-face");
        face.textContent = mode === "memory" ?
          (visible ? tile.querySelector("[data-symbol]").textContent : "?") : tile.dataset.value;
        tile.classList.toggle("is-selected", active);
        tile.classList.toggle("is-matched", matched);
        tile.classList.toggle("is-mismatch", active && selected.length === 2);
        tile.disabled = matched;
        tile.setAttribute("aria-pressed", active ? "true" : "false");
        tile.setAttribute("aria-label", (mode === "memory" ? "Card " : "Tile ") +
          (index + 1) + ", " + (visible ? tile.dataset.label : "face down") +
          (matched ? ", matched" : active ? ", selected" : ""));
      });
      progress.textContent = found.size / 2 + " / " + total + " pairs found";
      complete.hidden = found.size !== tiles.length;
      actions.hidden = complete.hidden;
      clear.disabled = selected.length === 0;
    }

    function choose(index) {
      if (found.has(index)) return;
      // A mismatch stays visible until the next deliberate action; no reset-sensitive timers.
      if (selected.length === 2) selected = [];
      if (selected[0] === index) {
        feedback("Choose a different tile, or clear your selection.");
        return;
      }
      selected.push(index);
      if (selected.length === 1) {
        feedback(mode === "memory" ? tiles[index].dataset.label + ". Find its matching symbol." :
          tiles[index].dataset.value + " selected. Find " + (10 - Number(tiles[index].dataset.value)) + ".");
      } else {
        var a = tiles[selected[0]].dataset.value;
        var b = tiles[selected[1]].dataset.value;
        var matches = mode === "memory" ? a === b : Number(a) + Number(b) === 10;
        if (matches) {
          selected.forEach(function (item) { found.add(item); });
          selected = [];
          feedback(found.size === tiles.length ? "All pairs found. Play another puzzle or reset this board." :
            (mode === "memory" ? "Pair found! Choose two more cards." : a + " + " + b + " = 10. Pair found!"),
            found.size === tiles.length ? "complete" : "good");
        } else {
          feedback((mode === "memory" ? "Different symbols." : a + " + " + b + " = " + (Number(a) + Number(b)) + ". Look for 10.") +
            " Your next tap starts a new pair.", "warn");
        }
      }
      render();
    }

    function resetGame(isReset) {
      selected = [];
      found.clear();
      render();
      feedback(isReset ? "Puzzle reset. Choose any two tiles." :
        (mode === "memory" ? "Turn over two cards to begin." : "Find two numbers that add up to 10."));
    }

    function loadLayout(index, focusBoard) {
      if (!layouts || !Number.isInteger(index) || index < 0 || index >= layouts.length) return;
      layoutIndex = index;
      picker.value = String(index);
      tiles.forEach(function (tile, position) {
        var symbol = layouts[index][position];
        tile.dataset.value = symbol;
        tile.dataset.label = symbol.charAt(0).toUpperCase() + symbol.slice(1);
        tile.querySelector("[data-symbol]").textContent = faces[symbol];
      });
      layoutNote.textContent = "Layout " + (index + 1) +
        ". Seven fixed layouts repeat weekly; today's pick changes at 00:00 UTC. Changing layouts starts a fresh board.";
      resetGame(false);
      feedback("Layout " + (index + 1) + " ready. Turn over two cards to begin.");
      if (focusBoard) tiles[0].focus();
    }

    tiles.forEach(function (tile, index) {
      tile.addEventListener("click", function () { choose(index); });
    });
    clear.addEventListener("click", function () {
      selected = [];
      render();
      feedback("Selection cleared. Choose a new pair.");
      var next = tiles.find(function (_, index) { return !found.has(index); });
      if (next) next.focus();
    });
    reset.addEventListener("click", function () { resetGame(true); });
    resetGame(false);
    if (layouts) {
      picker.addEventListener("change", function () { loadLayout(Number(picker.value), false); });
      today.addEventListener("click", function () { loadLayout(model.today(), true); });
      nextLayout.addEventListener("click", function () {
        if (found.size === tiles.length) loadLayout((layoutIndex + 1) % layouts.length, true);
      });
      loadLayout(model.today(), false);
      layoutControls.hidden = false;
      nextLayout.hidden = false;
    } else if (mode === "memory" && layoutNote) {
      layoutNote.textContent = "Starter layout. Other layouts are unavailable, but you can still play this board.";
    }
    controls.hidden = false;
    if (unavailable) unavailable.hidden = true;
  });
})();
