import type { CapturedJob, ContentResponse, PopupDraft } from "./types";
import { DEFAULT_API_URL, DEFAULT_FRONTEND_URL } from "./config";

const companyInput = document.querySelector<HTMLInputElement>("#company");
const titleInput = document.querySelector<HTMLInputElement>("#title");
const applyLinkInput = document.querySelector<HTMLInputElement>("#applyLink");
const detailsUrlInput = document.querySelector<HTMLInputElement>("#detailsUrl");
const form = document.querySelector<HTMLFormElement>("#job-form");
const saveButton = document.querySelector<HTMLButtonElement>("#save");
const signInLink = document.querySelector<HTMLAnchorElement>("#sign-in");
const openJobLink = document.querySelector<HTMLAnchorElement>("#open-job");
const message = document.querySelector<HTMLParagraphElement>("#message");
const accountLabel = document.querySelector<HTMLParagraphElement>("#account");
const accountLink = document.querySelector<HTMLAnchorElement>("#account-link");
let capturedDetailsUrl = "";
let capturedSource = "";
const draftStorageKey = "jobDraft";

function setMessage(text: string, kind?: "error" | "success"): void {
  if (!message) return;
  message.textContent = text;
  message.className = kind ? `message ${kind}` : "message";
}

function fillForm(job: ContentResponse): void {
  if (companyInput) companyInput.value = job.company ?? "";
  if (titleInput) titleInput.value = job.title ?? "";
  if (applyLinkInput) applyLinkInput.value = job.applyLink ?? "";
  if (detailsUrlInput) detailsUrlInput.value = job.detailsUrl ?? "";
  capturedDetailsUrl = job.detailsUrl ?? "";
  capturedSource = job.source ?? "";
}

function currentDraft(): PopupDraft {
  return {
    company: companyInput?.value.trim() || undefined,
    title: titleInput?.value.trim() || undefined,
    applyLink: applyLinkInput?.value.trim() || undefined,
    detailsUrl: detailsUrlInput?.value.trim() || undefined,
    source: capturedSource,
  };
}

async function persistDraft(): Promise<void> {
  await chrome.storage.local.set({ [draftStorageKey]: currentDraft() });
}

async function restoreDraft(pageUrl?: string): Promise<void> {
  const stored = await chrome.storage.local.get(draftStorageKey);
  const draft = stored[draftStorageKey] as PopupDraft | undefined;
  if (!draft || !pageUrl || draft.detailsUrl !== pageUrl) return;

  fillForm(draft);
}

async function clearDraft(): Promise<void> {
  await chrome.storage.local.remove(draftStorageKey);
}

async function sendContentMessage<T>(tabId: number, message: { type: string }): Promise<T> {
  try {
    return await chrome.tabs.sendMessage<unknown, T>(tabId, message);
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
    return chrome.tabs.sendMessage<unknown, T>(tabId, message);
  }
}

function showSignInLink(frontendUrl: string): void {
  if (!signInLink) return;
  signInLink.href = `${frontendUrl}/login?returnTo=%2Fhome`;
  signInLink.hidden = false;
}

function showJobLink(frontendUrl: string, jobId: string): void {
  if (!openJobLink) return;
  openJobLink.href = `${frontendUrl}/jobs/${encodeURIComponent(jobId)}`;
  openJobLink.hidden = false;
}

async function loadAccount(): Promise<void> {
  const stored = await chrome.storage.local.get(["apiUrl", "frontendUrl"]);
  const apiUrl = stored.apiUrl ?? DEFAULT_API_URL;
  const frontendUrl = stored.frontendUrl ?? DEFAULT_FRONTEND_URL;

  try {
    const response = await fetch(`${apiUrl}/auth/me`, { credentials: "include", cache: "no-store" });
    if (!response.ok) {
      if (accountLabel) accountLabel.textContent = "Not signed in";
      showSignInLink(frontendUrl);
      return;
    }

    const payload = await response.json() as { data?: { profile?: { handle?: string | null } | null } };
    const handle = payload.data?.profile?.handle;
    if (!handle) {
      if (accountLabel) accountLabel.textContent = "Signed in · public username unavailable";
      return;
    }
    if (accountLabel) accountLabel.textContent = "Signed in as";
    if (accountLink) {
      accountLink.textContent = `@${handle}`;
      accountLink.href = `${frontendUrl}/profile/${encodeURIComponent(handle)}`;
      accountLink.hidden = false;
    }
  } catch {
    if (accountLabel) accountLabel.textContent = "Account unavailable";
  }
}

async function captureActiveTab(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    const captured = await sendContentMessage<ContentResponse>(tab.id, { type: "extract-job" });
    fillForm(captured);
    await restoreDraft(captured.detailsUrl ?? tab.url);
  } catch {
    fillForm({ applyLink: tab.url, title: tab.title });
    await restoreDraft(tab.url);
    setMessage("This page needs a quick manual review.");
  }
}

