# Job Hunti MCP — setup instructions for AI agents

> You are an AI agent. A user has asked you to connect their MCP client to **Job Hunti**, a personal job-tracking app. Follow these steps in order. Ask the user only when a step says to.

## Server facts

| Field | Value |
| --- | --- |
| Name | `job-hunti` |
| URL | `https://api.jobhunti.space/mcp` |
| Transport | Streamable HTTP (stateless, JSON responses, no SSE) |
| Auth | OAuth 2.1 via WorkOS AuthKit, discovered automatically from `https://api.jobhunti.space/.well-known/oauth-protected-resource/mcp` |
| API key | None. Do **not** ask the user for a token or API key. |

The user signs in with the Google account they use on https://jobhunti.space. If they don't have an account yet, tell them to sign up there first.

## Step 1 — Identify the client

Work out which MCP client you are running in. If you can't tell, ask the user. Then follow the matching section below and skip the rest.

## Step 2 — Add the server

### Claude Code

Run:

```sh
claude mcp add --transport http job-hunti https://api.jobhunti.space/mcp
```

Add `--scope user` if the user wants it in every project. Then tell the user to run `/mcp`, select `job-hunti`, and choose **Authenticate**.

### Claude Desktop / claude.ai

You can't edit this config yourself. Tell the user to:

1. Open **Settings → Connectors → Add custom connector**.
2. Name it `Job Hunti` and set the URL to `https://api.jobhunti.space/mcp`.
3. Click **Connect** and sign in with Google.

### Codex CLI

Add this to `~/.codex/config.toml` (create the file if it doesn't exist, and don't overwrite other entries):

```toml
[mcp_servers.job-hunti]
url = "https://api.jobhunti.space/mcp"
```

Then run `codex mcp login job-hunti`.

### Cursor

Merge this into `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

```json
{
  "mcpServers": {
    "job-hunti": { "url": "https://api.jobhunti.space/mcp" }
  }
}
```

Cursor shows a **Needs login** prompt in its MCP settings. Tell the user to click it.

### VS Code (Copilot)

Merge this into `.vscode/mcp.json` or the user's MCP configuration:

```json
{
  "servers": {
    "job-hunti": { "type": "http", "url": "https://api.jobhunti.space/mcp" }
  }
}
```

### Any other client

Configure a remote MCP server with transport **Streamable HTTP**, URL `https://api.jobhunti.space/mcp`, and OAuth enabled. If the client only supports stdio, use the bridge:

```sh
npx -y mcp-remote https://api.jobhunti.space/mcp
```

**When editing any JSON or TOML config:** read the existing file first, merge the new entry in, and keep everything else unchanged.

## Step 3 — Sign in

The first connection opens a browser window: WorkOS → Job Hunti → Google sign-in. Tell the user this will happen, and wait for them to confirm they've finished. The token is stored by the client, so this only happens once per client.

## Step 4 — Check it works

Call `get_pipeline_summary`. It's read-only and safe. A successful call returns `{ total, byStatus }`. Show the user the counts and tell them setup is done.

If it fails:

| Symptom | Fix |
| --- | --- |
| 401 / `invalid_token` | Sign-in didn't finish or the token expired. Run the client's authenticate/login step again. |
| Tools don't appear | Restart the client or reload its MCP servers. |
| Login page says no account | The user needs to sign up at https://jobhunti.space with Google first. |
| Network error | Check that `https://api.jobhunti.space/health` returns `{"status":"ok"}`. |

## Step 5 — Using the tools well

Tell the user what they can now ask, for example "summarize my pipeline", "research the recruiters for my Stripe application", or "save this job: <url>". When you use the tools later, follow these rules:

- **`list_jobs`** — search and filter saved jobs. Call it before `create_job` to avoid saving a duplicate.
- **`get_job`** — the full details of one job, including recruiters.
- **`create_job`** — call only when the user explicitly asks to save a job. It needs `applyLink` or `detailsUrl`.
- **`update_job`** — enrich or edit a job. Omitted fields stay as they are; `null` clears a field. Recruiters without an `id` are added.
- **`get_pipeline_summary`** — counts by status.

Rules:

1. **Never invent data.** Recruiter names and emails, salaries, and company facts must come from a real source. Put that source in `researchSources` or in the recruiter's `sourceUrl`.
2. Mark a recruiter `VERIFIED` only if the source actually confirms them. Otherwise leave them `UNVERIFIED`.
3. Change a job's `status` only when the user asks.
4. Every tool call is recorded in the user's audit log.
