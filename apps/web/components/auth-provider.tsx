"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  logout as logoutAccount,
  type AuthUser,
} from "../lib/auth-api";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    async function hydrateSession() {
      try {
        const account = await getCurrentUser();
        if (cancelled) return;
        setUser(account);
        setLoading(false);
      } catch {
        if (cancelled) return;
        const delay = Math.min(1_000 * 2 ** attempt, 15_000);
        attempt += 1;
        retryTimer = setTimeout(() => void hydrateSession(), delay);
      }
    }

    void hydrateSession();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      logout: async () => {
        await logoutAccount();
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
