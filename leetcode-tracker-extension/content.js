(function () {
  "use strict";

  // ─── Configuration ───────────────────────────────────────────────────────────
  // Switch to local URL during development:
  const API_URL = "http://localhost:8080/api/leetcode/event";
  // const API_URL = "https://matrix-production-d793.up.railway.app/api/leetcode/event";
console.log(API_URL);
  const SUBMISSION_RESULT_SELECTOR = '[data-e2e-locator="submission-result"]';
  const PROBLEM_LINK_SELECTOR = 'a[href^="/problems/"]';

  // ─── Dedup ───────────────────────────────────────────────────────────────────
  // Use a Set so every unique key is tracked for the lifetime of the page.
  const sentKeys = new Set();

  // ─── API ─────────────────────────────────────────────────────────────────────
  async function sendEvent(payload) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.warn("[Matrix] Event rejected by server:", res.status);
        return;
      }
      console.log("Sending Event");
      console.log("[Matrix] Event sent:", payload.eventType, payload.problemName);
    } catch (e) {
      console.error("[Matrix] Failed to send event:", e);
      console.error("[Matrix] API URL:", API_URL);
    }
  }

  // ─── Submission observer ─────────────────────────────────────────────────────
  function observeSubmissions() {
    const observer = new MutationObserver(() => {
      const resultEl = document.querySelector(SUBMISSION_RESULT_SELECTOR);
      if (!resultEl) return;

      const status = resultEl.innerText.trim();
      if (!status) return;

      const problemName =
        document.querySelector(PROBLEM_LINK_SELECTOR)?.innerText?.trim() ||
        document.title;

      const problemUrl = window.location.href;
      const eventTime = new Date().toISOString();

      // Deduplicate: same problem + same status counts as one event per page load
      const key = `${problemName}__${status}`;
      if (sentKeys.has(key)) return;
      sentKeys.add(key);

      sendEvent({
        eventType: "SUBMISSION",
        problemName,
        status,
        problemUrl,
        eventTime,
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  observeSubmissions();
})();
