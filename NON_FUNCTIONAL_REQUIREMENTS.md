# Non-Functional Requirements

These requirements define how the hackathon game must operate regardless of the final game design in Bruce's BRD.

## Deployment and portability

- The game must deploy as a static site from the repository's `main` branch using GitHub Pages.
- The site must use relative asset paths so it works under the `/bruce-hackathon-2026-09-12/` project path.
- The core app must use plain HTML, CSS, and JavaScript with no required build step, matching the proven deployment approach in `bruce-play-ten`.
- The public page must redirect to HTTPS before displaying any API-key controls.
- A fresh clone must run locally with any simple static file server.

## Public access and AI connectivity

- Anyone with the public URL must be able to load the game without an account on this site.
- AI calls in the POC must go directly from the player's browser to OpenRouter's chat completions endpoint.
- Each player must provide their own OpenRouter API key; the project must not publish or proxy a shared key.
- The POC must default to `openrouter/free`, offer the low-cost `openai/gpt-5.4-nano` model as a more consistent option, and allow another model ID.
- The final AI role and model may change after the BRD is complete, but the key-management and request path should remain reusable.

## Security and privacy

- API keys, tokens, and secrets must never appear in committed files, Git history, application logs, query strings, or rendered output.
- The API key must be held in memory unless the player explicitly presses a button to save it in browser local storage.
- The interface must provide a visible control that removes the saved key.
- The page must explain that local storage is readable by JavaScript running on the same origin.
- The save-key explanation must remain clear that the custom-domain origin can be shared by other project pages.
- The POC must load no third-party scripts and must restrict network requests with a Content Security Policy.
- Prompts and keys must be sent only to OpenRouter for the requested completion.
- Development secrets must live under the ignored `local-only/` directory.

## Reliability and feedback

- The interface must prevent duplicate submissions while a request is running.
- Requests must time out after 45 seconds and provide a useful recovery message.
- Authentication, billing/access, rate-limit, empty-response, timeout, and general network failures must be shown without exposing the key.
- Successful requests must display the responding model, round-trip time, and token usage when OpenRouter reports it.
- The game itself must remain usable if local storage is unavailable.

## Performance and compatibility

- The initial app shell, excluding hackathon-log photos, should remain small enough to load quickly on a mobile connection.
- The interface must work at widths down to 320 pixels and on current Chrome, Edge, Safari, and Firefox releases.
- The POC should avoid runtime dependencies, external fonts, and large media assets.

## Accessibility and usability

- Every form field must have a visible label and every interactive control must work with a keyboard.
- Status and model responses must be announced through an accessible live region.
- Focus indicators and readable color contrast must be preserved.
- The layout must respect reduced-motion preferences.
- Key storage must be opt-in and explained in plain language.

## Maintainability and hackathon evidence

- The implementation must stay easy to modify when Bruce's BRD arrives.
- Material work, decisions, and verification must be recorded in `hackathon-log/README.md`.
- The public repository and commit history must make the work completed during the event easy to identify.

## POC acceptance checks

- [x] The root page loads locally with no build step.
- [ ] The page redirects its public HTTP address to HTTPS.
- [x] An empty key cannot submit a request.
- [x] A player can explicitly save a key with the Save key button.
- [x] The Forget button removes both the field value and saved key.
- [x] OpenRouter accepts browser preflight from the production origin.
- [x] A valid key produces a visible model response from both the low-cost option and the free router.
- [x] An invalid key produces a useful error without revealing the key.
- [ ] The deployed GitHub Pages page loads its HTML, CSS, and JavaScript successfully.
