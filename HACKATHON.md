# AI Tinkerers Columbus — Agents, Everywhere

This repository was created for the **Agents, Everywhere** hackathon organized by **AI Tinkerers Columbus** on September 12, 2026.

## Event

- **Organizer:** AI Tinkerers Columbus
- **Hackathon:** Agents, Everywhere
- **Format:** In-person Columbus build day connected to one global challenge
- **Venue:** Rev1 Labs
- **Address:** 1275 Kinnear Rd., Columbus, OH 43212
- **Date:** September 12, 2026
- **Event hours:** 10:00 AM–5:00 PM EDT
- **Food and drinks:** Provided
- **Parking:** Free on-site parking at Rev1 Labs
- **Team status:** Accepted
- **Event portal:** [AI Tinkerers Columbus hackathon portal](https://columbus.aitinkerers.org/hackathons/h_Lv03K-ob6sU/handbook)

## Columbus build-day schedule

All times are Eastern Time on September 12, 2026.

| Time | Activity |
| --- | --- |
| 10:00–10:30 AM | Doors open, food, check-in, and meeting potential teammates |
| 10:30–11:00 AM | Shared global opening and starter-kit walkthrough |
| 11:00–11:15 AM | Team formation |
| 11:15 AM–3:30 PM | Build session |
| 3:30–4:00 PM | Complete project submissions in the portal |
| 4:00–4:45 PM | Optional local show-and-tell after submitting |
| 4:45–5:00 PM | Wrap and group photo |

The Columbus show-and-tell is for sharing and learning; there is no formal local judging. The portal's **4:30 PM EDT** cutoff below is the authoritative submission deadline.

## Key deadlines

All times are in America/New_York on September 12, 2026.

- **11:30 AM EDT:** Team formation closed
- **4:30 PM EDT:** Project submission deadline
- **5:00 PM EDT:** Round 1 judging ratings due
- **5:30 PM EDT:** Final judging completes

## Team

- **Team name:** Jack and Son
- **Team size:** Two
- **Members:** Jack and his nine-year-old son, whose gamer name is Bruce
- **Current work:** Building from Bruce's completed product requirements
- **Working project title:** Play Eleven: Block Party
- **Public GitHub repository:** [bruce-hackathon-2026-09-12](https://github.com/jackzhaojin/bruce-hackathon-2026-09-12)

## Challenge

Build an agent for a place where people already work, talk, or live, then make that place meaningfully more useful because the agent understands its context.

Possible environments include the web, mobile, Slack, Teams, messaging, browsers, workplace software, voice, wearables, robotics, or a new environment.

## Project direction

- Play Eleven is a dependency-free browser game built with HTML, CSS, and JavaScript.
- OpenRouter-backed opponents reason from the visible game state, choose legal moves, explain their strategy, and speak in distinct personalities.
- A local strategic fallback keeps the complete game playable when a player does not provide a key or an AI request fails.
- Keep the scope tight enough to finish and demonstrate by the end of the hackathon.
- Host the finished static game with GitHub Pages.
- If the game needs a player-supplied API key, ask for it at runtime.
- If the player chooses to save a key, keep it only in that browser's local storage and provide a way to remove it.
- Never commit an API key or place one in the published source.

See [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) for Bruce's game design and [NON_FUNCTIONAL_REQUIREMENTS.md](NON_FUNCTIONAL_REQUIREMENTS.md) for the deployment, security, accessibility, reliability, and game acceptance requirements.

## Build eligibility

The submitted project must be a net-new build created during the official hackathon period. Existing templates, reusable components, libraries, prompts, starter code, and other building blocks are allowed, but the submitted project and its core functionality must be built during the event.

The team should be ready to explain which parts were created during the hackathon. Git history should be kept as a simple record of the work.

## Definition of a real prototype

By the end of the day, the project should have a working core interaction that can be demonstrated. The chosen environment must matter to the experience, and the prototype should prioritize a small polished game loop over a broad unfinished feature set.

## Required submission

Every team must submit all five items by **4:30 PM EDT on September 12, 2026**:

1. A project title
2. A written description
3. A public GitHub repository
4. A two-minute demonstration video
5. A social media post about the project that tags the event partners

Every eligible project enters the same global competition.

## Event partners

- **Global sponsors:** OpenAI, CopilotKit, and OpenRouter
- **Developer infrastructure partners:** Exa, Trigger.dev, Auth0, Mozilla, and Ambiguous AI
- **Local sponsors:** Rev1 Ventures, TeamClaws, and GDG Columbus

Teams may choose the tools and offers that improve their project; they do not need to use every part of the sponsor stack.

## Global prizes

Every eligible project from the participating cities and virtual event enters one global review process.

- **First place:** $10,000 in OpenAI credits, a Mac mini for every team member, $1,000 in Exa credits, and Exa swag
- **Second place:** $5,000 in OpenAI credits, Ray-Ban Meta glasses for every team member, $500 in Exa credits, and Exa swag
- **Third place:** $2,500 in OpenAI credits, a LOOI Robot for every team member, $250 in Exa credits, and Exa swag
- **Best Use of Ambiguous AI:** One NVIDIA DGX Spark for the winning team
- **Best Use of CopilotKit:** Purple AirPods Max for every team member

## Demo checklist

- Open with the player problem or opportunity.
- Show why the browser game is the right environment for the agent.
- Demonstrate the complete core game loop.
- Show the AI changing the experience in a meaningful way.
- Keep the recorded demonstration at or under two minutes.
- Avoid showing an API key, browser storage, private tabs, or other secrets in the recording.
