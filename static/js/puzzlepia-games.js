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
    }
  };
})();
