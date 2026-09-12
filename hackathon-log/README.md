# Hackathon Build Log

This chronological log records the work completed during the AI Tinkerers Columbus “Agents, Everywhere” hackathon. It complements the Git history with project decisions and verification notes.

The [picture log](photos/README.md) captures the team’s build-day story.

## 2026-09-12

### 11:25 EDT — Repository foundation

- Initialized a new Git repository on `main` for the net-new hackathon build.
- Added the README, event record, and JavaScript-focused `.gitignore`.
- Created and pushed the public GitHub repository.
- Enabled GitHub Pages from the repository root and verified a successful build.

### 11:27 EDT — Event identity

- Identified the event as the AI Tinkerers Columbus “Agents, Everywhere” hackathon.
- Recorded that Jack and Son is an accepted team in Columbus, Ohio.
- Verified the documentation update and successful GitHub Pages rebuild.

### 11:30 EDT — Bruce project naming

- Renamed the GitHub repository to `bruce-hackathon-2026-09-12` so it follows the naming convention used for projects with Bruce.
- Updated the local Git remote and repository links in the documentation.
- Verified the renamed public repository and GitHub Pages URL.

### 11:39 EDT — Team and workflow alignment

- Clarified that the team has two members: Jack and his nine-year-old son, whose gamer name is Bruce.
- Recorded that Bruce is currently writing the product requirements document.
- Changed the AI integration from an assumed OpenRouter plan to an open decision that will follow the product requirements.
- Added repository instructions requiring this log to be updated throughout the hackathon.
- Recorded standing authorization to commit and push in-scope hackathon work.

### 11:52 EDT — Hackathon picture log

- Moved the written build log into the `hackathon-log` folder.
- Started a dated picture log with a photo of Jack and Bruce building together while Bruce continues the product requirements document.
- Converted the original HEIC photo into a 1600×1200 JPEG suitable for the web.
- Reduced the image from 4.1 MB to about 518 KB and verified that the JPEG has no detectable location or camera metadata.

### 11:55 EDT — Submission deadline confirmed

- Confirmed from the authenticated event portal that the project submission deadline is 4:30 PM EDT.
- Recorded Round 1 judging at 5:00 PM EDT and final judging completion at 5:30 PM EDT.
- Updated the project checklist and event record with the exact submission cutoff.

### 12:02 EDT — Earlier room photo added

- Added the team’s 11:26 AM photo from the room where Jack and Bruce started the hackathon day.
- Converted the 3.3 MB HEIC source into a web-friendly 1600×1200 JPEG of about 435 KB.
- Verified the converted JPEG visually and confirmed it has no detectable location or camera metadata.

### 12:28 EDT — OpenRouter POC prepared

- Reviewed `bruce-play-ten` and adopted its dependency-free HTML, CSS, and JavaScript deployment pattern from the root of `main`.
- Defined non-functional requirements for GitHub Pages, public access, player-owned OpenRouter keys, security, reliability, performance, accessibility, and maintainability.
- Built Bruce’s Agent Lab as a temporary public AI test harness while Bruce continues the BRD.
- Added an explicit Save key button backed by local storage, a Forget key control, HTTPS redirection, a restrictive Content Security Policy, request timeout handling, and visible diagnostics.
- Defaulted the harness to `openrouter/free` and provided `openai/gpt-5.4-nano` as a more consistent low-cost option.
- Added the ignored `local-only/.env` secret workflow and confirmed the user's key file cannot be committed.
- Verified the local app and assets over HTTP, passed four automated static and security tests, and completed a full-page browser visual review.
- Confirmed OpenRouter CORS preflight from the production origin and successfully tested both model options with the ignored local key.
- Used a fake key in Chrome to verify Save across reload, Forget, required-field validation, and safe authentication-error display.

### 12:31 EDT — OpenRouter POC published

- Committed and pushed the public test harness to `main` in commit `aa4725b`.
- Confirmed GitHub Pages completed its build from the repository root.
- Opened the public HTTP address in Chrome and verified that it redirected to HTTPS.
- Confirmed the live page loaded its interface, model choices, key controls, prompts, and diagnostics successfully.
- Left the verified public page open in Chrome for Jack and Bruce to try.
