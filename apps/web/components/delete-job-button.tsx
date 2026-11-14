"use client";

import { Button } from "./ui/button";
import { ActionButton } from "./ui/action-button";
import { useState } from "react";
import { deleteJob } from "../lib/jobs-api";
import { Icon } from "./icon";
import { useToast } from "./ui/toast";

export function DeleteJobButton({
  jobId,
  jobTitle,
  onDeleted,
  variant = "icon",
}: {
  jobId: string;
  jobTitle: string;
  onDeleted: () => void;
  variant?: "icon" | "text" | "menu";
}) {
  const { toast } = useToast();
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
      toast({
        title: "Job deleted",
        description: `“${jobTitle}” was removed from your board.`,
      });
    } catch {
      setError("Unable to delete this job. Please try again.");
      setDeleting(false);
      toast({
        title: "Could not delete job",
        description: "Your job is still on the board. Please try again.",
        variant: "error",
      });
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <ActionButton tone="destructive" onClick={openDialog} disabled={deleting} aria-label={`Delete ${jobTitle}`} title="Delete" className="disabled:cursor-wait">
          <Icon name="trash" size={14} />
        </ActionButton>
      ) : (
        <Button variant={variant === "menu" ? "unstyled" : "destructive"}
          onClick={openDialog}
          disabled={deleting}
          aria-label={`Delete ${jobTitle}`}
          title="Delete"
          className={variant === "menu" ? "flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[var(--error)] hover:bg-[var(--control)] disabled:cursor-wait" : "inline-flex items-center disabled:cursor-wait"}
        >
          <Icon name="trash" size={16} />
          {deleting ? "Deleting…" : variant === "menu" ? "Delete job" : "Delete"}
        </Button>
      )}
      {open && (
        <div
          className="fixed inset-0 z-[130] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-job-title-${jobId}`}
          aria-describedby={`delete-job-description-${jobId}`}
        >
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto border border-[var(--border)] bg-[var(--paper)] p-4 shadow-2xl sm:p-6">
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
              <Button variant="outline"
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="disabled:cursor-wait"
              >
                Cancel
              </Button>
              <Button variant="destructive"
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="disabled:cursor-wait"
              >
                {deleting ? "Deleting…" : "Delete job"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
