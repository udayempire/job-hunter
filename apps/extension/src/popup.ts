import type { CapturedJob, ContentResponse } from "./types";

const companyInput = document.querySelector<HTMLInputElement>("#company");
const titleInput = document.querySelector<HTMLInputElement>("#title");
const applyLinkInput = document.querySelector<HTMLInputElement>("#applyLink");
const form = document.querySelector<HTMLFormElement>("#job-form");
const saveButton = document.querySelector<HTMLButtonElement>("#save");
const signInLink = document.querySelector<HTMLAnchorElement>("#sign-in");
const openJobLink = document.querySelector<HTMLAnchorElement>("#open-job");
const message = document.querySelector<HTMLParagraphElement>("#message");
const accountLabel = document.querySelector<HTMLParagraphElement>("#account");
const accountLink = document.querySelector<HTMLAnchorElement>("#account-link");
let capturedDetailsUrl = "";
let capturedSource = "";

function setMessage(text: string, kind?: "error" | "success"): void {
  if (!message) return;
  message.textContent = text;
  message.className = kind ? `message ${kind}` : "message";
}

function fillForm(job: ContentResponse): void {
  if (companyInput) companyInput.value = job.company ?? "";
  if (titleInput) titleInput.value = job.title ?? "";
  if (applyLinkInput) applyLinkInput.value = job.applyLink ?? "";
  capturedDetailsUrl = job.detailsUrl ?? job.applyLink ?? "";
  capturedSource = job.source ?? "";
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
  const apiUrl = stored.apiUrl ?? "http://localhost:4000/api";
  const frontendUrl = stored.frontendUrl ?? "http://localhost:3001";

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
    const captured = await chrome.tabs.sendMessage<unknown, ContentResponse>(tab.id, { type: "extract-job" });
    fillForm(captured);
  } catch {
    fillForm({ applyLink: tab.url, title: tab.title });
    setMessage("This page needs a quick manual review.");
  }
}

async function saveJob(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!companyInput || !titleInput || !applyLinkInput || !saveButton) return;

  const job: CapturedJob = {
    company: companyInput.value.trim(),
    title: titleInput.value.trim(),
    applyLink: applyLinkInput.value.trim(),
    detailsUrl: capturedDetailsUrl || applyLinkInput.value.trim(),
    source: capturedSource || new URL(applyLinkInput.value).hostname,
  };

  saveButton.disabled = true;
  if (openJobLink) openJobLink.hidden = true;
  setMessage("Saving…");
  try {
    const stored = await chrome.storage.local.get("apiUrl");
    const apiUrl = stored.apiUrl ?? "http://localhost:4000/api";
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
      const frontendUrl = stored.frontendUrl ?? "http://localhost:3001";
      showSignInLink(frontendUrl);
      throw new Error("Sign in to Job Hunti, then reopen the extension.");
    }
    const storedFrontendUrl = stored.frontendUrl ?? "http://localhost:3001";
    if (response.status === 409) {
      const duplicate = await response.json() as { data?: { id?: string } };
      if (duplicate.data?.id) showJobLink(storedFrontendUrl, duplicate.data.id);
      setMessage("Job already saved.");
      return;
    }
    if (!response.ok) throw new Error("Unable to save this job right now.");
    const payload = await response.json() as { data?: { id?: string } };
    if (payload.data?.id) showJobLink(storedFrontendUrl, payload.data.id);
    setMessage("Job saved to Job Hunti.", "success");
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "Unable to save this job right now.", "error");
  } finally {
    saveButton.disabled = false;
  }
}

form?.addEventListener("submit", saveJob);
void loadAccount();
void captureActiveTab();
