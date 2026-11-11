export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--canvas)] px-6 py-16 text-[var(--ink)] sm:px-10">
      <article className="mx-auto max-w-3xl border border-[var(--border)] bg-[var(--paper)] p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-ink)]">
          Job Hunti
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          Privacy policy
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Last updated: November 11, 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-[var(--copy)]">
          <section>
            <h2 className="text-base font-semibold text-[var(--ink)]">What Job Hunti Clip does</h2>
            <p className="mt-2">Job Hunti Clip helps you save a job listing while you browse. When you open the extension, it reads the active page to identify available job details, including the company, role, job details URL, and application link.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[var(--ink)]">What we send</h2>
            <p className="mt-2">We send job fields to your Job Hunti account only when you choose Save job. The extension uses your existing Job Hunti authentication session and does not display or collect your email address in the extension popup.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[var(--ink)]">What we do not do</h2>
            <p className="mt-2">Job Hunti Clip does not sell personal data, show advertisements, collect your browsing history, read unrelated pages for analytics, or submit job applications on your behalf.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[var(--ink)]">Your control</h2>
            <p className="mt-2">You review and edit extracted fields before saving. You can remove saved jobs from Job Hunti and uninstall the extension at any time.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-[var(--ink)]">Contact</h2>
            <p className="mt-2">For privacy questions or deletion requests, contact the Job Hunti team through the support channel associated with your account.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
