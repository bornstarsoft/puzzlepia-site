(function () {
  "use strict";

  var root = document.querySelector("[data-weekly-practice]");
  if (!root) return;

  var label = root.querySelector("[data-weekly-label]");
  var link = root.querySelector("[data-weekly-link]");
  var schedule = root.querySelector("[data-weekly-schedule]");
  var picks = root.querySelectorAll("[data-weekly-option]");
  if (!label || !link || !schedule || picks.length < 2) return;

  // Use a fixed Monday UTC anchor so rebuilds and local time zones do not shift the rotation.
  var start = Date.UTC(2026, 10, 16);
  var week = 7 * 24 * 60 * 60 * 1000;

  function showPick() {
    var weeks = Math.floor((Date.now() - start) / week);
    if (!Number.isFinite(weeks)) return;
    var index = ((weeks % picks.length) + picks.length) % picks.length;
    var pick = picks[index];
    link.href = pick.href;
    link.textContent = pick.textContent;
    label.textContent = "This week's practice:";
    schedule.hidden = false;

    picks.forEach(function (option, i) {
      if (i === index) option.setAttribute("aria-current", "true");
      else option.removeAttribute("aria-current");
    });
  }

  showPick();
  window.addEventListener("pageshow", showPick);
})();
