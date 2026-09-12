# Jack and Son — Agents, Everywhere Hackathon

A browser game created by **Jack and Son**, an accepted parent-and-son team at the **AI Tinkerers Columbus** “Agents, Everywhere” hackathon in Columbus, Ohio, on September 12, 2026.

The game will be built with JavaScript, use AI as part of its core interaction, and be published as a static site with GitHub Pages. The product requirements are currently being written.

## Project status

- [x] Record the hackathon rules and project constraints
- [x] Initialize the repository and secret-safe ignore rules
- [ ] Complete the product requirements document
- [ ] Choose the final game concept and project title
- [ ] Build the playable prototype
- [ ] Add the AI interaction
- [ ] Publish with GitHub Pages
- [ ] Record a two-minute demonstration
- [ ] Publish the required social media post
- [ ] Submit before the portal deadline

## AI key handling

The current plan is to let each player enter their own OpenRouter API key in the browser. The key may be stored in the player's browser using local storage so it survives a refresh. It must never be included in source code, committed to Git, printed in logs, or sent anywhere except the selected AI API.

Because local storage can be read by JavaScript running on the same site, the finished game should include a clear **Forget API key** control and avoid third-party scripts where possible. The repository's `.gitignore` excludes local environment files, but that does not protect a key hardcoded into a JavaScript file.

## Repository

`bruce-hackathon-2026-09-12`

## Event record

See [HACKATHON.md](HACKATHON.md) for the challenge, eligibility rules, technical direction, and required submission materials.
