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
        <span className="inline-grid size-9 place-items-center rounded-full bg-[#faf6f1] text-[#6d4d3a] transition hover:bg-[#f1e5db]">
          <Icon name="edit" size={16} />
        </span>
      }
    />
  );
}
