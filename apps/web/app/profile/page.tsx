"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthStatus } from "../../components/auth-status";
import { Icon } from "../../components/icon";
import { useAuth } from "../../components/auth-provider";

type ProfileDraft = {
  displayName: string;
  handle: string;
  headline: string;
  bio: string;
  location: string;
  website: string;
  isPublic: boolean;
};

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#302a28] outline-none transition focus:border-[#9b6b4b] focus:ring-4 focus:ring-[#9b6b4b]/10";

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "url";
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[#6e6561]">
        {label}
      </span>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>({
    displayName: "",
    handle: "",
    headline: "",
    bio: "",
    location: "",
    website: "",
    isPublic: false,
  });

  useEffect(() => {
    if (!user) return;
    const stored = window.localStorage.getItem("job-hunter-profile-draft");
    const profile = user.profile;
    setDraft(
      stored
        ? (JSON.parse(stored) as ProfileDraft)
        : {
            displayName: profile?.displayName ?? user.name ?? "",
            handle: profile?.handle ?? "",
            headline: "",
            bio: "",
            location: "",
            website: "",
            isPublic: profile?.isPublic ?? false,
          },
    );
  }, [user]);

  function update(field: keyof ProfileDraft, value: string | boolean) {
    setSaved(false);
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    window.localStorage.setItem(
      "job-hunter-profile-draft",
      JSON.stringify(draft),
    );
    setSaved(true);
  }

  if (loading)
    return (
      <main className="min-h-screen bg-[#f7f4ef] p-8">
        <div className="mx-auto max-w-5xl h-48 animate-pulse rounded-[2rem] bg-[#e9dfd7]" />
      </main>
    );
  if (!user)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f4ef] px-5 text-[#302a28]">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-[0_24px_80px_rgba(48,42,40,0.12)]">
          <h1 className="text-2xl font-semibold tracking-[-0.05em]">
            Sign in to create your profile
          </h1>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-[#292323] px-5 py-3 text-sm font-semibold text-white"
          >
            Continue with Google
          </Link>
        </div>
      </main>
    );

  const avatarLetter = (
    draft.displayName.trim().charAt(0) || user.email.charAt(0)
  ).toUpperCase();
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#302a28]">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 lg:py-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-[#292323] text-white">
              <Icon name="spark" size={18} />
            </span>
            <span className="text-base font-semibold tracking-[-0.03em]">
              Job Hunter
            </span>
          </Link>
          <AuthStatus />
        </header>
        <Link
          href="/"
          className="mt-10 inline-flex text-sm font-medium text-[#847a74] hover:text-[#302a28]"
        >
          ← Back to your pipeline
        </Link>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] bg-white p-6 shadow-[0_16px_50px_rgba(48,42,40,0.06)] sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b4b]">
                Your identity
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">
                Profile settings
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#847a74]">
                Shape the profile you can share with people who want to follow
                your job search.
              </p>
            </div>
            <form onSubmit={saveProfile} className="mt-8 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Display name"
                  name="displayName"
                  value={draft.displayName}
                  onChange={(value) => update("displayName", value)}
                  placeholder="Your name"
                />
                <Field
                  label="Profile handle"
                  name="handle"
                  value={draft.handle}
                  onChange={(value) =>
                    update(
                      "handle",
                      value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    )
                  }
                  placeholder="uday"
                />
              </div>
              <Field
                label="Headline"
                name="headline"
                value={draft.headline}
                onChange={(value) => update("headline", value)}
                placeholder="Full-stack developer looking for internships"
              />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[#6e6561]">
                  Bio
                </span>
                <textarea
                  value={draft.bio}
                  onChange={(event) => update("bio", event.target.value)}
                  placeholder="A short introduction about what you are building and looking for…"
                  className={`${inputClass} min-h-32 resize-y leading-6`}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Location"
                  name="location"
                  value={draft.location}
                  onChange={(value) => update("location", value)}
                  placeholder="Bengaluru, India"
                />
                <Field
                  label="Website"
                  name="website"
                  type="url"
                  value={draft.website}
                  onChange={(value) => update("website", value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#f7f2ed] p-4">
                <div>
                  <p className="text-sm font-medium text-[#403733]">
                    Public profile
                  </p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-[#8b817b]">
                    Allow people with your profile link to see your public
                    profile and jobs marked public.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draft.isPublic}
                  onClick={() => update("isPublic", !draft.isPublic)}
                  className={`relative h-7 w-12 rounded-full transition ${draft.isPublic ? "bg-[#7b9b7d]" : "bg-[#c9bfba]"}`}
                >
                  <span
                    className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition ${draft.isPublic ? "left-6" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-end gap-4">
                <span className="text-sm text-[#6d8b6f]">
                  {saved ? "Saved on this device" : ""}
                </span>
                <button
                  type="submit"
                  className="rounded-full bg-[#292323] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3b3330]"
                >
                  Save changes
                </button>
              </div>
            </form>
          </section>
          <aside className="h-fit rounded-[2rem] bg-[#292323] p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8ad8e]">
              Profile preview
            </p>
            <div className="mt-8 grid size-16 place-items-center rounded-2xl bg-[#a87556] text-xl font-semibold">
              {user.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="size-full rounded-2xl object-cover"
                />
              ) : (
                avatarLetter
              )}
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.05em]">
              {draft.displayName || "Your name"}
            </h2>
            <p className="mt-2 text-sm text-[#d8ad8e]">
              @{draft.handle || "your-handle"}
            </p>
            <p className="mt-5 text-sm leading-6 text-[#c9bfba]">
              {draft.headline || "Your headline will appear here."}
            </p>
            {draft.location && (
              <p className="mt-5 text-xs text-[#a99d97]">{draft.location}</p>
            )}
            <div className="mt-8 border-t border-white/10 pt-5">
              <p className="text-xs text-[#a99d97]">Profile visibility</p>
              <p className="mt-1 text-sm font-medium">
                {draft.isPublic ? "Public" : "Private"}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
