# Chrome Web Store listing draft

## Name

Job Hunti Clip

## Short description

Save jobs from any website to your Job Hunti tracker.

## Category

Productivity

## Detailed description

Job Hunti Clip helps you save a job opportunity while you browse. Open the extension on a job page, review the detected company, role, and job details URL, optionally add an application link, then save it to your Job Hunti account.

You stay in control of every capture:

- Review and edit extracted fields before saving.
- Use the current page as the job details URL.
- Save a job even when a direct application link is unavailable.
- Select text on the page and use it as the company or role.
- Detect duplicate jobs and open the existing Job Hunti record.
- See the public Job Hunti username currently associated with the session.

Job Hunti Clip does not submit applications, show ads, sell data, or collect browsing history.

## Permission justifications

- `activeTab`: read the active job page only after the user opens the extension.
- `contextMenus`: let the user explicitly send selected text to the Company or Role field.
- `scripting`: inject the extractor into the active page after the user opens the extension.
- `storage`: remember the configured Job Hunti API and website endpoints.
- `tabs`: identify the active page and use its URL/title as extraction fallbacks.

## Privacy

Privacy policy: `https://jobhunti.space/privacy`

The extension reads the active page to extract job information and sends selected job fields to Job Hunti only after the user clicks Save job. It uses the user's existing Job Hunti session and does not sell or use the data for advertising.

## Reviewer notes

Use the reviewer instructions in `apps/extension/README.md`. A reviewer needs a Job Hunti account to verify authenticated saving. The extension's production API is `https://api.jobhunti.space/api` and its website is `https://jobhunti.space`.
