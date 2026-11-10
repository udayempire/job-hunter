"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type Status = "Saved" | "Applied" | "Interview" | "Offer";

const STATUS_STYLES: Record<Status, string> = {
  Saved: "bg-[#F1E6D3] text-[#7A6450]",
  Applied: "bg-[#FBE6BF] text-[#93600F]",
  Interview: "bg-[#F7D9CB] text-[#B14A28]",
  Offer: "bg-[#E1EBD8] text-[#4A6A40]",
};

function Pill({ status, className = "" }: { status: Status; className?: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px] ${STATUS_STYLES[status]} ${className}`}
    >
      {status}
    </span>
  );
}

function CompanyMark({ name, tint }: { name: string; tint: string }) {
  return (
    <span
      className="grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold text-white"
      style={{ background: tint }}
      aria-hidden
    >
      {name[0]}
    </span>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Adds `is-visible` to every [data-reveal] element as it scrolls into view. */
function useReveal(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const elements = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    root.classList.add("lp-js");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootRef]);
}

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/* ------------------------------------------------------------------ */
/* Hero board: one job card travels Saved → Applied → Interview → Offer */
/* ------------------------------------------------------------------ */

const COLUMNS = ["Saved", "Applied", "Interview"] as const;

const PARKED: Record<(typeof COLUMNS)[number], { company: string; role: string; tint: string }[]> = {
  Saved: [{ company: "Fieldwork", role: "Software Engineer", tint: "#7FA06F" }],
  Applied: [
    { company: "Forma", role: "Frontend Developer", tint: "#D9A62E" },
    { company: "Lumen", role: "Design Engineer", tint: "#C9845F" },
  ],
  Interview: [{ company: "Kiln", role: "Full-stack Engineer", tint: "#8E7AB5" }],
};

function JobBoard() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduced) {
      setPhase(3);
      return;
    }
    const id = window.setInterval(() => setPhase((p) => (p + 1) % 5), 1900);
    return () => window.clearInterval(id);
  }, [reduced]);

  // phases: 0 Saved, 1 Applied, 2 Interview, 3 Offer, 4 fade out & reset
  const column = Math.min(phase, 2);
  const status: Status = phase >= 3 ? "Offer" : COLUMNS[column]!;
  const hidden = phase === 4;

  return (
    <div className="lp-board-frame relative rounded-[22px] border border-lp-line bg-lp-paper p-3 shadow-[0_30px_80px_-30px_rgba(140,105,20,.35)] sm:p-4">
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#E9967A]" />
          <span className="size-2.5 rounded-full bg-[#E9C46A]" />
          <span className="size-2.5 rounded-full bg-[#A3BF8F]" />
        </div>
        <span className="text-xs font-semibold text-lp-muted">My job board</span>
        <span className="lp-pulse rounded-full bg-lp-gold px-2.5 py-1 text-[10px] font-semibold text-lp-ink">
          + Add job
        </span>
      </div>

      <div
        className="relative grid grid-cols-3 gap-[10px]"
        style={{ "--gap": "10px" } as CSSProperties}
        aria-label="Example job board"
      >
        {COLUMNS.map((name, i) => {
          const count = PARKED[name].length + (column === i && !hidden ? 1 : 0);
          const isTarget = column === i && !hidden;
          return (
            <div key={name} className="min-h-[250px] rounded-2xl bg-lp-sand/70 p-2">
              <div className="mb-1 flex h-7 items-center justify-between px-1 text-[11px] font-semibold text-lp-copy">
                <span>{name}</span>
                <span className="rounded-full bg-white/70 px-1.5 tabular-nums">{count}</span>
              </div>
              <div
                className={`h-[78px] rounded-xl border-2 border-dashed transition-colors duration-500 ${
                  isTarget ? "border-lp-gold/35 bg-white/40" : "border-transparent"
                }`}
              />
              <div className="mt-2 space-y-2">
                {PARKED[name].map((job) => (
                  <div
                    key={job.company}
                    className="rounded-xl border border-lp-line/70 bg-white/80 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <CompanyMark name={job.company} tint={job.tint} />
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-lp-ink">{job.company}</p>
                        <p className="truncate text-[10px] text-lp-muted">{job.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* The travelling card */}
        <div
          className="lp-mover absolute h-[78px]"
          style={
            {
              "--col": column,
              opacity: hidden ? 0 : 1,
              // Fade out in place, then snap back to "Saved" while invisible.
              transition: hidden
                ? "opacity .35s ease"
                : phase === 0
                  ? "left 0s, opacity .45s ease .05s"
                  : "left .75s cubic-bezier(.6,0,.2,1), opacity .4s ease",
            } as CSSProperties
          }
          aria-hidden
        >
          <div
            key={phase}
            className="lp-lift relative flex h-full flex-col justify-between rounded-xl border border-lp-gold/30 bg-white p-2 shadow-[0_14px_30px_-12px_rgba(169,122,15,.4)]"
          >
            <div className="flex items-center gap-2">
              <CompanyMark name="Northstar" tint="#D2603A" />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-lp-ink">Northstar</p>
                <p className="truncate text-[10px] text-lp-muted">Product Engineer</p>
              </div>
            </div>
            <Pill status={status} className="self-start" />
            {phase === 3 && (
              <>
                <span className="lp-stamp absolute -right-2 -top-3 rounded-md border-2 border-[#4A6A40] bg-[#F4F8EF] px-1.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-wide text-[#4A6A40]">
                  Offer!
                </span>
                {Array.from({ length: 10 }).map((_, k) => (
                  <span
                    key={k}
                    className="lp-confetti"
                    style={
                      {
                        "--a": `${k * 36}deg`,
                        "--c": ["#D2603A", "#E3B33B", "#7FA06F", "#E9967A"][k % 4],
                      } as CSSProperties
                    }
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Headline() {
  const words = ["Stop", "losing", "good jobs", "in", "forty", "open", "tabs."];
  return (
    <h1 className="font-display text-[clamp(2.75rem,6.4vw,4.75rem)] font-medium leading-[1.02] tracking-[-0.03em] text-lp-ink">
      {words.map((word, i) => (
        <span key={word}>
          <span className="lp-word" style={{ "--i": i } as CSSProperties}>
            {word === "good jobs" ? (
              <span className="relative inline-block whitespace-nowrap">
                <em className="not-italic text-lp-amber">{word}</em>
                <svg
                  className="lp-scribble absolute -bottom-2 left-0 h-4 w-full"
                  viewBox="0 0 220 16"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M3 11 C 40 3, 80 4, 118 8 S 190 13, 217 5"
                    fill="none"
                    stroke="#F2C94C"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            ) : (
              word
            )}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </h1>
  );
}

const TICKER = [
  ["Product Designer", "Remote"],
  ["Backend Engineer", "Berlin"],
  ["Frontend Developer", "Bengaluru"],
  ["Data Analyst", "Hybrid"],
  ["iOS Engineer", "Toronto"],
  ["Product Manager", "Remote"],
  ["DevRel Engineer", "London"],
  ["Platform Engineer", "Pune"],
];

function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="lp-ticker relative overflow-hidden border-y border-lp-line bg-lp-sand/60 py-4">
      <div className="lp-ticker-track flex w-max gap-3">
        {items.map(([role, place], i) => (
          <span
            key={i}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-lp-line bg-lp-paper px-4 py-1.5 text-sm text-lp-copy"
          >
            <span className="size-1.5 rounded-full bg-lp-gold" aria-hidden />
            <span className="font-semibold text-lp-ink">{role}</span>
            <span className="text-lp-muted">· {place}</span>
            <span className="ml-1 text-xs font-semibold text-lp-sage">saved</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                         */
/* ------------------------------------------------------------------ */

function StepCard({
  index,
  title,
  body,
  children,
}: {
  index: number;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div
      data-reveal
      style={delay(index * 140)}
      className="lp-step group relative rounded-3xl border border-lp-line bg-lp-paper p-6 shadow-[0_1px_0_rgba(140,105,20,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(140,105,20,.45)]"
    >
      <span className="grid size-9 place-items-center rounded-full bg-lp-gold font-display text-base font-semibold text-lp-ink">
        {index + 1}
      </span>
      <div className="mt-6 h-[128px]">{children}</div>
      <h3 className="mt-6 font-display text-2xl font-medium text-lp-ink">{title}</h3>
      <p className="mt-2 text-[15px] leading-7 text-lp-copy">{body}</p>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <div data-reveal className="max-w-2xl">
        <p className="font-display text-lg italic text-lp-amber">How it works</p>
        <h2 className="mt-3 font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-lp-ink sm:text-5xl">
          From “ooh, this one” to “I got the offer.”
        </h2>
      </div>

      <div className="relative mt-16 grid gap-6 md:grid-cols-3">
        <svg
          className="lp-path pointer-events-none absolute -top-10 left-[12%] hidden h-16 w-[76%] md:block"
          viewBox="0 0 800 60"
          preserveAspectRatio="none"
          aria-hidden
          data-reveal
        >
          <path
            d="M2 50 C 150 -10, 250 70, 400 30 S 650 -10, 798 40"
            fill="none"
            stroke="#C9971F"
            strokeOpacity=".6"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
        </svg>

        <StepCard
          index={0}
          title="Paste the link"
          body="Found something good? Drop in the company, the role and the link before it vanishes into your browser history."
        >
          <div className="rounded-2xl border border-lp-line bg-lp-cream p-3">
            <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 font-mono text-[12px] text-lp-copy">
              <span className="text-lp-muted" aria-hidden>↗</span>
              <span className="lp-typing">northstar.dev/careers/pe</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 px-1">
              <span className="truncate text-xs font-semibold text-lp-ink">Product Engineer · Northstar</span>
              <span className="lp-pop">
                <Pill status="Saved" />
              </span>
            </div>
          </div>
        </StepCard>

        <StepCard
          index={1}
          title="Keep the whole story"
          body="The job description, recruiter contacts, company links and your own notes, together on one page."
        >
          <div className="relative rounded-2xl border border-lp-line bg-lp-cream p-3">
            <div className="lp-chip flex w-max items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-xs">
              <span className="grid size-6 place-items-center rounded-full bg-[#8E7AB5] text-[10px] font-bold text-white">P</span>
              <span className="font-semibold text-lp-ink">Priya</span>
              <span className="text-lp-muted">Recruiter</span>
            </div>
            <div className="mt-3 space-y-2 px-1">
              <span className="lp-line block h-2 w-[92%] rounded-full bg-lp-line" />
              <span className="lp-line block h-2 w-[78%] rounded-full bg-lp-line" style={delay(150)} />
              <span className="lp-line block h-2 w-[60%] rounded-full bg-[#F5D36B]" style={delay(300)} />
            </div>
          </div>
        </StepCard>

        <StepCard
          index={2}
          title="Move it along"
          body="Saved, applied, interviewing. See where everything stands at a glance and what deserves your energy next."
        >
          <div className="flex h-full flex-col justify-center rounded-2xl border border-lp-line bg-lp-cream p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-lp-ink">Northstar</span>
              <span className="lp-cycle relative h-[22px] w-[78px] overflow-hidden">
                <span className="lp-cycle-track absolute inset-x-0 top-0 flex flex-col items-end">
                  {(["Saved", "Applied", "Interview", "Offer", "Saved"] as Status[]).map((s, i) => (
                    <span key={i} className="flex h-[22px] items-center">
                      <Pill status={s} />
                    </span>
                  ))}
                </span>
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-lp-line">
              <span className="lp-progress block h-full rounded-full bg-gradient-to-r from-lp-mustard to-lp-amber" />
            </div>
            <p className="mt-3 text-[11px] text-lp-muted">Next: prep for round two</p>
          </div>
        </StepCard>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

function Details() {
  return (
    <section className="relative overflow-hidden bg-lp-sand/60">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:py-32">
        <div data-reveal>
          <p className="font-display text-lg italic text-lp-amber">The details matter</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-lp-ink sm:text-5xl">
            Remember why you were excited about it.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-lp-copy">
            Three weeks after you apply, a recruiter calls. Open the job and
            it&apos;s all there: what the role was, who you spoke to, and the
            notes you left for yourself.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-lp-paper px-4 py-2 text-sm font-medium text-lp-sage">
            <LockIcon /> Your notes are only ever visible to you.
          </p>
        </div>

        <div className="relative mx-auto mb-16 w-full max-w-lg sm:mb-0">
          <div
            data-reveal
            className="relative rounded-3xl border border-lp-line bg-lp-paper p-6 shadow-[0_30px_70px_-35px_rgba(140,105,20,.45)] sm:p-8"
          >
            <div className="flex items-center gap-3 border-b border-lp-line pb-5" data-reveal style={delay(150)}>
              <CompanyMark name="Northstar" tint="#D2603A" />
              <div>
                <p className="font-display text-xl font-medium text-lp-ink">Northstar</p>
                <p className="text-sm text-lp-muted">Product Engineer · Remote</p>
              </div>
              <Pill status="Interview" className="ml-auto" />
            </div>
            <div className="grid grid-cols-2 gap-5 border-b border-lp-line py-5 text-sm" data-reveal style={delay(300)}>
              <div>
                <p className="text-lp-muted">Recruiter</p>
                <p className="mt-1 font-semibold text-lp-ink">Priya Raman ↗</p>
              </div>
              <div>
                <p className="text-lp-muted">Applied</p>
                <p className="mt-1 font-semibold text-lp-ink">Oct 14</p>
              </div>
            </div>
            <div className="pt-5" data-reveal style={delay(450)}>
              <p className="text-sm text-lp-muted">Links</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                {["Job posting", "Company site", "Engineering blog"].map((l) => (
                  <span key={l} className="rounded-full border border-lp-line bg-lp-cream px-3 py-1 text-lp-copy">
                    {l} ↗
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            data-reveal
            style={delay(650)}
            className="lp-sticky absolute -bottom-24 right-2 w-52 sm:-bottom-10 rounded-md bg-[#FBE6A6] p-4 shadow-[0_18px_30px_-14px_rgba(140,105,20,.5)] sm:-right-8"
          >
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8A6A12]">
              <LockIcon /> Private note
            </p>
            <p className="mt-2 font-display text-[15px] italic leading-snug text-[#4B3A12]">
              Team ships weekly. Ask about their design system in round two!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Sharing() {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const showToast = () => {
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  // Play the "copied" moment once when the card first scrolls into view.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          window.setTimeout(showToast, 1100);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
  }, []);

  const jobs = [
    ["Northstar", "Product Engineer", "Remote", "#D2603A"],
    ["Forma", "Frontend Developer", "Bengaluru", "#D9A62E"],
    ["Fieldwork", "Software Engineer", "Hybrid", "#7FA06F"],
  ] as const;

  return (
    <section id="sharing" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid gap-10 lg:grid-cols-2">
        <div data-reveal>
          <p className="font-display text-lg italic text-lp-amber">Sharing</p>
          <h2 className="mt-3 max-w-lg font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-lp-ink sm:text-5xl">
            Share the jobs. Keep the rest to yourself.
          </h2>
        </div>
        <div data-reveal style={delay(120)} className="lg:pt-12">
          <p className="max-w-lg text-lg leading-8 text-lp-copy">
            Posting openings for your network? Put them all on one public
            profile and share a single link instead of a dozen posts. You can
            share a single job on its own, too.
          </p>
          <p className="mt-4 max-w-lg text-sm leading-7 text-lp-muted">
            Private jobs and personal notes never show up publicly. Need a
            copy? Export what&apos;s visible to an Excel-friendly file.
          </p>
        </div>
      </div>

      <div
        ref={cardRef}
        data-reveal
        className="relative mt-14 rounded-[28px] border border-lp-line bg-lp-paper p-5 shadow-[0_30px_80px_-40px_rgba(140,105,20,.5)] sm:p-8"
      >
        <div className="flex flex-wrap items-center gap-4 border-b border-lp-line pb-6">
          <div className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-lp-mustard to-lp-amber font-display text-xl font-semibold text-white">
            AM
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl font-medium text-lp-ink">Alex Morgan</p>
            <p className="text-sm text-lp-muted">Sharing roles from teams worth discovering</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={showToast}
              className="w-full rounded-full border border-lp-line bg-lp-cream px-4 py-2 text-sm font-semibold text-lp-ink transition hover:border-lp-gold/50 active:scale-95 sm:w-auto"
            >
              Copy profile link
            </button>
            <span
              role="status"
              className={`lp-toast pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded-full bg-lp-ink px-3 py-1.5 text-xs font-medium text-lp-cream ${
                copied ? "is-on" : ""
              }`}
            >
              {copied ? "✓ Link copied (demo)" : ""}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {jobs.map(([company, role, place, tint], i) => (
            <div
              key={company}
              data-reveal
              style={{ ...delay(200 + i * 140), "--r": `${(i - 1) * 4}deg` } as CSSProperties}
              className="lp-fan flex items-center gap-3 rounded-2xl border border-lp-line bg-lp-cream p-4 transition hover:-translate-y-1"
            >
              <CompanyMark name={company} tint={tint} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-lp-ink">{company}</p>
                <p className="truncate text-sm text-lp-muted">
                  {role} · {place}
                </p>
              </div>
              <span className="rounded-full bg-lp-sage px-3 py-1.5 text-xs font-semibold text-white">
                Apply ↗
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-lp-gold text-lp-ink">
      <svg
        data-reveal
        className="lp-arrow pointer-events-none absolute -right-10 top-1/2 hidden h-[140%] -translate-y-1/2 opacity-25 md:block"
        viewBox="0 0 400 400"
        aria-hidden
      >
        <path
          d="M40 360 C 160 300, 220 200, 280 130 S 340 60, 360 40 M300 40 H 360 V 100"
          fill="none"
          stroke="#2A2418"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-20 sm:px-8 lg:py-24">
        <h2 data-reveal className="max-w-3xl font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-6xl">
          Your next job is probably in one of those tabs.
        </h2>
        <div data-reveal style={delay(150)}>
          <Link
            href="/login"
            className="lp-btn inline-flex items-center gap-2 rounded-full bg-lp-ink px-7 py-4 text-base font-semibold text-lp-cream shadow-[0_10px_0_-2px_rgba(0,0,0,.35)]"
          >
            Give them a home <span className="lp-btn-arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Landing() {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <main ref={rootRef} className="landing-page min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-30 border-b border-lp-line/70 bg-lp-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5 text-xl font-semibold tracking-tight text-lp-ink">
            <img
              src="/jobhunti-logo.png"
              alt=""
              width={40}
              height={40}
              className="size-10 mix-blend-multiply transition-transform duration-300 group-hover:-rotate-6"
            />
            <span className="font-display">
              Job <span className="text-lp-amber">Hunti</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-lp-copy sm:flex">
            <a href="#how-it-works" className="lp-underline hover:text-lp-ink">How it works</a>
            <a href="#sharing" className="lp-underline hover:text-lp-ink">Sharing</a>
          </nav>
          <Link
            href="/login"
            className="rounded-full border border-lp-ink/15 bg-lp-paper px-4 py-2 text-sm font-semibold text-lp-ink transition hover:border-lp-gold hover:text-lp-amber"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="relative">
        <div className="lp-blob lp-blob-a" aria-hidden />
        <div className="lp-blob lp-blob-b" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:pb-32 lg:pt-24">
          <div>
            <p className="lp-fade inline-flex items-center gap-2 rounded-full border border-lp-line bg-lp-paper/80 px-3 py-1.5 text-sm text-lp-copy">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-lp-sage opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-lp-sage" />
              </span>
              For anyone in the middle of a job hunt
            </p>
            <div className="mt-6">
              <Headline />
            </div>
            <p className="lp-fade mt-7 max-w-xl text-lg leading-8 text-lp-copy" style={delay(700)}>
              Job Hunti is one tidy board for every role you&apos;re chasing:
              the posting, the recruiter, your notes and what happens next.
              It stays private until you decide to share.
            </p>
            <div className="lp-fade mt-9 flex flex-wrap items-center gap-5" style={delay(850)}>
              <Link
                href="/login"
                className="lp-btn inline-flex items-center gap-2 rounded-full bg-lp-gold px-7 py-4 text-base font-semibold text-lp-ink shadow-[0_10px_0_-2px_#B8891A]"
              >
                Start your board <span className="lp-btn-arrow">→</span>
              </Link>
              <a href="#how-it-works" className="lp-underline text-base font-medium text-lp-copy hover:text-lp-ink">
                See how it works
              </a>
            </div>
          </div>

          <div className="lp-fade relative" style={delay(400)}>
            <JobBoard />
            <p className="lp-note absolute -bottom-12 left-4 hidden font-display text-lg italic text-lp-muted sm:block">
              <svg viewBox="0 0 50 30" className="mr-1 inline size-8 -translate-y-2 rotate-[-20deg]" aria-hidden>
                <path d="M4 26 C 14 8, 30 4, 44 6 M36 2 L44 6 L38 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              watch it go, one step at a time
            </p>
          </div>
        </div>
      </section>

      <Ticker />
      <HowItWorks />
      <Details />
      <Sharing />
      <FinalCta />

      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-lp-muted sm:px-8">
        <span className="font-display text-base text-lp-ink">
          Job <span className="text-lp-amber">Hunti</span>
        </span>
        <span>Made for the long middle of the job hunt.</span>
      </footer>
    </main>
  );
}
