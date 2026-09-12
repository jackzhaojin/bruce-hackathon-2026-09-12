# Jack and Son — Agents, Everywhere Hackathon

A browser game created by **Jack and Son**, an accepted two-person team made up of Jack and his nine-year-old son, whose gamer name is **Bruce**. They are competing at the **AI Tinkerers Columbus** “Agents, Everywhere” hackathon in Columbus, Ohio, on September 12, 2026.

The game is **Play Eleven: Block Party**, a JavaScript card game published as a static site with GitHub Pages. Bruce designed the 166-card deck, 11-hole game loop, scoring system, card art, and AI-player behavior. The repository currently includes a public OpenRouter test harness that proves the deployment, player-owned key flow, and browser-to-AI connection.

## Live POC

Open [Bruce's Agent Lab](https://www.jackzhaojin.com/bruce-hackathon-2026-09-12/) and supply your own OpenRouter API key. The page defaults to the `openrouter/free` router, offers the low-cost `openai/gpt-5.4-nano` model, and can test any model ID available to the key. A dedicated button saves the key in local storage when the player chooses to remember it.

## Local development

Run `npm test` for dependency-free static checks. Run `npm run serve` and open `http://localhost:4173` to use the harness locally.

Development keys belong in the ignored `local-only/.env` file described in [local-only/README.md](local-only/README.md). The browser page cannot read that file; paste the key into the page when testing its player-facing flow.

## Project status

- [x] Record the hackathon rules and project constraints
- [x] Initialize the repository and secret-safe ignore rules
- [x] Deploy a public OpenRouter test harness
- [x] Add an ignored local-only secret workflow
- [x] Complete and process the product requirements document
- [x] Choose the game concept and working title: Play Eleven: Block Party
- [ ] Build the playable prototype
- [ ] Turn the POC AI connection into the game interaction
- [ ] Record a two-minute demonstration
- [ ] Publish the required social media post
- [ ] Submit before 4:30 PM EDT

## Product requirements

The processed [Play Eleven product requirements](PRODUCT_REQUIREMENTS.md) define the build. The public-safe [requirements conversation](hackathon-log/artifacts/play-eleven-requirements-session.md) preserves Bruce's design work as a hackathon artifact.

## AI direction

The POC uses OpenRouter's browser-accessible chat completions API with a player-supplied key. In the game, OpenRouter-backed opponents will reason from the visible game state and explain their moves in plain language.

If the finished browser game asks players to supply an API key, it must never include a shared key in source code, Git history, or logs. If players can save their own key in local storage, the game should explain that choice and include a clear **Forget API key** control.

The operating constraints and acceptance checks are recorded in [NON_FUNCTIONAL_REQUIREMENTS.md](NON_FUNCTIONAL_REQUIREMENTS.md).

## Repository

`bruce-hackathon-2026-09-12`

## Event record

See [HACKATHON.md](HACKATHON.md) for the challenge, eligibility rules, technical direction, and required submission materials.

Development progress, decisions, and build-day photos are recorded in the [hackathon log](hackathon-log/README.md).
