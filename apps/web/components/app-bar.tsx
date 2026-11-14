"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AuthStatus } from "./auth-status";

export function AppBar({
  right,
  showAccount = true,
}: {
  right?: ReactNode;
  showAccount?: boolean;
}) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--paper)] px-5 py-3.5 sm:px-8 lg:px-[3.7rem]">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3.5">
          <img src="/jobhunti-logo.png" alt="" width={44} height={44} className="size-9 sm:size-11" />
          <span className="text-base font-semibold tracking-[-0.05em] text-[var(--ink)] sm:text-xl">
            Job Hunti
          </span>
        </Link>
        {right ?? (showAccount ? <AuthStatus /> : null)}
      </div>
    </header>
  );
}
