"use client";

import { useState } from "react";
import { createPublicJobShareLink } from "../lib/profiles-api";
import { Icon } from "./icon";
import { useToast } from "./ui/toast";

export function PublicJobDetailsButton({
  handle,
  jobId,
}: {
  handle: string;
  jobId: string;
}) {
  const { toast } = useToast();
  const [opening, setOpening] = useState(false);

  async function openDetails() {
    setOpening(true);
    try {
      window.location.assign(await createPublicJobShareLink(handle, jobId));
    } catch {
      toast({
        title: "Could not open job details",
        description: "Please try again.",
        variant: "error",
      });
    } finally {
      setOpening(false);
    }
  }

  return (
    <button
      type="button"
      onClick={openDetails}
      disabled={opening}
      className="inline-flex items-center gap-1.5 border border-[var(--gold-border)] bg-[var(--gold-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--gold-ink)] transition hover:bg-[#483d1d] disabled:opacity-60"
    >
      {opening ? "Opening…" : <>Details <Icon name="arrow" size={13} /></>}
    </button>
  );
}
