import Link from "next/link";

const backendUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:4000";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--canvas)] px-5 text-[var(--ink)]">
      <section className="w-full max-w-md border border-[var(--border)] bg-[var(--paper)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-10">
        <Link href="/" className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--ink)]">
          ← Back to Job Hunti
        </Link>
        {/* <p className="mt-12 text-xs font-semibold uppercase tracking-[0.2em] text-[#a87556]">
          Welcome back
        </p> */}
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em]">
          Keep your search moving.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--copy)]">
          Sign in to save jobs, update application status, and build your
          private job board.
        </p>
        <a
          href={`${backendUrl}/api/auth/google`}
          className="mt-8 flex h-12 items-center justify-center bg-[var(--gold)] text-sm font-semibold text-[var(--canvas)] transition hover:bg-[var(--gold-strong)]"
        >
          Continue with Google
        </a>
      </section>
    </main>
  );
}
