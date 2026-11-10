const scopes = ["openid", "email", "profile"];

function client() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:4000/api/auth/google/callback";
  if (!clientId || !clientSecret) {
    const missing = [!clientId && "GOOGLE_CLIENT_ID", !clientSecret && "GOOGLE_CLIENT_SECRET"].filter(Boolean).join(", ");
    throw new Error(`Google OAuth credentials are not configured: missing ${missing}`);
  }
  return { clientId, clientSecret, redirectUri };
}

export function googleAuthorizationUrl(state?: string) {
  const config = client();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "select_account",
  });
  if (state) params.set("state", state);
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function getGoogleUser(code: string) {
  const config = client();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri, grant_type: "authorization_code" }),
  });
  if (!tokenResponse.ok) throw new Error("Google token exchange failed");
  const tokens = await tokenResponse.json() as { id_token?: string };
  if (!tokens.id_token) throw new Error("Google did not return an ID token");

  const profileResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokens.id_token)}`);
  if (!profileResponse.ok) throw new Error("Google ID token verification failed");
  const payload = await profileResponse.json() as { sub?: string; email?: string; email_verified?: string; aud?: string; name?: string; picture?: string };
  if (payload.aud !== config.clientId || !payload.sub || !payload.email || payload.email_verified !== "true") throw new Error("Google account is not verified");
  return { googleId: payload.sub, email: payload.email, name: payload.name ?? null, image: payload.picture ?? null };
}
