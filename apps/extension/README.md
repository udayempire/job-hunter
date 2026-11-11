# Job Hunti Clip

Job Hunti Clip saves the job currently open in a browser to Job Hunti. It reads only the active page needed to identify the company, role, details URL, and an available apply link.

The extension uses `activeTab` and injects its extractor only after the user opens the extension. It does not request permanent access to every website.

## Local development

Build the extension with `bun run build`, then load `apps/extension/dist` from `chrome://extensions` with Developer mode enabled.

The packaged extension defaults to:

- Website: `https://jobhunti.space`
- API: `https://api.jobhunti.space/api`

For local development, override `apiUrl` and `frontendUrl` in the extension's `chrome.storage.local` values, then add the extension origin to the backend `EXTENSION_ORIGINS` allowlist.

Before publishing, add the Chrome Web Store extension origin to the production backend `EXTENSION_ORIGINS` configuration. The value is `chrome-extension://<store-extension-id>` and is only known after Chrome assigns the published extension ID.

## Store listing privacy disclosure

The extension reads the active job page to extract job details when the user opens the popup. When the user selects Save job, it sends the selected job fields to Job Hunti and uses the user's existing Job Hunti session. It does not sell data, inject advertisements, collect browsing history, or submit applications.

## Reviewer test instructions

1. Sign in to Job Hunti at `https://jobhunti.space`.
2. Open a public job page containing a company name or job title.
3. Open Job Hunti Clip and review the extracted fields.
4. Confirm that the current page is stored as Job details URL.
5. If an Apply link is detected, confirm it is stored separately.
6. Click Save job and confirm the job appears in Job Hunti.
7. Repeat the save to verify the duplicate message and Open in Job Hunti link.
8. Select text on a page and use Use selection for Company or Role.
