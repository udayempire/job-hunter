"use client";

import { Button } from "./ui/button";
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
    <Button variant="secondary" size="sm"
      type="button"
      onClick={openDetails}
      disabled={opening}
      className="inline-flex items-center"
    >
      {opening ? "Opening…" : <>Details <Icon name="arrow" size={13} /></>}
    </Button>
  );
}
