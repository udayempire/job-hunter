chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ apiUrl: "http://localhost:4000/api", frontendUrl: "http://localhost:3001" });
});
