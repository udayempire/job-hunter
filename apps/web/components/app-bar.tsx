"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AuthStatus } from "./auth-status";
import { Icon } from "./icon";

export function AppBar({
  right,
  showAccount = true,
}: {
  right?: ReactNode;
  showAccount?: boolean;
}) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--paper)] px-5 py-3.5 sm:px-8 lg:px-[3.7rem]">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5">
          <span className="grid size-10 place-items-center bg-[var(--ink)] text-[var(--paper)]">
            <Icon name="spark" size={17} />
          </span>
          <span className="text-xl font-semibold tracking-[-0.05em] text-[var(--ink)] [font-family:Georgia,serif]">
            Job Hunti
          </span>
        </Link>
        {right ?? (showAccount ? <AuthStatus /> : null)}
      </div>
    </header>
  );
}
