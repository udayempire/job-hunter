export const mcpUserIdClaim = "job_hunti_user_id";

export function mcpServerUrl() {
  return new URL(process.env.MCP_SERVER_URL ?? "http://localhost:4000/mcp");
}

export function workosIssuer() {
  const value = process.env.WORKOS_AUTHKIT_DOMAIN?.trim();
  if (!value) throw new Error("WORKOS_AUTHKIT_DOMAIN is not configured");
  const issuer = new URL(value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`);
  if (issuer.protocol !== "https:" && process.env.NODE_ENV === "production") {
    throw new Error("WORKOS_AUTHKIT_DOMAIN must use HTTPS in production");
  }
  if (issuer.pathname !== "/" || issuer.search || issuer.hash) {
    throw new Error("WORKOS_AUTHKIT_DOMAIN must be an origin without a path, query, or hash");
  }
  return issuer.origin;
}

export function workosApiKey() {
  const value = process.env.WORKOS_API_KEY?.trim();
  if (!value) throw new Error("WORKOS_API_KEY is not configured");
  return value;
}
