import type { CapturedJob, ContentResponse } from "./types";

const companyInput = document.querySelector<HTMLInputElement>("#company");
const titleInput = document.querySelector<HTMLInputElement>("#title");
const applyLinkInput = document.querySelector<HTMLInputElement>("#applyLink");
const form = document.querySelector<HTMLFormElement>("#job-form");
const saveButton = document.querySelector<HTMLButtonElement>("#save");
const message = document.querySelector<HTMLParagraphElement>("#message");
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
  setMessage("Saving…");
  try {
    const stored = await chrome.storage.local.get("apiUrl");
    const response = await fetch(`${stored.apiUrl ?? "http://localhost:4000/api"}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(job),
    });
    if (response.status === 401) throw new Error("Sign in to Job Hunti before saving from the extension.");
    if (response.status === 409) throw new Error("This job is already in your tracker.");
    if (!response.ok) throw new Error("Unable to save this job right now.");
    setMessage("Job saved to Job Hunti.", "success");
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "Unable to save this job right now.", "error");
  } finally {
    saveButton.disabled = false;
  }
}

form?.addEventListener("submit", saveJob);
void captureActiveTab();
