# Job Hunti

Job Hunti is a job-tracking application for saving, organizing, and reviewing job opportunities while you browse. It is a Bun/Turborepo monorepo with a Next.js frontend, an Express API that runs locally and as a Cloudflare Worker in production, a Prisma/PostgreSQL data layer, and a Chrome extension for capturing jobs from supported job sites.

## Repository structure

```text
apps/
  web/       Next.js frontend
  backend/   Express API locally; Cloudflare Worker in production
  extension/  Job Hunti Clip Chrome extension
  docs/      Documentation app from the Turborepo starter
packages/
  db/        Prisma schema and PostgreSQL client
  ui/        Shared UI components and styles
  eslint-config/
  tailwind-config/
  typescript-config/
```

The normal request path is `Next.js web app -> backend API -> Prisma -> PostgreSQL`. In production, the Worker uses Cloudflare Hyperdrive for the database connection.

## Job Hunti Clip

Job Hunti Clip lets you save the job currently open in your browser to your Job Hunti account. Open the extension, review the extracted fields, correct anything needed, and click **Save job**.

The extension supports two popup sections:

- **Capture**: company, role, apply link, and the current job details URL.
- **More details**: private or public-profile visibility, salary, location, description, company links, and personal notes.

You can also select text on a page and use it for a field, sign in from the popup when needed, and open an existing Job Hunti job when a duplicate is detected. The extension does not submit applications, collect browsing history, inject ads, or sell data.

Site-specific extraction adapters currently cover LinkedIn, Indeed, Greenhouse, Lever, Workday, Y Combinator, Wellfound, Naukri, Unstop, and Glassdoor. A generic DOM/metadata fallback is used on other pages. Extracted values should still be reviewed before saving because page layouts can change.

See the [extension development guide](apps/extension/README.md) for permissions, environment configuration, reviewer instructions, and publishing notes. The [Chrome Web Store listing draft](apps/extension/STORE_LISTING.md) contains the current product and privacy copy.

## Prerequisites

- [Bun](https://bun.sh/) 1.3.14 or newer
- [Node.js](https://nodejs.org/) 26 or newer
- [Docker](https://docs.docker.com/get-docker/) for the local PostgreSQL database
- Google OAuth credentials if you want to test sign-in

## Local setup

Clone the repository, install dependencies, and start PostgreSQL:

```sh
git clone <your-fork-url>
cd job-hunter
bun install
docker compose up -d postgres
```

Create the local environment files:

```sh
cp .env.example apps/backend/.env
cp .env.example packages/db/.env
cp apps/web/.env.example apps/web/.env
```

Update `apps/backend/.env` with values for local development:

```dotenv
DATABASE_URL="postgresql://job_hunter:job_hunter@localhost:5433/job_hunter?schema=public"
FRONTEND_URL="http://localhost:3001"
COOKIE_CROSS_SITE="true"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:4000/api/auth/google/callback"
JWT_SECRET="use-a-long-random-secret-at-least-32-characters"
```

Update `apps/web/.env`:

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_SITE_URL="http://localhost:3001"
```

Generate Prisma Client and create the local database schema:

```sh
bun db:generate
bun db:push
```

Start the backend and frontend in separate terminals:

```sh
bun run backend:dev
bun run --cwd apps/web dev
```

Open [http://localhost:3001](http://localhost:3001). The API runs at [http://localhost:4000](http://localhost:4000).

For Google sign-in, add `http://localhost:4000/api/auth/google/callback` as an authorized redirect URI in your Google OAuth application.

You can also start all configured development tasks with `bun dev`.

### Build and load the extension locally

From the repository root:

```sh
bun run --cwd apps/extension build
```

Then open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select `apps/extension/dist`.

The extension currently defaults to the deployed Job Hunti website and API. For local development, update the defaults in `apps/extension/src/config.ts` to `http://localhost:3001` and `http://localhost:4000/api`, start the web app and backend, and add the extension origin to the backend `EXTENSION_ORIGINS` allowlist. After changing extension source files, rebuild and reload the unpacked extension.

## Database workflow

The Prisma schema is at [packages/db/prisma/schema.prisma](packages/db/prisma/schema.prisma).

```sh
# Regenerate Prisma Client after schema or Prisma changes
bun db:generate

# Apply the current schema directly during local development
bun db:push

# Create and apply a migration when using migration-based development
bun db:migrate

# Open Prisma Studio
bun db:studio
```

Do not commit database URLs, OAuth secrets, JWT secrets, or other credentials. Production database connectivity is configured through Cloudflare rather than by committing a database environment file.

## Useful commands

Run these from the repository root:

```sh
bun dev            # Start development tasks through Turborepo
bun build          # Build the workspace
bun lint           # Run linting
bun check-types    # Type-check the workspace
bun format         # Format TypeScript, TSX, and Markdown files
```

For focused work:

```sh
bun run --cwd apps/web dev
bun run --cwd apps/web check-types
bun run --cwd apps/backend check-types
bun run --cwd apps/backend build
bun run --cwd apps/extension build
bun run --cwd apps/extension check-types
```

## Production deployment

The backend Worker configuration is in [apps/backend/wrangler.jsonc](apps/backend/wrangler.jsonc). Deploy the backend with:

```sh
bun run --cwd apps/backend deploy
```

To inspect live Worker logs:

```sh
bun run --cwd apps/backend wrangler tail job-hunter-backend --format pretty
```

The frontend is deployed separately. Configure its host with `NEXT_PUBLIC_API_URL` for the production API URL and `NEXT_PUBLIC_SITE_URL` for the public website URL.

Ask a maintainer before changing production database bindings, OAuth callback URLs, or Worker secrets.

## Contributing

1. Fork the repository and create a focused branch from `main`.
2. Read the surrounding code and existing call sites before changing shared logic.
3. Keep the change scoped; avoid unrelated formatting or generated-file churn.
4. Run the relevant type checks, linting, and tests before opening a pull request.
5. Explain what changed, how it was verified, and whether database or deployment steps are required.

Suggested branch names:

```text
feat/job-filters
fix/job-delete-error
docs/contributing-guide
```

Suggested commit messages:

```text
feat: add job filters
fix: handle failed job deletion
docs: improve contributor setup
```

### Pull request checklist

- [ ] The change has a clear, focused purpose.
- [ ] Local setup and relevant checks were completed.
- [ ] Environment variables and secrets are not included.
- [ ] Prisma schema changes include the required database workflow note.
- [ ] UI changes work at the existing desktop and mobile breakpoints.
- [ ] Production-only behavior was verified separately when applicable.

## Reporting issues

When reporting a bug, include the steps to reproduce, expected behavior, actual behavior, browser/runtime details, and relevant sanitized logs or screenshots. Never include passwords, tokens, cookies, full database URLs, or OAuth secrets in an issue.

## License

This repository does not currently include a license file. Please discuss licensing with the project owner before redistributing the code.
