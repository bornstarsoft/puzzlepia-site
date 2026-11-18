(function () {
  "use strict";

  var root = document.querySelector("[data-weekly-practice]");
  if (!root) return;

  var label = root.querySelector("[data-weekly-label]");
  var link = root.querySelector("[data-weekly-link]");
  var preview = root.querySelector("[data-weekly-preview]");
  var previewLink = root.querySelector("[data-weekly-preview-link]");
  var previewDate = root.querySelector("[data-weekly-preview-date]");
  var picks = root.querySelectorAll("[data-weekly-option]");
  if (!label || !link || picks.length < 2) return;

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

    if (preview && previewLink && previewDate) {
      var next = picks[(index + 1) % picks.length];
      var starts = new Date(start + (weeks + 1) * week);
      if (Number.isFinite(starts.getTime())) {
        previewLink.href = next.href;
        previewLink.textContent = next.textContent;
        previewDate.dateTime = starts.toISOString();
        previewDate.textContent = starts.toLocaleDateString("en-US", {
          year: "numeric", month: "short", day: "numeric", timeZone: "UTC"
        }) + ", 00:00 UTC";
        preview.hidden = false;
      }
    }

    picks.forEach(function (option, i) {
      if (i === index) option.setAttribute("aria-current", "true");
      else option.removeAttribute("aria-current");
    });
  }

  showPick();
  window.addEventListener("pageshow", showPick);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) showPick();
  });
})();
