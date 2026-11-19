(function () {
  "use strict";

  var panel = document.querySelector("[data-layout-link-row]");
  if (!panel || typeof MutationObserver !== "function") return;

  var link = panel.querySelector("[data-layout-link]");
  var share = panel.querySelector("[data-layout-share]");
  var value = panel.querySelector("[data-layout-link-value]");
  var button = panel.querySelector("[data-copy-layout]");
  var status = panel.querySelector("[data-layout-share-status]");
  if (!link || !share || !value || !button || !status || panel.hidden) return;

  var request = 0;
  function syncLink() {
    if (value.value === link.href) return;
    value.value = link.href;
    request += 1;
    button.disabled = false;
    status.textContent = "";
  }

  syncLink();
  new MutationObserver(syncLink).observe(link, { attributes: true, attributeFilter: ["href"] });

  button.addEventListener("click", async function () {
    syncLink();
    var current = ++request;
    status.textContent = "";
    button.disabled = true;
    try {
      await window.navigator.clipboard.writeText(value.value);
      if (current === request) status.textContent = "Link copied.";
    } catch (_) {
      if (current === request) {
        status.textContent = "Copy is unavailable. The link is selected for manual copying.";
        value.focus();
        value.select();
      }
    } finally {
      if (current === request) button.disabled = false;
    }
  });
  share.hidden = false;
})();
