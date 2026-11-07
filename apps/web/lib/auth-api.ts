const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  profile: { handle: string; displayName: string | null; isPublic: boolean } | null;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  let response = await fetch(`${apiUrl}/auth/me`, { credentials: "include", cache: "no-store" });
  if (response.status === 401) {
    const refresh = await fetch(`${apiUrl}/auth/refresh`, { method: "POST", credentials: "include" });
    if (refresh.ok) response = await fetch(`${apiUrl}/auth/me`, { credentials: "include", cache: "no-store" });
  }
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Unable to load account (${response.status})`);
  const payload = (await response.json()) as { data: AuthUser };
  return payload.data;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${apiUrl}/auth/logout`, { method: "POST", credentials: "include" });
  if (!response.ok && response.status !== 204) throw new Error("Unable to sign out");
}
