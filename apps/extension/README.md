# Job Hunti Clip

Job Hunti Clip saves the job currently open in a browser to Job Hunti. It reads only the active page needed to identify the company, role, and details URL. Apply links can be added manually when available.

The extension uses `activeTab` and injects its extractor only after the user opens the extension. It does not request permanent access to every website.

## Local development

Build the extension with `bun run build`, then load `apps/extension/dist` from `chrome://extensions` with Developer mode enabled.

The development build defaults to:

- Website: `http://localhost:3001`
- API: `http://localhost:4000/api`

For a production package, switch the defaults in `src/config.ts` to the deployed website and API before running the release build.

To capture text reliably, select text on a page, right-click it, and choose `Use selection as company` or `Use selection as role`. The popup buttons remain available as a fallback.

For local development, keep the localhost defaults in `src/config.ts` and add the extension origin to the backend `EXTENSION_ORIGINS` allowlist.

Before publishing, add the Chrome Web Store extension origin to the production backend `EXTENSION_ORIGINS` configuration. The value is `chrome-extension://<store-extension-id>` and is only known after Chrome assigns the published extension ID.

## Store listing privacy disclosure

The extension reads the active job page to extract job details when the user opens the popup. When the user selects Save job, it sends the selected job fields to Job Hunti and uses the user's existing Job Hunti session. It does not sell data, inject advertisements, collect browsing history, or submit applications.

## Reviewer test instructions

1. Sign in to Job Hunti at `https://jobhunti.space`.
2. Open a public job page containing a company name or job title.
3. Open Job Hunti Clip and review the extracted fields.
4. Confirm that the current page is stored as Job details URL and that Apply link is blank.
5. Optionally enter an Apply link manually.
6. Click Save job and confirm the job appears in Job Hunti.
7. Repeat the save to verify the duplicate message and Open in Job Hunti link.
8. Select text on a page and use Use selection for Company or Role.
