const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type McpStatus = {
  connected: boolean;
  lastSeenAt: string | null;
  clientId: string | null;
};

export async function getMcpStatus(): Promise<McpStatus> {
  const response = await fetch(`${apiUrl}/mcp/status`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Unable to load MCP status");
  const payload = (await response.json()) as { data: McpStatus };
  return payload.data;
}
