import { extractJob } from "./extractors";

chrome.runtime.onMessage.addListener(
  (message: { type?: string }, _sender, sendResponse) => {
    if (message.type === "get-selection") {
      sendResponse({
        selection:
          window
            .getSelection()
            ?.toString()
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 200) ?? "",
      });
      return;
    }
    if (message.type !== "extract-job") return;

    const captured = extractJob(document, window.location.hostname);
    sendResponse({
      ...captured,
      detailsUrl: window.location.href,
      source: window.location.hostname,
    });
  },
);
