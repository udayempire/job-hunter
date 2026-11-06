import express, { type Request, type Response, type Router } from "express";
import { db } from "@repo/db";
import { createAccessToken, createRefreshToken, hashRefreshToken, readAccessToken, refreshTokenExpiry } from "../auth/jwt.js";
import { getGoogleUser, googleAuthorizationUrl } from "../auth/google.js";

const authRouter: Router = express.Router();
const frontendUrl = () => process.env.FRONTEND_URL ?? "http://localhost:3001";

authRouter.get("/google", (_request, response) => {
  response.redirect(googleAuthorizationUrl());
});

authRouter.get("/google/callback", async (request, response) => {
  try {
    const code = typeof request.query.code === "string" ? request.query.code : undefined;
    if (!code) return response.status(400).json({ error: "Google authorization code is required" });
    const googleUser = await getGoogleUser(code);
    const existing = await db.user.findFirst({ where: { OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }] } });
    const user = existing
      ? await db.user.update({
        where: { id: existing.id },
        data: {
          ...googleUser,
          emailVerified: true,
        },
      })
      : await db.user.create({
        data: {
          ...googleUser,
          emailVerified: true,
          profile: { create: { handle: await uniqueHandle(googleUser.name ?? googleUser.email.split("@")[0] ?? "user") } },
        },
      });

    if (!existing) {
      // The profile is created with the first account insert above.
    } else if (!(await db.profile.findUnique({ where: { userId: user.id }, select: { id: true } }))) {
      await db.profile.create({ data: { userId: user.id, handle: await uniqueHandle(googleUser.name ?? googleUser.email.split("@")[0] ?? "user") } });
    }
    const accessToken = await createAccessToken(user.id);
    const refreshToken = createRefreshToken();
    await db.authSession.create({ data: { userId: user.id, refreshTokenHash: hashRefreshToken(refreshToken), expiresAt: refreshTokenExpiry() } });
    setCookie(response, "access_token", accessToken, 15 * 60);
    setCookie(response, "refresh_token", refreshToken, 30 * 24 * 60 * 60);
    return response.redirect(frontendUrl());
  } catch (error) {
    console.error("Google sign-in failed", error);
    return response.redirect(`${frontendUrl()}/login?error=google_signin_failed`);
  }
});

authRouter.post("/refresh", async (request, response) => {
  const currentToken = readCookie(request, "refresh_token");
  if (!currentToken) return response.status(401).json({ error: "Not authenticated" });

  const session = await db.authSession.findFirst({
    where: { refreshTokenHash: hashRefreshToken(currentToken), revokedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!session) {
    clearCookie(response, "access_token");
    clearCookie(response, "refresh_token");
    return response.status(401).json({ error: "Session expired" });
  }

  const nextRefreshToken = createRefreshToken();
  await db.$transaction([
    db.authSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } }),
    db.authSession.create({ data: { userId: session.userId, refreshTokenHash: hashRefreshToken(nextRefreshToken), expiresAt: refreshTokenExpiry() } }),
  ]);

  setCookie(response, "access_token", await createAccessToken(session.userId), 15 * 60);
  setCookie(response, "refresh_token", nextRefreshToken, 30 * 24 * 60 * 60);
  return response.status(204).send();
});

authRouter.get("/me", async (request, response) => {
  const userId = await userIdFromRequest(request);
  if (!userId) return response.status(401).json({ error: "Not authenticated" });
  const user = await db.user.findUnique({ where: { id: userId }, include: { profile: true } });
  if (!user) return response.status(401).json({ error: "Not authenticated" });
  return response.json({ data: { id: user.id, email: user.email, name: user.name, image: user.image, profile: user.profile } });
});

authRouter.post("/logout", async (request, response) => {
  const refreshToken = readCookie(request, "refresh_token");
  if (refreshToken) await db.authSession.updateMany({ where: { refreshTokenHash: hashRefreshToken(refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
  clearCookie(response, "access_token");
  clearCookie(response, "refresh_token");
  return response.status(204).send();
});

function setCookie(response: Response, name: string, value: string, maxAge: number) {
  response.append("Set-Cookie", `${name}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
}

function clearCookie(response: Response, name: string) {
  response.append("Set-Cookie", `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
}

function readCookie(request: Request, name: string) {
  const header = request.headers.cookie ?? "";
  return header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

async function userIdFromRequest(request: Request) {
  const token = readCookie(request, "access_token");
  if (!token) return null;
  try { return await readAccessToken(token); } catch { return null; }
}

async function uniqueHandle(seed: string) {
  const base = seed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "user";
  let handle = base;
  let suffix = 1;
  while (await db.profile.findUnique({ where: { handle } })) handle = `${base}-${suffix++}`;
  return handle;
}

export default authRouter;
