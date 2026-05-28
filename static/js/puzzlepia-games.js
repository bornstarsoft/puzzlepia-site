(function () {
  "use strict";

  window.PuzzlepiaGames = {
    qs: function (root, selector) {
      return root.querySelector(selector);
    },
    qsa: function (root, selector) {
      return Array.prototype.slice.call(root.querySelectorAll(selector));
    },
    setStatus: function (root, message) {
      var status = root.querySelector("[data-status]");
      if (status) {
        status.textContent = message;
      }
    },
    showComplete: function (root) {
      var complete = root.querySelector("[data-complete]");
      if (complete) {
        complete.hidden = false;
      }
    },
    hideComplete: function (root) {
      var complete = root.querySelector("[data-complete]");
      if (complete) {
        complete.hidden = true;
      }
    },
    wireReset: function (root, reset) {
      var button = root.querySelector("[data-reset]");
      if (button) {
        button.addEventListener("click", reset);
      }
    },
    pulse: function (element, className) {
      if (!element) {
        return;
      }
      element.classList.add(className);
      window.setTimeout(function () {
        element.classList.remove(className);
      }, 320);
    }
  };
})();
