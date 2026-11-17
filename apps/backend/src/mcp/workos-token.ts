import { createRemoteJWKSet, jwtVerify } from "jose";
import { mcpServerUrl, mcpUserIdClaim, workosIssuer } from "./config.js";

export type McpPrincipal = {
  userId: string;
  workosUserId: string;
  clientId: string;
  scopes: string[];
};

let cachedJwks: ReturnType<typeof createRemoteJWKSet> | undefined;
let cachedIssuer: string | undefined;

export async function verifyWorkosAccessToken(token: string): Promise<McpPrincipal> {
  const issuer = workosIssuer();
  if (!cachedJwks || cachedIssuer !== issuer) {
    cachedIssuer = issuer;
    cachedJwks = createRemoteJWKSet(new URL("/oauth2/jwks", issuer));
  }
  const jwks = cachedJwks;

  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience: mcpServerUrl().toString(),
  });

  if (payload.sub_profile === "ai_agent") {
    throw new Error("Agent tokens are not accepted");
  }

  const userId = payload[mcpUserIdClaim];
  if (typeof payload.sub !== "string" || typeof payload.client_id !== "string" || typeof userId !== "string") {
    throw new Error("WorkOS access token is missing required claims");
  }

  return {
    userId,
    workosUserId: payload.sub,
    clientId: payload.client_id,
    scopes: typeof payload.scope === "string" ? payload.scope.split(" ").filter(Boolean) : [],
  };
}
