"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createJobShareLink } from "../lib/jobs-api";
import {
  buildJobShareText,
  getJobShareDestinations,
  type JobShareDetails,
} from "../lib/job-share";
import { Icon } from "./icon";

export function ShareJobButton({
  jobId,
  job,
  variant = "default",
}: {
  jobId: string;
  job?: JobShareDetails;
  variant?: "default" | "light" | "icon" | "action";
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

  async function shareWithDevice() {
    if (!url || !job || !navigator.share) return;
    try {
      await navigator.share({
        title: `${job.title} at ${job.company}`,
        text: buildJobShareText(job),
        url,
      });
    } catch {
      // Closing the system share sheet is an expected user action.
    }
  }

  const destinations = url && job ? getJobShareDestinations(job, url) : null;

  const buttonClass =
    variant === "action"
      ? "border border-[#477fb5] bg-[var(--control)] text-[#9dccf5] hover:bg-[#263f5d]"
      : variant === "light"
      ? "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--control)]"
      : "bg-[var(--control)] text-[var(--ink)] hover:bg-zinc-800";
  const dialog = open && (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-job-title"
    >
      <div className="w-full max-w-md border border-[var(--border)] bg-[var(--paper)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-ink)]">
              Share opportunity
            </p>
            <h2
              id="share-job-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]"
            >
              Send this job to someone
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-2 py-1 text-xl text-[var(--muted)] hover:bg-[var(--control)] hover:text-[var(--ink)]"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--copy)]">
          Anyone with this link can view the job. Your personal notes are never
          included.
        </p>
        {loading ? (
          <div className="mt-6 h-12 animate-pulse bg-[var(--control)]" />
        ) : error ? (
          <p className="mt-6 text-sm text-red-700">{error}</p>
        ) : (
          <>
            <div className="mt-6 flex gap-2">
              <input
                readOnly
                value={url}
                className="min-w-0 flex-1 border border-[var(--border)] bg-[var(--canvas)] px-3 py-3 text-xs text-[var(--copy)] outline-none"
                aria-label="Share link"
              />
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex shrink-0 items-center gap-2 border border-[#32634b] bg-[#1f4d3a] px-3 py-3 text-sm font-semibold text-[#e9f5eb] transition hover:bg-[#173b2e]"
              >
                <Icon name="copy" size={16} />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            {destinations && (
              <div className="mt-4">
                <p className="text-xs text-[var(--muted)]">Share on these platforms</p>
                <div className="mt-2 flex items-center gap-3">
                  <a
                    href={destinations.x}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Share on X"
                    title="Share on X"
                    className="inline-grid size-[34px] place-items-center transition hover:opacity-70"
                  >
                    <img src="/social-icons/x.png" alt="" className="size-[34px] object-contain" />
                  </a>
                  <a
                    href={destinations.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Share on WhatsApp"
                    title="Share on WhatsApp"
                    className="inline-grid size-[34px] place-items-center transition hover:opacity-70"
                  >
                    <img src="/social-icons/whatsapp.png" alt="" className="size-[34px] object-contain" />
                  </a>
                  {typeof navigator !== "undefined" && "share" in navigator && (
                    <button
                      type="button"
                      onClick={() => void shareWithDevice()}
                      className="border border-[var(--border)] bg-[var(--control)] px-3 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-zinc-800"
                    >
                      More
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-5 w-full px-4 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--control)] hover:text-[var(--ink)]"
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
            ? "inline-grid size-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--control)] text-[var(--copy)] transition hover:bg-zinc-800"
            : variant === "action"
              ? `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition ${buttonClass}`
              : `inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${buttonClass}`
        }
      >
        <Icon name="share" size={16} />
        {variant !== "icon" && (variant === "action" ? "Share" : "Share job")}
      </button>
      {mounted && open && createPortal(dialog, document.body)}
    </>
  );
}
