import { createRemoteJWKSet, jwtVerify } from "jose";
import { OAuthError, OAuthErrorCode, type AuthInfo, type OAuthTokenVerifier } from "@modelcontextprotocol/server";
import { mcpServerUrl, mcpUserIdClaim, workosIssuer } from "./config.js";

export type McpPrincipal = {
  userId: string;
  workosUserId: string;
  clientId: string;
  scopes: string[];
};

// jose verifies the WorkOS signature, expiry, issuer and audience.

let cachedJwks: ReturnType<typeof createRemoteJWKSet> | undefined;
let cachedIssuer: string | undefined;

async function verifyAccessToken(token: string): Promise<AuthInfo> {
  const issuer = workosIssuer();

  if (!cachedJwks || cachedIssuer !== issuer) {
    cachedIssuer = issuer;
    cachedJwks = createRemoteJWKSet(
      new URL("/oauth2/jwks", issuer),
    );
  }

  let payload;

  try {
    ({ payload } = await jwtVerify(token, cachedJwks, {
      issuer,
      audience: mcpServerUrl().toString(),
    }));
  } catch {
    throw new OAuthError(
      OAuthErrorCode.InvalidToken,
      "The WorkOS access token is invalid or expired",
    );
  }

  const userId = payload[mcpUserIdClaim];

  if (
    payload.sub_profile === "ai_agent" ||
    typeof payload.sub !== "string" ||
    typeof payload.client_id !== "string" ||
    typeof payload.exp !== "number" ||
    typeof userId !== "string"
  ) {
    throw new OAuthError(
      OAuthErrorCode.InvalidToken,
      "The WorkOS access token is missing required claims",
    );
  }

  return {
    token,
    clientId: payload.client_id,
    scopes:
      typeof payload.scope === "string"
        ? payload.scope.split(" ").filter(Boolean)
        : [],
    expiresAt: payload.exp,
    resource: mcpServerUrl(),
    extra: {
      // extra.userId carries the Job Hunti database user ID into every tool.
      userId,
      workosUserId: payload.sub,
    },
  };
}

export const workosTokenVerifier: OAuthTokenVerifier = {
  verifyAccessToken,
};