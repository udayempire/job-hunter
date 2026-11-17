declare module "cloudflare:node" {
  export function httpServerHandler(options: { port: number }): ExportedHandler;
}

declare module "cloudflare:workers" {
  export const env: Env;
}

interface Env {
  HYPERDRIVE: Hyperdrive;
  FRONTEND_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
  JWT_SECRET?: string;
  MCP_SERVER_URL?: string;
  WORKOS_API_KEY?: string;
  WORKOS_AUTHKIT_DOMAIN?: string;
}
