"use client";

import { useState } from "react";
import { Icon } from "./icon";
import type { Job } from "./types";

export function AddJobDialog({ onAdd }: { onAdd: (job: Job) => void }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  function addJob() {
    if (!description.trim()) return;
    onAdd({ id: `job-${Date.now()}`, company: "New opportunity", title: "Review pasted job description", location: "Location to review", source: "Manual entry", score: 0, status: "Saved", age: "Added just now", tags: ["Needs review"], summary: description.trim().slice(0, 120) });
    setDescription(""); setOpen(false);
  }
  return <>
    <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[#292323] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#463d3b]"><Icon name="plus" size={16} /> Add job</button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211b1b]/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="add-job-title"><div className="w-full max-w-xl rounded-3xl border border-black/10 bg-[#fffdf9] p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b4b]">Capture opportunity</p><h2 id="add-job-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#292323]">Add a job to review</h2></div><button onClick={() => setOpen(false)} className="rounded-full px-2 py-1 text-xl text-[#827873] hover:bg-black/5" aria-label="Close">×</button></div><p className="mt-3 text-sm leading-6 text-[#756c67]">Paste a job description now. AI matching and URL extraction will connect to this form next.</p><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Paste the job description or application URL…" className="mt-5 min-h-36 w-full resize-y rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 outline-none transition placeholder:text-[#aaa09a] focus:border-[#9b6b4b] focus:ring-4 focus:ring-[#9b6b4b]/10" /><div className="mt-5 flex justify-end gap-3"><button onClick={() => setOpen(false)} className="rounded-full px-4 py-2.5 text-sm font-medium text-[#6e6561] hover:bg-black/5">Cancel</button><button onClick={addJob} className="rounded-full bg-[#292323] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#463d3b]">Save job</button></div></div></div>}
  </>;
}
