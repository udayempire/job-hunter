"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-provider";
import { Avatar } from "./avatar";
import { Icon } from "./icon";

export function AuthStatus() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [menuOpen]);

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

  return (
    <div className="relative flex items-center gap-4">
      <div className="hidden border-l border-[var(--border)] pl-6 text-left sm:block">
        <p className="max-w-40 truncate text-base font-semibold tracking-[-0.04em] text-[var(--ink)]">
          {user.name ?? user.email}
        </p>
      </div>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open profile menu"
          aria-expanded={menuOpen}
          className="cursor-pointer"
        >
          <Avatar
            src={user.image}
            name={user.name}
            fallback={user.email}
            alt=""
            className="grid size-10 place-items-center overflow-hidden border border-[var(--border)] bg-[var(--gold-surface)] text-sm font-semibold text-[var(--gold-ink)]"
          />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-12 z-30 w-48 border border-[var(--border)] bg-[var(--paper)] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,.25)]">
            <Link
              href="/profile/settings"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm text-[var(--copy)] transition hover:bg-zinc-800 hover:text-[var(--ink)]"
            >
              Profile settings
            </Link>
            <Link
              href={
                user.profile?.handle
                  ? `/profile/${user.profile.handle}`
                  : "/profile/settings"
              }
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm text-[var(--copy)] transition hover:bg-zinc-800 hover:text-[var(--ink)]"
            >
              View profile
            </Link>
          </div>
        )}
        </div>
      <button
        type="button"
        disabled={signingOut}
        onClick={() => {
          setSigningOut(true);
          logout()
            .then(() => router.replace("/"))
            .catch(() => setSigningOut(false));
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
