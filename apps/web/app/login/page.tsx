import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const backendUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:4000";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const safeReturnTo = returnTo?.startsWith("/share/jobs/") ? returnTo : undefined;
  const googleSignInUrl = new URL(`${backendUrl}/api/auth/google`);
  if (safeReturnTo) googleSignInUrl.searchParams.set("returnTo", safeReturnTo);

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#fffdf6] text-[#111827]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_49%_49%_at_50%_33%,#fffdf6_3%,#fff4cf_58%,transparent_100%),radial-gradient(ellipse_64%_75%_at_89%_83%,#e6ad23_0%,transparent_72%),radial-gradient(ellipse_63%_77%_at_5%_85%,#f4c64b_0%,transparent_76%),linear-gradient(110deg,#fff9e7,#f5d56d_45%,#df9e16_100%)]"
      />
      <header className="border-b border-[#aa7c1838]">
        <div className="mx-auto flex h-[68px] w-[calc(100%-40px)] max-w-[1200px] items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-[9px] text-lg font-bold tracking-[-.04em] sm:text-xl">
            <Image src="/jobhunti-logo.png" width={34} height={34} alt="" className="size-[29px] sm:size-[34px]" />
            <span>Job <em className="not-italic text-[#b77900]">Hunti.</em></span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#5f5b52] transition hover:text-[#956000]">
            <ArrowLeft size={16} aria-hidden="true" /> Back to home
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-[calc(100%-40px)] max-w-[1050px] flex-1 items-center gap-10 py-12 md:grid-cols-[1fr_420px] md:gap-16 md:py-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a66d06]">YOUR SEARCH, IN ONE PLACE</p>
          <h1 className="mt-5 max-w-xl text-[clamp(42px,5vw,64px)] font-bold leading-[1.08] tracking-[-.055em]">
            Pick up where you <span className="text-[#a46c00]">left off.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-[1.7] text-[#4b5563] sm:text-lg">
            Save opportunities, track every application, and keep the details that matter close at hand.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-[#4b5563]">
            <span className="flex items-center gap-3"><Check size={17} className="shrink-0 text-[#9b6800]" aria-hidden="true" /> Your jobs and notes in one workspace</span>
            <span className="flex items-center gap-3"><Check size={17} className="shrink-0 text-[#9b6800]" aria-hidden="true" /> A clear view of every application</span>
          </div>
        </div>

        <section className="border border-[#e5d9b5] bg-[#fffdf8] p-7 shadow-[0_18px_50px_#59431317] sm:p-9" aria-labelledby="sign-in-heading">
          <Image src="/jobhunti-logo.png" width={44} height={44} alt="" className="mx-auto size-11" />
          <h2 id="sign-in-heading" className="mt-7 text-2xl font-bold tracking-[-.04em]">Welcome to Job Hunti</h2>
          <p className="mt-2 text-sm leading-6 text-[#4b5563]">Sign in to open your workspace or create your free account.</p>
          <a
            href={googleSignInUrl.toString()}
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#f5c53d] px-5 py-3 text-sm font-semibold text-[#111827] shadow-[0_1px_0_#cf9e16,0_8px_16px_#533c0914] transition hover:-translate-y-0.5 hover:bg-[#e9b829] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            Continue with Google <ArrowRight size={17} aria-hidden="true" />
          </a>
          <p className="mt-5 text-center text-xs leading-5 text-[#70747d]">One account for your board and your Job Hunti profile.</p>
        </section>
      </div>
    </main>
  );
}
