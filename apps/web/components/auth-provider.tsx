"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
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
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const { data: user = null, isPending: loading } = useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60_000,
    retry: true,
  });
  const logout = useCallback(async () => {
    await logoutAccount();
    queryClient.setQueryData<AuthUser | null>(["auth", "current-user"], null);
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== "auth",
    });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      loading,
      logout,
    }),
    [loading, logout, user],
  );

  const needsOnboarding = !loading && Boolean(user && !user.profile);
  const shouldLeaveOnboarding = !loading && Boolean(user?.profile) && pathname === "/onboarding";

  useEffect(() => {
    if (needsOnboarding && pathname !== "/onboarding") {
      const returnTo = pathname.startsWith("/share/jobs/")
        ? `?returnTo=${encodeURIComponent(pathname)}`
        : "";
      router.replace(`/onboarding${returnTo}`);
    } else if (shouldLeaveOnboarding) {
      router.replace("/");
    }
  }, [needsOnboarding, pathname, router, shouldLeaveOnboarding]);

  const redirecting =
    (needsOnboarding && pathname !== "/onboarding") || shouldLeaveOnboarding;

  return (
    <AuthContext.Provider value={value}>
      {redirecting ? (
        <main className="min-h-screen bg-[var(--canvas)] p-8">
          <div className="mx-auto h-48 max-w-5xl animate-pulse bg-zinc-800" />
        </main>
      ) : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
