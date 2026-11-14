"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../components/auth-provider";
import { getMyProfile, updateProfile } from "../../lib/profiles-api";
import { AppBar } from "../../components/app-bar";
import { useToast } from "../../components/ui/toast";

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

export function ProfileSettingsPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile, isError: profileError } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMyProfile,
    enabled: Boolean(user),
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>({
    displayName: "",
    handle: "",
    headline: "",
    bio: "",
    location: "",
    website: "",
    isPublic: true,
  });

  useEffect(() => {
    if (!user) return;
    if (profile) {
      setDraft({
        displayName: profile.displayName ?? user.name ?? "",
        handle: profile.handle,
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        website: profile.website ?? "",
        isPublic: profile.isPublic,
      });
      return;
    }
    if (profileError) {
      setDraft({
        displayName: user.profile?.displayName ?? user.name ?? "",
        handle: user.profile?.handle ?? "",
        headline: "",
        bio: "",
        location: "",
        website: "",
        isPublic: user.profile?.isPublic ?? true,
      });
    }
  }, [profile, profileError, user]);

  function update(field: keyof ProfileDraft, value: string | boolean) {
    setSaved(false);
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setSaved(false);
    try {
      const savedProfile = await updateProfile({
        displayName: draft.displayName,
        headline: draft.headline,
        bio: draft.bio,
        location: draft.location,
        website: draft.website,
        isPublic: draft.isPublic,
      });
      queryClient.setQueryData(["profile", "me"], savedProfile);
      queryClient.invalidateQueries({
        queryKey: ["public-profile", draft.handle],
      });
      setSaved(true);
      toast({
        title: "Profile updated",
        description: "Your profile changes have been saved.",
      });
    } catch {
      // Do not surface persistence failures in the profile UI.
      toast({
        title: "Could not update profile",
        description: "Your changes were not saved. Please try again.",
        variant: "error",
      });
    } finally {
      setSaving(false);
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

  return (
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <AppBar />
      <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8 lg:py-8">
        {/* <Link
          href="/"
          className="mt-10 inline-flex text-sm font-medium text-[var(--muted)] hover:text-[var(--gold-ink)]"
        >
          ← Back to your pipeline
        </Link> */}
        <div className="mt-5">
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
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[var(--copy)]">
                  Profile username
                </span>
                <input
                  value={`@${draft.handle}`}
                  readOnly
                  aria-readonly="true"
                  className={`${inputClass} cursor-default text-[var(--muted)]`}
                />
                <span className="mt-1.5 block text-xs text-[var(--muted)]">
                  Your profile username is permanent and cannot be edited.
                </span>
              </label>
              <Field
                label="Display name"
                name="displayName"
                value={draft.displayName}
                onChange={(value) => update("displayName", value)}
                placeholder="Your name"
              />
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
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  aria-live="polite"
                  className="min-w-32 bg-[var(--gold)] cursor-pointer px-5 py-3 text-sm font-semibold text-[var(--canvas)] transition hover:bg-[var(--gold-strong)] disabled:cursor-wait disabled:opacity-75"
                >
                  {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile/settings");
  }, [router]);

  return (
    <main className="min-h-screen bg-[var(--canvas)] p-8">
      <div className="mx-auto h-48 max-w-5xl animate-pulse bg-zinc-800" />
    </main>
  );
}
