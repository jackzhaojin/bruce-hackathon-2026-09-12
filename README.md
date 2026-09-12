# Jack and Son — Agents, Everywhere Hackathon

A browser game created by **Jack and Son**, an accepted two-person team made up of Jack and his nine-year-old son, whose gamer name is **Bruce**. They are competing at the **AI Tinkerers Columbus** “Agents, Everywhere” hackathon in Columbus, Ohio, on September 12, 2026.

The game will be built with JavaScript and published as a static site with GitHub Pages. Bruce is currently writing the product requirements document. While that work continues, the repository includes a public OpenRouter test harness that proves the deployment, player-owned key flow, and browser-to-AI connection. The AI's final role in the game remains open.

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
- [ ] Complete the product requirements document
- [ ] Choose the final game concept and project title
- [ ] Build the playable prototype
- [ ] Turn the POC AI connection into the game interaction
- [ ] Record a two-minute demonstration
- [ ] Publish the required social media post
- [ ] Submit before 4:30 PM EDT

## AI direction

The POC uses OpenRouter's browser-accessible chat completions API with a player-supplied key. The team will decide where AI belongs in the game after reviewing the product requirements.

If the finished browser game asks players to supply an API key, it must never include a shared key in source code, Git history, or logs. If players can save their own key in local storage, the game should explain that choice and include a clear **Forget API key** control.

The operating constraints and acceptance checks are recorded in [NON_FUNCTIONAL_REQUIREMENTS.md](NON_FUNCTIONAL_REQUIREMENTS.md).

## Repository

`bruce-hackathon-2026-09-12`

## Event record

See [HACKATHON.md](HACKATHON.md) for the challenge, eligibility rules, technical direction, and required submission materials.

Development progress, decisions, and build-day photos are recorded in the [hackathon log](hackathon-log/README.md).
