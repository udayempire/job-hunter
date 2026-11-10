"use client";

import { useState } from "react";
import { deleteJob } from "../lib/jobs-api";
import { Icon } from "./icon";

export function DeleteJobButton({
  jobId,
  jobTitle,
  onDeleted,
  variant = "icon",
}: {
  jobId: string;
  jobTitle: string;
  onDeleted: () => void;
  variant?: "icon" | "text";
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function openDialog() {
    if (deleting) return;
    setError("");
    setOpen(true);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteJob(jobId);
      onDeleted();
    } catch {
      setError("Unable to delete this job. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        disabled={deleting}
        aria-label={`Delete ${jobTitle}`}
        title="Delete"
        className={variant === "icon"
          ? "inline-grid size-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--control)] text-[var(--copy)] transition hover:border-[var(--error)] hover:text-[var(--error)] disabled:cursor-wait disabled:opacity-50"
          : "inline-flex items-center gap-1.5 border border-[var(--error)]/40 bg-[var(--control)] px-3 py-2 text-sm font-medium text-[var(--error)] transition hover:bg-[var(--error)]/10 disabled:cursor-wait disabled:opacity-50"}
      >
        <Icon name="trash" size={variant === "icon" ? 14 : 16} />
        {variant === "text" && (deleting ? "Deleting…" : "Delete")}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[110] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-job-title-${jobId}`}
          aria-describedby={`delete-job-description-${jobId}`}
        >
          <div className="w-full max-w-md border border-[var(--border)] bg-[var(--paper)] p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--error)]">
              Delete job
            </p>
            <h2
              id={`delete-job-title-${jobId}`}
              className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]"
            >
              Delete this opportunity?
            </h2>
            <p
              id={`delete-job-description-${jobId}`}
              className="mt-3 text-sm leading-6 text-[var(--copy)]"
            >
              “{jobTitle}” will be permanently removed. This action cannot be
              undone.
            </p>
            {error && <p className="mt-4 text-sm text-[var(--error)]">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="border border-[var(--border)] bg-[var(--control)] px-4 py-2.5 text-sm font-semibold text-[var(--copy)] transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="border border-[var(--error)] bg-[var(--error)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
