import { DEFAULT_API_URL, DEFAULT_FRONTEND_URL } from "./config";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["apiUrl", "frontendUrl"]).then((stored) => {
    return chrome.storage.local.set({
      apiUrl: stored.apiUrl ?? DEFAULT_API_URL,
      frontendUrl: stored.frontendUrl ?? DEFAULT_FRONTEND_URL,
    });
  });
});
