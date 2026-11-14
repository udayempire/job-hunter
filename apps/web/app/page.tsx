"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Check, LockKeyhole } from "lucide-react";
import { Dashboard } from "../components/dashboard";
import { useAuth } from "../components/auth-provider";

const extensionUrl = process.env.NEXT_PUBLIC_EXTENSION_URL?.trim();
const container =
  "mx-auto w-[calc(100%-32px)] max-w-[1200px] sm:w-[calc(100%-40px)]";
const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2.5 bg-zinc-900 text-white whitespace-nowrap bg-[#f5c53d] px-[19px] py-[11px] text-[15px] font-semibold  shadow-[0_1px_0_#cf9e16,0_8px_16px_#533c0914,0_22px_35px_#533c090d] transition hover:-translate-y-0.5 hover:bg-zinc-800 motion-reduce:transition-none motion-reduce:hover:translate-y-0";
const secondaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2.5 whitespace-nowrap border border-[#d7d9de] bg-[#fffdf8] px-[19px] py-[11px] text-[15px] font-semibold text-[#111827] shadow-[0_2px_4px_#1118270a,0_12px_26px_#1118270b] transition hover:-translate-y-0.5 hover:bg-[#fffcf2] motion-reduce:transition-none motion-reduce:hover:translate-y-0";
const eyebrow = "text-[18px] font-bold tracking-[.16em] text-[#a66d06]";
const heading =
  "mt-[15px] text-[clamp(34px,4vw,48px)] font-bold leading-[1.13] tracking-[-.045em]";
const featureCopy = "mt-5 max-w-[520px] text-base leading-[1.7] text-[#4b5563]";
const checkItem =
  "flex items-center gap-2.5 text-sm text-[#4b5563] [&_svg]:shrink-0 [&_svg]:text-[#9b6800]";
const extensionBadgeClass =
  "block h-12 w-[170px] transition hover:-translate-y-0.5 hover:drop-shadow-[0_10px_18px_rgba(17,24,39,.16)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function ExtensionButton() {
  if (!extensionUrl)
    return (
      <span className="inline-flex flex-col items-center gap-[5px]">
        <button
          className="cursor-not-allowed border-0 bg-transparent p-0 opacity-70"
          type="button"
          disabled
          title="Store link coming soon"
        >
          <Image
            src="/landing/chromewebstore.png"
            width={170}
            height={48}
            alt="Available in the Chrome Web Store"
            className="block h-12 w-[170px]"
          />
        </button>
        <small className="text-[11px] text-[#6b7280]">
          Store link coming soon
        </small>
      </span>
    );
  return (
    <a
      className="inline-flex"
      href={extensionUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get Job Hunti from the Chrome Web Store"
    >
      <Image
        src="/landing/chromewebstore.png"
        width={170}
        height={48}
        alt="Available in the Chrome Web Store"
        className={extensionBadgeClass}
      />
    </a>
  );
}

function Landing() {
  return (
    <main className="relative isolate overflow-hidden bg-[#fffdf6] text-[#111827]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[828px] bg-[radial-gradient(ellipse_49%_49%_at_50%_33%,#fffdf6_3%,#fff4cf_58%,transparent_100%),radial-gradient(ellipse_64%_75%_at_89%_83%,#e6ad23_0%,transparent_72%),radial-gradient(ellipse_63%_77%_at_5%_85%,#f4c64b_0%,transparent_76%),linear-gradient(110deg,#fff9e7,#f5d56d_45%,#df9e16_100%)]"
      />
      <header className="relative z-10 h-[62px] border-b border-[#aa7c1838] sm:h-[68px]">
        <div
          className={
            container + " flex h-full items-center justify-between gap-6"
          }
        >
          <Link
            href="/"
            className="inline-flex items-center gap-[9px] whitespace-nowrap text-lg font-bold tracking-[-.04em] sm:text-xl"
          >
            <Image
              src="/jobhunti-logo.png"
              width={34}
              height={34}
              alt=""
              className="size-[29px] sm:size-[34px]"
            />
            <span>
              Job <em className="not-italic text-[#b77900]">Hunti.</em>
            </span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden gap-8 text-sm font-medium text-zinc-800 sm:flex [&_a:hover]:text-[#956000]"
          >
            <a href="#how-it-works">How it works</a>
            <a href="#extension">Extension</a>
            <a href="#sharing">Sharing</a>
          </nav>
          <Link
            href="/login"
            className={
              primaryButton +
              " bg-zinc-800 text-white min-h-10 px-[15px] py-2 text-sm"
            }
          >
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="relative z-10">
        <div className={container + " pt-[46px] text-center sm:pt-[66px]"}>
          <a
            href="#extension"
            className="inline-flex items-center gap-1.5 rounded-[9999px]! border border-[#e5d9b5] bg-[#fffdf8] px-[15px] py-2 text-[11px] font-semibold sm:gap-[13px] sm:text-[13px]"
          >
            NEW · Job Hunti Clip{" "}
            <span className="inline-flex items-center gap-[5px] border-l border-[#e5e7eb] pl-[7px] font-medium text-[#98640d] sm:pl-[13px]">
              Save from your browser <ArrowRight size={14} />
            </span>
          </a>
          <h1 className="mx-auto mt-[27px] max-w-[900px] text-[clamp(44px,6vw,76px)] font-bold leading-[1.05] tracking-[-.055em]">
            Every opportunity.
            <br />
            <span className="text-[#a46c00]">One clear place.</span>
          </h1>
          <p className="mx-auto mt-[21px] max-w-[650px] text-[clamp(16px,1.7vw,19px)] leading-[1.55] text-[#4b5563]">
            Capture jobs as you browse, keep every detail together, and know
            exactly where each application stands.
          </p>
          <div className="mt-[29px] flex flex-col items-center justify-center gap-[13px] sm:flex-row sm:items-start">
            <Link
              href="/login"
              className={primaryButton + " w-full max-w-[320px] sm:w-auto"}
            >
              Start tracking free <ArrowRight size={18} />
            </Link>
            <ExtensionButton />
          </div>
          <p className="mx-auto mt-4 text-xs text-zinc-800 font-semibold">
            Your workspace for the whole search. A browser companion for the
            moment you find a role.
          </p>
          <div className="relative mx-auto -mt-2 max-w-[1000px] text-left sm:-mt-8">
            <Image
              src="/landing/dashboard.png"
              alt="Job Hunti dashboard showing saved jobs and application statuses"
              width={1448}
              height={1086}
              priority
              sizes="(max-width: 800px) 100vw, 1000px"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </section>
      <section
        id="how-it-works"
        className="relative bg-[#fffdf6] py-[73px] scroll-mt-[15px] sm:py-[80px] bottom-20"
      >
        <div className={container}>
          <div className="mx-auto mb-[49px] max-w-[730px] text-center">
            <span className={eyebrow}>A BETTER FLOW</span>
            <h2 className={heading}>From promising link to next step.</h2>
            <p className="mt-4 text-[17px] text-zinc-800">
              Keep the search moving without losing the details along the way.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [
                "01",
                "Save the role",
                "Add a job yourself or capture the page with Job Hunti Clip.",
              ],
              [
                "02",
                "Keep the context",
                "Store company links, recruiter details, descriptions and notes together.",
              ],
              [
                "03",
                "Move it forward",
                "Track its status and return to the right details when you need them.",
              ],
            ].map(([number, title, copy]) => (
              <div
                key={number}
                className="rounded-[16px]! border border-[#e5e7eb] bg-[#fffdf8] p-[30px] shadow-[0_12px_30px_#11182708]"
              >
                <span className="grid size-9 place-items-center rounded-[9px]! bg-[#fff2c4] text-[13px] font-bold text-[#8c5e00]">
                  {number}
                </span>
                <h3 className="mt-7 text-[21px] font-bold tracking-[-.02em]">
                  {title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-[1.6] text-[#4b5563]">
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="extension"
        className="relative bg-[#fff8e8] py-[73px] scroll-mt-[30px] sm:py-[100px]"
      >
        <div
          className={
            container +
            " grid items-center gap-[38px] md:grid-cols-2 md:gap-[9%]"
          }
        >
          <div>
            <span className={eyebrow}>JOB HUNTI CLIP</span>
            <h2 className={heading}>
              Found a role? Save it while it’s in front of you.
            </h2>
            <p className={featureCopy}>
              Open the extension on a job page, check the detected details, and
              save the opportunity to your workspace. The page stays linked to
              the job for later.
            </p>
            <div className="my-[26px] grid gap-3">
              <span className={checkItem}>
                <Check size={15} /> Review and edit before saving
              </span>
              <span className={checkItem}>
                <Check size={15} /> Capture the current page as the details URL
              </span>
              <span className={checkItem}>
                <Check size={15} /> Add an apply link when you have one
              </span>
            </div>
            <ExtensionButton />
          </div>
          <div>
            <Image
              src="/landing/jobclip-extension.png"
              alt="Job Hunti Clip open over a job listing"
              width={1447}
              height={1087}
              sizes="(max-width: 800px) 100vw, 520px"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section
        id="sharing"
        className="relative bg-[#fffdf6] py-[73px] scroll-mt-[30px] sm:py-[100px]"
      >
        <div
          className={
            container +
            " grid items-center gap-[38px] md:grid-cols-2 md:gap-[9%]"
          }
        >
          <div className="order-2 grid min-h-[410px] place-items-center rounded-[23px]! border border-[#ece9df] bg-[#fff3d9] p-[35px] md:order-1">
            <div className="w-full max-w-[380px] rounded-[15px]! border border-[#e5e7eb] bg-[#fffdf8] p-[27px] shadow-[0_20px_50px_#5943131a]">
              <div className="flex items-center gap-3">
                <span className="grid size-[45px] place-items-center rounded-[12px]! bg-[#f8e8b5] font-bold text-[#755000]">
                  AM
                </span>
                <div className="flex flex-col">
                  <strong className="text-[15px]">Alex Morgan</strong>
                  <small className="text-[#737782]">@alexmorgan</small>
                </div>
              </div>
              <p className="my-[18px] text-[13px] leading-normal text-[#4b5563]">
                Opportunities worth sharing with people building their careers.
              </p>
              <div className="flex items-center justify-between border-t border-[#e5e7eb] py-[13px] text-xs font-semibold">
                <span className="flex flex-col gap-1">
                  Product Engineer{" "}
                  <small className="font-normal text-[#737782]">
                    Northstar · Remote
                  </small>
                </span>
                <ArrowRight size={16} className="text-[#a66d06]" />
              </div>
              <div className="flex items-center justify-between border-t border-[#e5e7eb] py-[13px] text-xs font-semibold">
                <span className="flex flex-col gap-1">
                  Frontend Developer{" "}
                  <small className="font-normal text-[#737782]">
                    Forma · Bengaluru
                  </small>
                </span>
                <ArrowRight size={16} className="text-[#a66d06]" />
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <span className={eyebrow}>SHARE ON YOUR TERMS</span>
            <h2 className={heading}>
              One home for the jobs you choose to share.
            </h2>
            <p className={featureCopy}>
              Share a single opportunity or bring selected openings together on
              your public profile. Your private jobs and personal notes stay
              yours.
            </p>
            <div className="mt-[26px] grid gap-3">
              <span className={checkItem}>
                <Check size={15} /> Share individual jobs
              </span>
              <span className={checkItem}>
                <Check size={15} /> Build a public collection
              </span>
              <span className={checkItem}>
                <LockKeyhole size={15} /> Keep private details private
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[linear-gradient(110deg,#fff5d9,#edbf43)] py-[72px]">
        <div
          className={
            container +
            " flex flex-col items-start justify-between gap-[30px] md:flex-row md:items-center"
          }
        >
          <div>
            <span className={eyebrow}>MAKE YOUR NEXT MOVE CLEARER</span>
            <h2 className={heading + " max-w-[610px]"}>
              Give your job search a better home.
            </h2>
            <p className="mt-[13px] text-[#4b5563]">
              All your opportunities, context and next steps in one focused
              workspace.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center gap-2.5 whitespace-nowrap bg-[#111827] px-[19px] py-[11px] text-[15px] font-semibold text-white shadow-[0_12px_24px_#11182723] transition hover:-translate-y-0.5 hover:bg-[#303949] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            Start tracking free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <footer className="relative border-t border-[#e5e7eb] bg-[#fffdf6] py-[29px] text-xs text-[#70747d]">
        <div
          className={container + " flex flex-wrap justify-between gap-[15px]"}
        >
          <span className="font-bold text-[#111827]">Job Hunti.</span>
          <span>Made for a more organized job search.</span>
          <a href="/privacy" className="hover:text-[#956000]">
            Privacy
          </a>
        </div>
      </footer>
    </main>
  );
}

export default function Page() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <main className="min-h-screen bg-[var(--canvas)]" aria-label="Loading" />
    );
  return user ? <Dashboard /> : <Landing />;
}
