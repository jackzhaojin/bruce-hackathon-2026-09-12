# Jack and Son — Agents, Everywhere Hackathon

A browser game created by **Jack and Son**, an accepted two-person team made up of Jack and his nine-year-old son, whose gamer name is **Bruce**. They are competing at the **AI Tinkerers Columbus** “Agents, Everywhere” hackathon in Columbus, Ohio, on September 12, 2026.

The game is **Play Eleven: Block Party**, a JavaScript card game published as a static site with GitHub Pages. Bruce designed the 166-card deck, 11-hole game loop, scoring system, card art, and AI-player behavior. The playable build supports one human and up to nine interactive AI opponents.

## Play the game

Open [Play Eleven: Block Party](https://www.jackzhaojin.com/bruce-hackathon-2026-09-12/), choose a 2–10 player table and a dealer rule, then play all 11 holes. The game always has one human player; every other seat is an AI opponent.

The game works immediately with its local strategy. For live LLM decisions and table talk, paste a player-owned OpenRouter key. An unsaved key lasts only for the current tab. **Save on this device** stores it in local storage, and **Forget key** removes both the session and stored copies. The model defaults to `openrouter/free`, offers `openai/gpt-5.4-nano`, and accepts another OpenRouter model ID.

## Local development

Run `npm test` for the dependency-free game and static-site checks. Run `npm run serve` and open `http://localhost:4173` to play locally. The included preview server refuses requests for `local-only/`, `intake/`, `.git/`, and environment files.

Development keys belong in the ignored `local-only/.env` file described in [local-only/README.md](local-only/README.md). The browser page cannot read that file; paste the key into the page when testing its player-facing flow.

## Project status

- [x] Record the hackathon rules and project constraints
- [x] Initialize the repository and secret-safe ignore rules
- [x] Deploy a public OpenRouter connection test
- [x] Add an ignored local-only secret workflow
- [x] Complete and process the product requirements document
- [x] Choose the game concept and working title: Play Eleven: Block Party
- [x] Build the playable prototype
- [x] Turn the tested AI connection into the game interaction
- [x] Prepare the portal copy, two-minute demo script, and social post
- [x] Record and publish a two-minute demonstration
- [x] Publish the required social media post
- [x] Submit before 4:30 PM EDT

The paste-ready portal fields, video shot list, and social copy are in the [submission package](SUBMISSION.md).

## Product requirements

The processed [Play Eleven product requirements](PRODUCT_REQUIREMENTS.md) define the build. The public-safe [requirements conversation](hackathon-log/artifacts/play-eleven-requirements-session.md) preserves Bruce's design work as a hackathon artifact.

## AI direction

OpenRouter-backed opponents receive only the visible game state and their character profile. They return a real move decision, a short strategic explanation, and family-friendly dialogue. If the key is absent or a request fails, the same game continues with a local strategy so a hole never depends on the network.

If the finished browser game asks players to supply an API key, it must never include a shared key in source code, Git history, or logs. If players can save their own key in local storage, the game should explain that choice and include a clear **Forget API key** control.

The operating constraints and acceptance checks are recorded in [NON_FUNCTIONAL_REQUIREMENTS.md](NON_FUNCTIONAL_REQUIREMENTS.md).

## Repository

`bruce-hackathon-2026-09-12`

## Event record

See [HACKATHON.md](HACKATHON.md) for the challenge, eligibility rules, technical direction, and required submission materials.

Development progress, decisions, and build-day photos are recorded in the [hackathon log](hackathon-log/README.md).
