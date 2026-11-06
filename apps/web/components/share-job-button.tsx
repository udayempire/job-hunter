"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createJobShareLink } from "../lib/jobs-api";
import { Icon } from "./icon";

export function ShareJobButton({
  jobId,
  variant = "default",
}: {
  jobId: string;
  variant?: "default" | "light" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function openShareDialog() {
    setOpen(true);
    setCopied(false);
    setError("");
    if (url) return;
    setLoading(true);
    try {
      const shareUrl = await createJobShareLink(jobId);
      setUrl(shareUrl);
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
      } catch {
        // The link remains visible so it can still be copied manually.
      }
    } catch {
      setError("Could not create the share link. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
  }

  const buttonClass =
    variant === "light"
      ? "bg-white text-[#6d4d3a] hover:bg-[#f4ece5]"
      : "bg-[#faf6f1] text-[#6d4d3a] hover:bg-[#f1e5db]";
  const dialog = open && (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#211b1b]/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-job-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-[#fffdf9] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b4b]">
              Share opportunity
            </p>
            <h2
              id="share-job-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#292323]"
            >
              Send this job to someone
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full px-2 py-1 text-xl text-[#827873] hover:bg-black/5"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#847a74]">
          Anyone with this link can view the job. Your personal notes are never
          included.
        </p>
        {loading ? (
          <div className="mt-6 h-12 animate-pulse rounded-xl bg-[#eee6df]" />
        ) : error ? (
          <p className="mt-6 text-sm text-red-700">{error}</p>
        ) : (
          <div className="mt-6 flex gap-2">
            <input
              readOnly
              value={url}
              className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-3 py-3 text-xs text-[#625954] outline-none"
              aria-label="Share link"
            />
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#292323] px-3 py-3 text-sm font-semibold text-white transition hover:bg-[#3b3330]"
            >
              <Icon name="copy" size={16} />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-5 w-full rounded-full px-4 py-2.5 text-sm font-medium text-[#6e6561] hover:bg-black/5"
        >
          Done
        </button>
      </div>
    </div>
  );
  return (
    <>
      <button
        type="button"
        onClick={openShareDialog}
        aria-label="Share job"
        title="Share job"
        className={
          variant === "icon"
            ? "inline-grid size-9 place-items-center rounded-full bg-[#faf6f1] text-[#6d4d3a] transition hover:bg-[#f1e5db]"
            : `inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${buttonClass}`
        }
      >
        <Icon name="share" size={16} />
        {variant !== "icon" && "Share job"}
      </button>
      {mounted && open && createPortal(dialog, document.body)}
    </>
  );
}
