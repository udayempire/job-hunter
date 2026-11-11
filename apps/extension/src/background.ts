import { DEFAULT_API_URL, DEFAULT_FRONTEND_URL } from "./config";

function ensureContextMenus(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: "use-selection-company", title: "Use selection as company", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "use-selection-role", title: "Use selection as role", contexts: ["selection"] });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  ensureContextMenus();

  chrome.storage.local.get(["apiUrl", "frontendUrl"]).then((stored) => {
    return chrome.storage.local.set({
      apiUrl: stored.apiUrl ?? DEFAULT_API_URL,
      frontendUrl: stored.frontendUrl ?? DEFAULT_FRONTEND_URL,
    });
  });
});

chrome.runtime.onStartup.addListener(ensureContextMenus);
ensureContextMenus();

chrome.contextMenus.onClicked.addListener((info) => {
  if (!info.selectionText) return;
  const target = info.menuItemId === "use-selection-company" ? "company" : info.menuItemId === "use-selection-role" ? "title" : null;
  if (!target) return;

  void chrome.storage.session.set({
    pendingSelection: info.selectionText.trim().replace(/\s+/g, " ").slice(0, 200),
    pendingSelectionTarget: target,
  });
});
