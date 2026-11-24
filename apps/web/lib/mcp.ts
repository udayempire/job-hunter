export const mcpServerUrl = "https://api.jobhunti.space/mcp";
export const mcpSetupGuideUrl = "https://jobhunti.space/mcp-setup.md";
export const mcpClaudeCodeCommand = `claude mcp add --transport http job-hunti ${mcpServerUrl}`;
export const mcpAgentPrompt = `Set up the Job Hunti MCP server for me: fetch ${mcpSetupGuideUrl} and follow it.`;
