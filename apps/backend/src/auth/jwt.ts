import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const refreshTokenLifetimeMs = 30 * 24 * 60 * 60 * 1000;

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
  return new TextEncoder().encode(value);
}

export async function createAccessToken(userId: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 15 * 60;
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({ type: "access", sub: userId, iat: issuedAt, exp: expiresAt });
  const input = `${header}.${payload}`;
  const signature = createHmac("sha256", secret()).update(input).digest("base64url");
  return `${input}.${signature}`;
}

export async function readAccessToken(token: string) {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;
  const input = `${header}.${payload}`;
  const expected = createHmac("sha256", secret()).update(input).digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const decoded = decode(payload);
  if (!decoded || decoded.type !== "access" || typeof decoded.sub !== "string" || typeof decoded.exp !== "number" || decoded.exp <= Math.floor(Date.now() / 1000)) return null;
  return decoded.sub;
}

export function createRefreshToken() {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiry() {
  return new Date(Date.now() + refreshTokenLifetimeMs);
}

function encode(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decode(value: string): Record<string, unknown> | null {
  try {
    const result: unknown = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return typeof result === "object" && result !== null ? result as Record<string, unknown> : null;
  } catch {
    return null;
  }
}
