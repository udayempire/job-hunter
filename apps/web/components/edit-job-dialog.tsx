"use client";

import { updateJob } from "../lib/jobs-api";
import type { JobDetails } from "../lib/jobs-api";
import type { Job } from "./types";
import { AddJobDialog } from "./add-job-dialog";
import { Icon } from "./icon";
import { actionButtonClass } from "./ui/action-button";

export function EditJobDialog({
  job,
  onSaved,
  variant = "icon",
}: {
  job: Job;
  onSaved: (job: JobDetails) => void;
  variant?: "icon" | "action" | "menu";
}) {
  return (
    <AddJobDialog
      initialJob={job}
      triggerClassName={variant === "icon" ? "inline-grid size-8 place-items-center align-middle" : variant === "menu" ? "block w-full text-left" : "inline-flex align-middle"}
      onAdd={async (draft) => {
        const updated = await updateJob(job.id, draft);
        onSaved(updated);
      }}
      trigger={
        <span
          className={
            variant === "menu"
              ? "flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[var(--ink)] hover:bg-[var(--control)]"
              : variant === "action"
              ? "inline-flex items-center gap-1.5 border border-[var(--gold-border)] bg-[var(--control)] px-3 py-2 text-sm font-medium text-[var(--gold-ink)] transition hover:bg-[var(--gold-surface)]"
              : actionButtonClass()
          }
        >
          <Icon name="edit" size={variant === "icon" ? 14 : 18} />
          {variant !== "icon" && (variant === "menu" ? "Edit job" : "Edit")}
        </span>
      }
    />
  );
}
