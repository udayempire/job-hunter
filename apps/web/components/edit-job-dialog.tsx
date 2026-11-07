"use client";

import { updateJob } from "../lib/jobs-api";
import type { Job } from "./types";
import { AddJobDialog } from "./add-job-dialog";
import { Icon } from "./icon";

export function EditJobDialog({
  job,
  onSaved,
}: {
  job: Job;
  onSaved: (job: Job) => void;
}) {
  return (
    <AddJobDialog
      initialJob={job}
      onAdd={async (draft) => {
        const updated = await updateJob(job.id, draft);
        onSaved(updated);
      }}
      trigger={
        <span className="inline-grid size-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--control)] text-[var(--copy)] transition hover:bg-zinc-800">
          <Icon name="edit" size={14} />
        </span>
      }
    />
  );
}