async function useSelectedText(target: "company" | "title"): Promise<void> {
  const stored = await chrome.storage.session.get("pendingSelection");
  const storedSelection = typeof stored.pendingSelection === "string" ? stored.pendingSelection : "";
  if (storedSelection) {
    if (target === "company" && companyInput) companyInput.value = storedSelection;
    if (target === "title" && titleInput) titleInput.value = storedSelection;
    await chrome.storage.session.remove(["pendingSelection", "pendingSelectionTarget"]);
    await persistDraft();
    setMessage(`Selected text used as ${target === "company" ? "company" : "role"}.`, "success");
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    const response = await sendContentMessage<ContentResponse>(tab.id, { type: "get-selection" });
    if (!response.selection) {
      setMessage("Select some text on the page first.", "error");
      return;
    }
    if (target === "company" && companyInput) companyInput.value = response.selection;
    if (target === "title" && titleInput) titleInput.value = response.selection;
    await persistDraft();
    setMessage(`Selected text used as ${target === "company" ? "company" : "role"}.`, "success");
  } catch {
    setMessage("This page does not allow selected-text capture.", "error");
  }
}

async function applyPendingSelection(): Promise<void> {
  const stored = await chrome.storage.session.get(["pendingSelection", "pendingSelectionTarget"]);
  const selection = typeof stored.pendingSelection === "string" ? stored.pendingSelection : "";
  const target = stored.pendingSelectionTarget === "company" || stored.pendingSelectionTarget === "title"
    ? stored.pendingSelectionTarget
    : null;
  if (!selection || !target) return;

  if (target === "company" && companyInput) companyInput.value = selection;
  if (target === "title" && titleInput) titleInput.value = selection;
  await chrome.storage.session.remove(["pendingSelection", "pendingSelectionTarget"]);
  await persistDraft();
  setMessage(`Selected text used as ${target === "company" ? "company" : "role"}.`, "success");
}

async function saveJob(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!companyInput || !titleInput || !applyLinkInput || !detailsUrlInput || !saveButton) return;

  const applyLink = applyLinkInput.value.trim();
  const detailsUrl = detailsUrlInput.value.trim();
  if (!applyLink && !detailsUrl) {
    setMessage("Add an apply link or job details URL.", "error");
    return;
  }

  const job: CapturedJob = {
    company: companyInput.value.trim() || "Unnamed company",
    title: titleInput.value.trim() || undefined,
    applyLink: applyLink || undefined,
    detailsUrl: detailsUrl || capturedDetailsUrl || undefined,
    source: capturedSource || new URL(detailsUrl || applyLink).hostname,
  };

  saveButton.disabled = true;
  if (openJobLink) openJobLink.hidden = true;
  setMessage("Saving…");
  try {
    const stored = await chrome.storage.local.get("apiUrl");
    const apiUrl = stored.apiUrl ?? DEFAULT_API_URL;
    const request = () => fetch(`${apiUrl}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(job),
      });
    let response = await request();
    if (response.status === 401) {
      const refresh = await fetch(`${apiUrl}/auth/refresh`, { method: "POST", credentials: "include" });
      if (refresh.ok) response = await request();
    }
    if (response.status === 401) {
      const frontendUrl = stored.frontendUrl ?? DEFAULT_FRONTEND_URL;
      showSignInLink(frontendUrl);
      throw new Error("Sign in to Job Hunti, then reopen the extension.");
    }
    const storedFrontendUrl = stored.frontendUrl ?? DEFAULT_FRONTEND_URL;
    if (response.status === 409) {
      const duplicate = await response.json() as { data?: { id?: string } };
      if (duplicate.data?.id) showJobLink(storedFrontendUrl, duplicate.data.id);
      await clearDraft();
      setMessage("Job already saved.");
      return;
    }
    if (!response.ok) throw new Error("Unable to save this job right now.");
    const payload = await response.json() as { data?: { id?: string } };
    if (payload.data?.id) showJobLink(storedFrontendUrl, payload.data.id);
    await clearDraft();
    setMessage("Job saved to Job Hunti.", "success");
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "Unable to save this job right now.", "error");
  } finally {
    saveButton.disabled = false;
  }
}

form?.addEventListener("submit", saveJob);
document.querySelectorAll<HTMLButtonElement>("[data-selection-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.selectionTarget;
    if (target === "company" || target === "title") void useSelectedText(target);
  });
});

[companyInput, titleInput, applyLinkInput, detailsUrlInput].forEach((input) => {
  input?.addEventListener("input", () => void persistDraft());
});

async function initializePopup(): Promise<void> {
  await Promise.all([loadAccount(), captureActiveTab()]);
  await applyPendingSelection();
}

void initializePopup();
