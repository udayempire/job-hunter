"use client";

import Link from "next/link";
import { Dashboard } from "../components/dashboard";
import { useAuth } from "../components/auth-provider";

const examples = [
  { company: "Northstar", role: "Product Engineer", location: "Remote", status: "Review" },
  { company: "Forma", role: "Frontend Developer", location: "Bengaluru", status: "Applied" },
  { company: "Fieldwork", role: "Software Engineer", location: "Hybrid", status: "Saved" },
];

function WorkspacePreview() {
  return (
    <div className="overflow-hidden border border-[#504b3c] bg-[#20201e] text-left shadow-[0_30px_80px_rgba(0,0,0,.3)]">
      <div className="flex items-center justify-between border-b border-[#3a3934] px-5 py-4"><span className="text-sm font-semibold text-[#f4f1e8]">Your workspace</span><span className="text-xs text-[#aaa69b]">Example view</span></div>
      <div className="px-5 pb-5 pt-6">
        <p className="font-serif text-xl text-[#f4f1e8]">Jobs worth your attention</p>
        <p className="mt-1 text-xs text-[#aaa69b]">Your opportunities, all in one place.</p>
        <div className="mt-5 overflow-x-auto border border-[#3a3934]">
          <table className="w-full min-w-[460px] text-left text-xs"><thead className="bg-[#292925] text-[#aaa69b]"><tr>{["Company", "Role", "Location", "Status"].map((heading) => <th className="px-4 py-3 font-medium" key={heading}>{heading}</th>)}</tr></thead><tbody>{examples.map((job) => <tr key={job.company} className="border-t border-[#3a3934] text-[#d3d0c7]"><td className="px-4 py-4 font-semibold text-[#f4f1e8]">{job.company}</td><td className="px-4 py-4">{job.role}</td><td className="px-4 py-4">{job.location}</td><td className="px-4 py-4"><span className={job.status === "Applied" ? "bg-[#342f1b] px-2 py-1 text-[#e7c75f]" : "bg-[#30302c] px-2 py-1"}>{job.status}</span></td></tr>)}</tbody></table>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-[#aaa69b]"><span>Everything you need to pick up where you left off.</span><span className="text-[#e7c75f]">View details ↗</span></div>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <main className="min-h-screen bg-[#171715] text-[#f4f1e8]">
      <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-[#3a3934] px-5 py-6 sm:px-8"><Link href="/" className="text-xl font-semibold tracking-tight">Job <span className="text-[#e0b63d]">Hunti</span><span className="text-[#e0b63d]">.</span></Link><nav className="hidden items-center gap-8 text-sm text-[#c0bdb3] sm:flex"><a href="#how-it-works" className="hover:text-white">How it works</a><a href="#sharing" className="hover:text-white">Sharing</a></nav><Link href="/login" className="border border-[#70602b] px-4 py-2 text-sm font-semibold text-[#e7c75f] hover:bg-[#342f1b]">Sign in ↗</Link></header>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-20 sm:px-8 lg:grid-cols-[1fr_1.08fr] lg:gap-16 lg:pb-28 lg:pt-28"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7c75f]">A calmer job search</p><h1 className="mt-6 max-w-2xl font-serif text-5xl leading-[1.08] tracking-[-0.045em] sm:text-6xl">Keep the opportunities <span className="text-[#e0b63d]">worth pursuing</span> in one place.</h1><p className="mt-6 max-w-xl text-base leading-7 text-[#c0bdb3] sm:text-lg">Save roles, keep company and recruiter details close, and track where each application stands. Share your search only when you choose.</p><div className="mt-9 flex flex-wrap items-center gap-6"><Link href="/login" className="bg-[#e0b63d] px-6 py-3.5 text-sm font-semibold text-[#171715] transition hover:bg-[#cfa62d]">Start your workspace ↗</Link><a href="#how-it-works" className="text-sm font-medium text-[#d6d2c6] hover:text-white">See how it works ↓</a></div></div><WorkspacePreview /></section>
      <div className="border-y border-[#3a3934] bg-[#20201e]"><div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 text-sm text-[#c0bdb3] sm:grid-cols-3 sm:px-8"><span><span className="mr-3 text-[#e0b63d]">✳</span>Private by default</span><span><span className="mr-3 text-[#e0b63d]">✳</span>Made for intentional applications</span><span><span className="mr-3 text-[#e0b63d]">✳</span>Share what you choose</span></div></div>
      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"><div className="grid gap-6 md:grid-cols-2"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7c75f]">How it works</p><h2 className="max-w-xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">From a promising link to a clear next step.</h2></div><div className="mt-14 grid border-t border-[#3a3934] md:grid-cols-3">{[["01", "Save the role", "Add the company, role and application link as soon as you find an opportunity worth considering."], ["02", "Keep the context", "Bring the job description, company links, recruiter contacts and your own notes together."], ["03", "Move it forward", "See where each opportunity stands, return to the details and take the next step when you’re ready."]].map(([number,title,body]) => <div key={number} className="border-b border-[#3a3934] py-8 pr-8 md:border-b-0 md:border-r md:pl-8 first:pl-0 last:border-r-0"><span className="text-sm text-[#e0b63d]">{number}</span><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 max-w-sm text-sm leading-7 text-[#aaa69b]">{body}</p></div>)}</div></section>
      <section className="border-y border-[#3a3934] bg-[#20201e]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-24"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7c75f]">The details matter</p><h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">More than a link you saved and forgot.</h2><p className="mt-6 max-w-lg leading-7 text-[#c0bdb3]">Keep the details that make an opportunity useful: the role, company, recruiter contacts and your own notes. When you come back, the context is there with you.</p><p className="mt-5 text-sm text-[#e7c75f]">Your personal notes stay private.</p></div><div className="border border-[#3a3934] bg-[#171715] p-7"><p className="text-xs uppercase tracking-[0.17em] text-[#e7c75f]">Opportunity details</p><div className="mt-6 border-b border-[#3a3934] pb-5"><p className="text-sm text-[#aaa69b]">Company</p><p className="mt-1 text-xl font-semibold">Northstar</p><p className="mt-1 text-sm text-[#c0bdb3]">Product Engineer</p></div><div className="grid grid-cols-2 gap-6 border-b border-[#3a3934] py-5 text-sm"><div><span className="text-[#aaa69b]">Status</span><p className="mt-2 text-[#e7c75f]">In review</p></div><div><span className="text-[#aaa69b]">Contact</span><p className="mt-2">Recruiter profile ↗</p></div></div><p className="mt-5 text-xs text-[#aaa69b]">Illustrative example</p></div></div></section>
      <section id="sharing" className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7c75f]">Share opportunities</p><h2 className="mt-5 max-w-lg font-serif text-4xl leading-tight sm:text-5xl">One profile for the opportunities you share.</h2></div><div className="lg:pt-10"><p className="max-w-lg text-lg leading-8 text-[#c0bdb3]">If you regularly share openings from different companies on social media, bring them together on your public profile. Share one profile link so others can explore the opportunities you’ve chosen to show.</p><p className="mt-5 max-w-lg text-sm leading-7 text-[#aaa69b]">You can also share an individual job. Your private jobs and personal notes stay out of public views.</p><div className="mt-8 border-t border-[#3a3934] pt-6 text-sm text-[#aaa69b]">Need a copy? Export your visible jobs to an Excel-compatible file.</div></div></section>
      <section className="border-t border-[#3a3934] bg-[#29271d]"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7c75f]">Make space for what matters</p><h2 className="mt-4 font-serif text-4xl sm:text-5xl">A better home for your job search.</h2></div><Link href="/login" className="shrink-0 bg-[#e0b63d] px-6 py-3.5 text-sm font-semibold text-[#171715] hover:bg-[#cfa62d]">Start your workspace ↗</Link></div></section><footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-5 py-8 text-sm text-[#aaa69b] sm:px-8"><span>Job Hunti.</span><span>A little more clarity for the road ahead.</span></footer>
    </main>
  );
}

export default function Page() {
  const { user, loading } = useAuth();
  if (loading) return <main className="min-h-screen bg-[var(--canvas)]" aria-label="Loading" />;
  return user ? <Dashboard /> : <Landing />;
}
