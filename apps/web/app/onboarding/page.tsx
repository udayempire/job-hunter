"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AppBar } from "../../components/app-bar";
import { useAuth } from "../../components/auth-provider";
import type { AuthUser } from "../../lib/auth-api";
import {
  checkHandleAvailability,
  createProfile,
  type ProfileDraftInput,
} from "../../lib/profiles-api";
import { useToast } from "../../components/ui/toast";

type HandleState = "idle" | "invalid" | "checking" | "available" | "taken" | "error";

const inputClass =
  "w-full border border-[var(--border)] bg-[var(--control)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--gold)]";

function cleanHandle(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 30);
}

function validHandle(value: string) {
  return /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(value);
}

function safeReturnPath(value: string | null) {
  return value?.startsWith("/share/jobs/") && !value.startsWith("//") ? value : "/";
}

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ProfileDraftInput>({
    handle: "",
    displayName: "",
    headline: "",
    bio: "",
    location: "",
    website: "",
    isPublic: true,
  });
  const [handleState, setHandleState] = useState<HandleState>("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  useEffect(() => {
    if (!user?.name) return;
    setDraft((current) =>
      current.displayName ? current : { ...current, displayName: user.name ?? "" },
    );
  }, [user]);

  useEffect(() => {
    const handle = draft.handle;
    if (!handle) {
      setHandleState("idle");
      return;
    }
    if (!validHandle(handle)) {
      setHandleState("invalid");
      return;
    }

    let cancelled = false;
    setHandleState("checking");
    const timeout = window.setTimeout(async () => {
      try {
        const available = await checkHandleAvailability(handle);
        if (!cancelled) setHandleState(available ? "available" : "taken");
      } catch {
        if (!cancelled) setHandleState("error");
      }
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [draft.handle]);

  function update(field: keyof ProfileDraftInput, value: string | boolean) {
    setError("");
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function finishOnboarding(event: React.FormEvent) {
    event.preventDefault();
    if (!user || saving || handleState !== "available") return;

    setSaving(true);
    setError("");
    try {
      const profile = await createProfile(draft);
      queryClient.setQueryData<AuthUser | null>(
        ["auth", "current-user"],
        (current) =>
          current
            ? {
                ...current,
                profile: {
                  handle: profile.handle,
                  displayName: profile.displayName,
                  isPublic: profile.isPublic,
                },
              }
            : current,
      );
      queryClient.setQueryData(["profile", "me"], profile);
      toast({
        title: "Profile created",
        description: `Your permanent username is @${profile.handle}.`,
      });
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      router.replace(safeReturnPath(returnTo));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to create profile";
      setError(message);
      if (message.toLowerCase().includes("taken")) setHandleState("taken");
      toast({
        title: "Could not create profile",
        description: message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user || user.profile) {
    return (
      <main className="min-h-screen bg-[var(--canvas)] p-8">
        <div className="mx-auto h-48 max-w-3xl animate-pulse bg-zinc-800" />
      </main>
    );
  }

  const handleMessage = {
    idle: "Choose 3–30 characters using lowercase letters, numbers, and hyphens.",
    invalid: "Use 3–30 characters and do not start or end with a hyphen.",
    checking: "Checking username…",
    available: "This username is available.",
    taken: "That username is already taken.",
    error: "We could not check this username. Try again.",
  }[handleState];

  return (
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <AppBar />
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <section className="border border-[var(--border)] bg-[var(--paper)] p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-ink)]">
            First-time setup
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">
            Create your Job Hunti profile
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--copy)]">
            Set up the profile you will use to share job opportunities with other people.
          </p>

          <form onSubmit={finishOnboarding} className="mt-8 space-y-5">
            <label className="block border border-[var(--gold-border)] bg-[var(--gold-surface)] p-4">
              <span className="block text-sm font-semibold text-[var(--ink)]">
                Profile username
              </span>
              <span className="mt-1 block text-xs leading-5 text-[var(--gold-ink)]">
                Choose carefully. Your profile username cannot be edited again.
              </span>
              <div className="mt-3 flex border border-[var(--border)] bg-[var(--control)] focus-within:border-[var(--gold)]">
                <span className="grid place-items-center border-r border-[var(--border)] px-3 text-sm text-[var(--muted)]">
                  @
                </span>
                <input
                  autoFocus
                  required
                  minLength={3}
                  maxLength={30}
                  value={draft.handle}
                  onChange={(event) => update("handle", cleanHandle(event.target.value))}
                  onBlur={() => update("handle", draft.handle.replace(/-+$/, ""))}
                  placeholder="your-username"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[var(--ink)] outline-none"
                  aria-describedby="handle-status"
                />
              </div>
              <span
                id="handle-status"
                className={`mt-2 block text-xs ${handleState === "available" ? "text-[#8fd0a8]" : handleState === "taken" || handleState === "invalid" || handleState === "error" ? "text-[var(--error)]" : "text-[var(--muted)]"}`}
                aria-live="polite"
              >
                {handleMessage}
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display name" value={draft.displayName} onChange={(value) => update("displayName", value)} placeholder="Your name" />
              <Field label="Location" value={draft.location} onChange={(value) => update("location", value)} placeholder="Bengaluru, India" />
            </div>
            <Field label="Headline" value={draft.headline} onChange={(value) => update("headline", value)} placeholder="Full-stack developer looking for internships" />
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[var(--copy)]">Bio</span>
              <textarea
                value={draft.bio}
                onChange={(event) => update("bio", event.target.value)}
                placeholder="A short introduction about what you are building and looking for…"
                className={`${inputClass} min-h-32 resize-y leading-6`}
              />
            </label>
            <Field label="Website" type="url" value={draft.website} onChange={(value) => update("website", value)} placeholder="https://yourwebsite.com" />

            <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--control)] p-4">
              <div>
                <p className="text-sm font-medium">Public profile</p>
                <p className="mt-1 max-w-md text-xs leading-5 text-[var(--copy)]">
                  Let people see your profile and jobs you mark as public.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draft.isPublic}
                onClick={() => update("isPublic", !draft.isPublic)}
                className={`relative h-7 w-12 cursor-pointer transition ${draft.isPublic ? "bg-[var(--gold)]" : "bg-zinc-700"}`}
              >
                <span className={`absolute top-1 size-5 bg-[var(--paper)] transition ${draft.isPublic ? "left-6" : "left-1"}`} />
              </button>
            </div>

            {error && <p className="text-sm text-[var(--error)]" role="alert">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || handleState !== "available"}
                className="min-w-44 bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--canvas)] transition hover:bg-[var(--gold-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Creating profile…" : "Continue to Job Hunti"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "url";
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[var(--copy)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}
