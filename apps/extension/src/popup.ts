import type { CapturedJob, ContentResponse, PopupDraft } from "./types";
import { DEFAULT_API_URL, DEFAULT_FRONTEND_URL } from "./config";

const companyInput = document.querySelector<HTMLInputElement>("#company");
const titleInput = document.querySelector<HTMLInputElement>("#title");
const applyLinkInput = document.querySelector<HTMLInputElement>("#applyLink");
const detailsUrlInput = document.querySelector<HTMLInputElement>("#detailsUrl");
const salaryInput = document.querySelector<HTMLInputElement>("#salary");
const locationInput = document.querySelector<HTMLInputElement>("#location");
const descriptionInput = document.querySelector<HTMLTextAreaElement>("#description");
const companyWebsiteInput = document.querySelector<HTMLInputElement>("#companyWebsite");
const companyLinkedinInput = document.querySelector<HTMLInputElement>("#companyLinkedin");
const companyXInput = document.querySelector<HTMLInputElement>("#companyX");
const personalNotesInput = document.querySelector<HTMLTextAreaElement>("#personalNotes");
const visibilityToggle = document.querySelector<HTMLButtonElement>("#visibility-toggle");
const form = document.querySelector<HTMLFormElement>("#job-form");
const saveButton = document.querySelector<HTMLButtonElement>("#save");
const signInLink = document.querySelector<HTMLAnchorElement>("#sign-in");
const openJobLink = document.querySelector<HTMLAnchorElement>("#open-job");
const message = document.querySelector<HTMLParagraphElement>("#message");
const accountLabel = document.querySelector<HTMLParagraphElement>("#account");
const accountLink = document.querySelector<HTMLAnchorElement>("#account-link");
let capturedDetailsUrl = "";
let capturedSource = "";
let visibility: "PRIVATE" | "PROFILE" = "PRIVATE";
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
  if (salaryInput) salaryInput.value = job.salary ?? "";
  if (locationInput) locationInput.value = job.location ?? "";
  if (descriptionInput) descriptionInput.value = job.description ?? "";
  if (companyWebsiteInput) companyWebsiteInput.value = job.companyWebsite ?? "";
  if (companyLinkedinInput) companyLinkedinInput.value = job.companyLinkedin ?? "";
  if (companyXInput) companyXInput.value = job.companyX ?? "";
  if (personalNotesInput) personalNotesInput.value = job.personalNotes ?? "";
  setVisibility(job.visibility ?? "PRIVATE");
  capturedDetailsUrl = job.detailsUrl ?? "";
  capturedSource = job.source ?? "";
}

function setVisibility(nextVisibility: "PRIVATE" | "PROFILE"): void {
  visibility = nextVisibility;
  if (!visibilityToggle) return;
  const isPublic = visibility === "PROFILE";
  visibilityToggle.textContent = isPublic ? "Public profile" : "Private";
  visibilityToggle.setAttribute("aria-pressed", String(isPublic));
}

