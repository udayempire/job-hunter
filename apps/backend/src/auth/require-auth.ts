import type { NextFunction, Request, Response } from "express";
import { readAccessToken } from "./jwt.js";

export type AuthenticatedRequest = Request & { userId: string };

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  const userId = await userIdFromCookie(request);
  if (!userId) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }
  (request as AuthenticatedRequest).userId = userId;
  next();
}

export async function optionalAuth(request: Request, _response: Response, next: NextFunction) {
  const token = readCookie(request, "access_token");
  if (token) {
    try {
      const userId = await readAccessToken(token);
      if (userId) (request as AuthenticatedRequest).userId = userId;
    } catch {
      // Treat an invalid optional session as anonymous.
    }
  }
  next();
}

export async function userIdFromCookie(request: Request) {
  const token = readCookie(request, "access_token");
  if (!token) return null;
  try {
    return await readAccessToken(token);
  } catch {
    return null;
  }
}

function readCookie(request: Request, name: string) {
  const header = request.headers.cookie ?? "";
  return header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}
