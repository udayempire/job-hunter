import type { NextFunction, Request, Response } from "express";
import { readAccessToken } from "./jwt.js";

export type AuthenticatedRequest = Request & { userId: string };

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  const token = readCookie(request, "access_token");
  if (!token) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const userId = await readAccessToken(token);
    if (!userId) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }
    (request as AuthenticatedRequest).userId = userId;
    next();
  } catch {
    response.status(401).json({ error: "Authentication required" });
  }
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

function readCookie(request: Request, name: string) {
  const header = request.headers.cookie ?? "";
  return header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}