function currentDraft(): PopupDraft {
  return {
    company: companyInput?.value.trim() || undefined,
    title: titleInput?.value.trim() || undefined,
    applyLink: applyLinkInput?.value.trim() || undefined,
    detailsUrl: detailsUrlInput?.value.trim() || undefined,
    salary: salaryInput?.value.trim() || undefined,
    location: locationInput?.value.trim() || undefined,
    description: descriptionInput?.value.trim() || undefined,
    companyWebsite: companyWebsiteInput?.value.trim() || undefined,
    companyLinkedin: companyLinkedinInput?.value.trim() || undefined,
    companyX: companyXInput?.value.trim() || undefined,
    personalNotes: personalNotesInput?.value.trim() || undefined,
    visibility,
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
  openJobLink.textContent = "Update more details in Job Hunti";
  openJobLink.hidden = false;
}

async function loadAccount(): Promise<void> {
  const apiUrl = DEFAULT_API_URL;
  const frontendUrl = DEFAULT_FRONTEND_URL;

  try {
    let response = await fetch(`${apiUrl}/auth/me`, { credentials: "include", cache: "no-store" });
    if (response.status === 401) {
      const refresh = await fetch(`${apiUrl}/auth/refresh`, { method: "POST", credentials: "include" });
      if (refresh.ok) {
        response = await fetch(`${apiUrl}/auth/me`, { credentials: "include", cache: "no-store" });
      }
    }
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
    fillForm({ detailsUrl: tab.url, title: tab.title });
    await restoreDraft(tab.url);
    setMessage("This page needs a quick manual review.");
  }
}

type SelectionTarget = "company" | "title" | "salary" | "location" | "description" | "personalNotes";

function setSelectedValue(target: SelectionTarget, value: string): void {
  const input = {
    company: companyInput,
    title: titleInput,
    salary: salaryInput,
    location: locationInput,
    description: descriptionInput,
    personalNotes: personalNotesInput,
  }[target];
  if (input) input.value = value;
}

function selectionLabel(target: SelectionTarget): string {
  return target === "personalNotes" ? "personal details" : target === "title" ? "role" : target;
}

async function useSelectedText(target: SelectionTarget): Promise<void> {
  const stored = await chrome.storage.session.get("pendingSelection");
  const storedSelection = typeof stored.pendingSelection === "string" ? stored.pendingSelection : "";
  if (storedSelection) {
    setSelectedValue(target, storedSelection);
    await chrome.storage.session.remove(["pendingSelection", "pendingSelectionTarget"]);
    await persistDraft();
    setMessage(`Selected text used as ${selectionLabel(target)}.`, "success");
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
    setSelectedValue(target, response.selection);
    await persistDraft();
    setMessage(`Selected text used as ${selectionLabel(target)}.`, "success");
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

  setSelectedValue(target, selection);
  await chrome.storage.session.remove(["pendingSelection", "pendingSelectionTarget"]);
  await persistDraft();
  setMessage(`Selected text used as ${selectionLabel(target)}.`, "success");
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
    salary: salaryInput?.value.trim() || undefined,
    location: locationInput?.value.trim() || undefined,
    description: descriptionInput?.value.trim() || undefined,
    companyWebsite: companyWebsiteInput?.value.trim() || undefined,
    companyLinkedin: companyLinkedinInput?.value.trim() || undefined,
    companyX: companyXInput?.value.trim() || undefined,
    personalNotes: personalNotesInput?.value.trim() || undefined,
    visibility,
    source: capturedSource || new URL(detailsUrl || applyLink).hostname,
  };

  saveButton.disabled = true;
  if (openJobLink) openJobLink.hidden = true;
  setMessage("Saving…");
  try {
    const apiUrl = DEFAULT_API_URL;
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
      showSignInLink(DEFAULT_FRONTEND_URL);
      throw new Error("Sign in to Job Hunti, then reopen the extension.");
    }
    if (response.status === 409) {
      const duplicate = await response.json() as { data?: { id?: string } };
      if (duplicate.data?.id) showJobLink(DEFAULT_FRONTEND_URL, duplicate.data.id);
      await clearDraft();
      setMessage("Job already saved.");
      return;
    }
    if (!response.ok) throw new Error("Unable to save this job right now.");
    const payload = await response.json() as { data?: { id?: string } };
    if (payload.data?.id) showJobLink(DEFAULT_FRONTEND_URL, payload.data.id);
    await clearDraft();
    setMessage("Job saved to Job Hunti. You can update more details there.", "success");
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
    if (target === "company" || target === "title" || target === "salary" || target === "location" || target === "description" || target === "personalNotes") {
      void useSelectedText(target);
    }
  });
});

[companyInput, titleInput, applyLinkInput, detailsUrlInput, salaryInput, locationInput, descriptionInput, companyWebsiteInput, companyLinkedinInput, companyXInput, personalNotesInput].forEach((input) => {
  input?.addEventListener("input", () => void persistDraft());
});

visibilityToggle?.addEventListener("click", () => {
  setVisibility(visibility === "PRIVATE" ? "PROFILE" : "PRIVATE");
  void persistDraft();
});

document.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;
    if (tab !== "job" && tab !== "more") return;
    document.querySelectorAll<HTMLElement>("[data-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.panel !== tab;
    });
    document.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((tabButton) => {
      const active = tabButton.dataset.tab === tab;
      tabButton.classList.toggle("active", active);
      tabButton.setAttribute("aria-selected", String(active));
    });
  });
});

async function initializePopup(): Promise<void> {
  await Promise.all([loadAccount(), captureActiveTab()]);
  await applyPendingSelection();
}

void initializePopup();
