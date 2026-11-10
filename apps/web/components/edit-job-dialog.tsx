"use client";

import { updateJob } from "../lib/jobs-api";
import type { JobDetails } from "../lib/jobs-api";
import type { Job } from "./types";
import { AddJobDialog } from "./add-job-dialog";
import { Icon } from "./icon";

export function EditJobDialog({
  job,
  onSaved,
  variant = "icon",
}: {
  job: Job;
  onSaved: (job: JobDetails) => void;
  variant?: "icon" | "action";
}) {
  return (
    <AddJobDialog
      initialJob={job}
      onAdd={async (draft) => {
        const updated = await updateJob(job.id, draft);
        onSaved(updated);
      }}
      trigger={
        <span
          className={
            variant === "action"
              ? "inline-flex items-center gap-1.5 border border-[var(--gold-border)] bg-[var(--control)] px-3 py-2 text-sm font-medium text-[var(--gold-ink)] transition hover:bg-[var(--gold-surface)]"
              : "inline-grid size-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--control)] text-[var(--copy)] transition hover:bg-zinc-800"
          }
        >
          <Icon name="edit" size={variant === "action" ? 16 : 14} />
          {variant === "action" && "Edit"}
        </span>
      }
    />
  );
}
