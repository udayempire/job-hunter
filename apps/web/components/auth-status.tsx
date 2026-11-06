"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./auth-provider";

export function AuthStatus() {
  const { user, loading, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (loading)
    return (
      <div
        className="h-9 w-28 animate-pulse rounded-full bg-[#eee6df]"
        aria-label="Loading account"
      />
    );
  if (!user)
    return (
      <Link
        href="/login"
        className="rounded-full bg-[#292323] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3b3330]"
      >
        Sign in
      </Link>
    );

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2.5">
      <div className="hidden text-right sm:block">
        <p className="max-w-32 truncate text-sm font-medium text-[#4f4642]">
          {user.name ?? user.email}
        </p>
        <p className="text-xs text-[#958b85]">Your workspace</p>
      </div>
      <Link href="/profile" aria-label="Open profile" className="grid size-9 place-items-center overflow-hidden rounded-full bg-[#e7d6c7] text-xs font-semibold text-[#76513a]">
        {user.image ? (
          <img src={user.image} alt="" className="size-full object-cover" />
        ) : (
          initials
        )}
      </Link>
      <button
        type="button"
        disabled={signingOut}
        onClick={() => {
          setSigningOut(true);
          logout().catch(() => setSigningOut(false));
        }}
        className="text-xs font-medium text-[#847a74] transition hover:text-[#302a28] disabled:opacity-50"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
