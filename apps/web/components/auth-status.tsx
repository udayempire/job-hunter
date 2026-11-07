"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./auth-provider";
import { Icon } from "./icon";

export function AuthStatus() {
  const { user, loading, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading)
    return (
      <div
        className="h-9 w-28 animate-pulse rounded-full bg-zinc-800"
        aria-label="Loading account"
      />
    );
  if (!user)
    return (
      <Link
        href="/login"
        className="rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-[var(--canvas)] transition hover:bg-[var(--gold-strong)]"
      >
        Sign in
      </Link>
    );

  const avatarLetter = (
    user.name?.trim().charAt(0) || user.email.charAt(0)
  ).toUpperCase();
  return (
    <div className="relative flex items-center gap-4">
      <div className="hidden border-l border-[var(--border)] pl-6 text-left sm:block">
        <p className="max-w-40 truncate text-base font-semibold tracking-[-0.04em] text-[var(--ink)]">
          {user.name ?? user.email}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--copy)]">
          Your workspace <Icon name="chevron" size={13} />
        </p>
      </div>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Open profile menu"
        aria-expanded={menuOpen}
        className="grid size-10 place-items-center overflow-hidden rounded-full bg-[var(--gold-surface)] text-sm font-semibold text-[var(--gold-ink)]"
      >
        {user.image ? (
          <img src={user.image} alt="" className="size-full object-cover" />
        ) : (
          avatarLetter
        )}
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-12 z-30 w-48 rounded-2xl border border-black/8 bg-white p-2 shadow-[0_16px_40px_rgba(48,42,40,0.14)]">
          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="block rounded-xl px-3 py-2.5 text-sm text-[#4f4642] transition hover:bg-[#f7f2ed]"
          >
            Profile settings
          </Link>
          <Link
            href={
              user.profile?.handle
                ? `/profile/${user.profile.handle}`
                : "/profile"
            }
            onClick={() => setMenuOpen(false)}
            className="block rounded-xl px-3 py-2.5 text-sm text-[#4f4642] transition hover:bg-[#f7f2ed]"
          >
            View profile
          </Link>
        </div>
      )}
      <button
        type="button"
        disabled={signingOut}
        onClick={() => {
          setSigningOut(true);
          logout().catch(() => setSigningOut(false));
        }}
        className="inline-flex border-l bg-red-800 p-2 text-center text-white border-[var(--border)]  text-sm font-medium  transition hover:text-[var(--gold-ink)] disabled:opacity-50"
      >
        {signingOut ? (
          "Signing out…"
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="ml-2">Sign out</span>
            <Icon name="logout" size={17} />{" "}
          </div>
        )}
      </button>
    </div>
  );
}
