"use client";

import { Dashboard } from "../components/dashboard";
import { useAuth } from "../components/auth-provider";
import { Landing } from "../components/landing";

export default function Page() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <main className="min-h-screen bg-[var(--canvas)]" aria-label="Loading" />
    );
  return user ? <Dashboard /> : <Landing />;
}
