"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthStatus } from "../../components/auth-status";
import { Icon } from "../../components/icon";
import { useAuth } from "../../components/auth-provider";
import { getMyProfile, updateProfile } from "../../lib/profiles-api";

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
  "w-full border border-[var(--border)] bg-[var(--control)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--gold)]";

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
      <span className="mb-1.5 block text-xs font-medium text-[var(--copy)]">
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
    void getMyProfile()
      .then((profile) => setDraft({
        displayName: profile.displayName ?? user.name ?? "",
        handle: profile.handle,
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        website: profile.website ?? "",
        isPublic: profile.isPublic,
      }))
      .catch(() => setDraft({
        displayName: user.profile?.displayName ?? user.name ?? "",
        handle: user.profile?.handle ?? "",
        headline: "",
        bio: "",
        location: "",
        website: "",
        isPublic: user.profile?.isPublic ?? false,
      }));
  }, [user]);

  function update(field: keyof ProfileDraft, value: string | boolean) {
    setSaved(false);
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    try {
      await updateProfile(draft);
      setSaved(true);
    } catch {
      // Do not surface persistence failures in the profile UI.
    }
  }

  if (loading)
    return (
      <main className="min-h-screen bg-[var(--canvas)] p-8">
        <div className="mx-auto h-48 max-w-5xl animate-pulse bg-zinc-800" />
      </main>
    );
  if (!user)
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--canvas)] px-5 text-[var(--ink)]">
        <div className="border border-[var(--border)] bg-[var(--paper)] p-8 text-center">
          <h1 className="text-2xl font-semibold tracking-[-0.05em]">
            Sign in to create your profile
          </h1>
          <Link
            href="/login"
            className="mt-6 inline-flex bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--canvas)]"
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
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 lg:py-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center bg-[var(--ink)] text-[var(--canvas)]">
              <Icon name="spark" size={18} />
            </span>
            <span className="text-base font-semibold tracking-[-0.03em] text-[var(--ink)]">
              Job Hunti
            </span>
          </Link>
          <AuthStatus />
        </header>
        <Link
          href="/"
          className="mt-10 inline-flex text-sm font-medium text-[var(--muted)] hover:text-[var(--gold-ink)]"
        >
          ← Back to your pipeline
        </Link>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="border border-[var(--border)] bg-[var(--paper)] p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-ink)]">
                Your identity
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">
                Profile settings
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--copy)]">
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
                <span className="mb-1.5 block text-xs font-medium text-[var(--copy)]">
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
              <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--control)] p-4">
                <div>
                  <p className="text-sm font-medium text-[var(--ink)]">
                    Public profile
                  </p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--copy)]">
                    Allow people with your profile link to see your public
                    profile and jobs marked public.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draft.isPublic}
                  onClick={() => update("isPublic", !draft.isPublic)}
                  className={`relative h-7 w-12 transition ${draft.isPublic ? "bg-[var(--gold)]" : "bg-zinc-700"}`}
                >
                  <span
                    className={`absolute top-1 size-5 bg-[var(--paper)] transition ${draft.isPublic ? "left-6" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-end gap-4">
                <span className="text-sm text-[var(--gold-ink)]">
                  {saved ? "Saved" : ""}
                </span>
                <button
                  type="submit"
                  className="bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--canvas)] transition hover:bg-[var(--gold-strong)]"
                >
                  Save changes
                </button>
              </div>
            </form>
          </section>
          <aside className="h-fit border border-[var(--border)] bg-[var(--paper)] p-6 text-[var(--ink)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-ink)]">
              Profile preview
            </p>
            <div className="mt-8 grid size-16 place-items-center bg-[var(--gold-surface)] text-xl font-semibold text-[var(--gold-ink)]">
              {user.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                avatarLetter
              )}
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.05em]">
              {draft.displayName || "Your name"}
            </h2>
            <p className="mt-2 text-sm text-[var(--gold-ink)]">
              @{draft.handle || "your-handle"}
            </p>
            <p className="mt-5 text-sm leading-6 text-[var(--copy)]">
              {draft.headline || "Your headline will appear here."}
            </p>
            {draft.location && (
              <p className="mt-5 text-xs text-[var(--muted)]">{draft.location}</p>
            )}
            <div className="mt-8 border-t border-[var(--divider)] pt-5">
              <p className="text-xs text-[var(--muted)]">Profile visibility</p>
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
