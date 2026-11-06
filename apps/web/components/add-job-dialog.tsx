"use client";

import { useRef, useState } from "react";
import { Icon } from "./icon";
import type { Job } from "./types";

export function AddJobDialog({ onAdd }: { onAdd: (job: Job) => Promise<void> | void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function addJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const company = String(form.get("company") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    const applyLink = String(form.get("applyLink") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();

    if (!company || !title || !applyLink) {
      setError("Company, role title, and apply link are required.");
      return;
    }

    await onAdd({ id: `job-${Date.now()}`, url: applyLink, company, title, location: "Location to review", source: "Manual entry", score: 0, status: "Saved", age: "Added just now", tags: ["Needs review"], summary: description || "No description added." });
    formRef.current?.reset();
    setError("");
    setOpen(false);
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[#292323] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#463d3b]"><Icon name="plus" size={16} /> Add job</button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211b1b]/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-job-title"><div className="relative z-10 w-full max-w-xl rounded-3xl border border-black/10 bg-[#fffdf9] p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b4b]">Capture opportunity</p><h2 id="add-job-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#292323]">Add a job to review</h2></div><button type="button" onClick={() => setOpen(false)} className="rounded-full px-2 py-1 text-xl text-[#827873] hover:bg-black/5" aria-label="Close">×</button></div><form ref={formRef} onSubmit={addJob} className="mt-5"><div className="grid gap-3 sm:grid-cols-2"><div><label htmlFor="job-company" className="mb-1.5 block text-xs font-medium text-[#6e6561]">Company</label><input autoFocus id="job-company" name="company" type="text" placeholder="e.g. Orbit Labs" className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#302a28] outline-none focus:border-[#9b6b4b]" /></div><div><label htmlFor="job-title" className="mb-1.5 block text-xs font-medium text-[#6e6561]">Role title</label><input id="job-title" name="title" type="text" placeholder="e.g. Applied AI Engineer" className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#302a28] outline-none focus:border-[#9b6b4b]" /></div></div><div className="mt-3"><label htmlFor="job-apply-link" className="mb-1.5 block text-xs font-medium text-[#6e6561]">Apply link</label><input id="job-apply-link" name="applyLink" type="url" placeholder="https://company.com/apply/…" className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#302a28] outline-none focus:border-[#9b6b4b]" /></div><div className="mt-3"><label htmlFor="job-description" className="mb-1.5 block text-xs font-medium text-[#6e6561]">Job description <span className="font-normal text-[#aaa09a]">(optional)</span></label><textarea id="job-description" name="description" placeholder="Paste the job description…" className="min-h-36 w-full resize-y rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-[#302a28] outline-none transition placeholder:text-[#aaa09a] focus:border-[#9b6b4b] focus:ring-4 focus:ring-[#9b6b4b]/10" /></div>{error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}<div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2.5 text-sm font-medium text-[#6e6561] hover:bg-black/5">Cancel</button><button type="submit" className="rounded-full bg-[#292323] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#463d3b]">Save job</button></div></form></div></div>}
  </>;
}
