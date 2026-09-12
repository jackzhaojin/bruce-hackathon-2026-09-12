# Play Eleven: Block Party — Submission Package

Use this page as the copy-and-paste source for the AI Tinkerers submission portal. The submission deadline is **September 12, 2026 at 4:30 PM EDT**.

## Fast submission order

1. Paste the project name, description, products, contributions, links, and prior-work disclosure below, then use **Save Draft**.
2. Paste the verified 1:59 YouTube demonstration URL below.
3. Repost the video on LinkedIn with the copy below, put the public LinkedIn post URL in **Social Media Post URL 1**, and save again.
4. Check every field before selecting **Submit Entry**.

The portal labels the video optional, but the event handbook lists a two-minute demonstration video as a required submission item. Treat it as required. Never show or paste an OpenRouter key in the recording, submission text, or social post.

## Portal fields

### Project Name

```text
Play Eleven: Block Party
```

### Project Description

```text
Play Eleven: Block Party is a browser-based family card game designed by nine-year-old Bruce and built with his dad, Jack, at AI Tinkerers Columbus. One human plays 11 holes against up to nine AI characters. The opponents live inside the card table: they observe only legally visible game state, choose real moves, explain their strategy, and trade short, family-friendly table talk. That context makes them more useful than a separate chatbot because every AI response is tied to the cards, score, turn, opponents, and rules in front of the player.

Bruce created the 166-card deck, scoring system, flow, visuals, AI personalities, and seven-card Skip rule. Jack directed and tested the implementation with OpenAI Codex as a dependency-free HTML, CSS, and JavaScript game hosted on GitHub Pages. AI turns call OpenRouter directly from the player's browser and return structured JSON decisions. A player-owned key can stay in memory or be explicitly saved to local storage, while a validated local strategy keeps the game playable without a key or during a network or model failure.

The finished prototype includes 2–10 player setup, all 11 holes, distinct opponent personalities, autosave and recovery, accessible controls, responsive tablet and desktop layouts, and automated rule and security checks. Play Eleven turns an AI opponent into part of family game night.
```

### Products & Tools Used

Select these portal checkboxes:

- AI Tinkerers
- OpenAI
- OpenRouter
- Rev1 Ventures

Do not select the other sponsor tools unless the game actually uses them.

**Other Products:**

```text
GitHub, GitHub Pages, vanilla HTML/CSS/JavaScript, Node.js, Chrome
```

### Team Contributions

The copied form shows one contribution box under Jack Jin. Paste this combined team account there so Bruce receives clear credit:

```text
Bruce was the game designer and play-tester. He created the 166-card deck, 11-hole structure, scoring and bonus rules, visual direction, opponent personalities, and seven-card Skip rule. He reviewed the game throughout the day and reported the final rule defect during play-testing. Jack directed and tested the implementation with OpenAI Codex, built the dependency-free HTML/CSS/JavaScript game, integrated OpenRouter's chat-completions API for structured AI moves and table talk, added autosave, security, accessibility, and tests, deployed the game on GitHub Pages, and completed local and production playthroughs. The project and its core functionality were created during the hackathon.
```

### Project Video

Verified public YouTube Shorts URL (**1:59**):

```text
https://youtube.com/shorts/9rJ8PU0GHDw?feature=share
```

### Additional Links

**Link 1**

```text
https://www.jackzhaojin.com/bruce-hackathon-2026-09-12/
```

Description:

```text
Play the public game
```

**Link 2**

```text
https://github.com/jackzhaojin/bruce-hackathon-2026-09-12
```

Description:

```text
Public source code and project documentation
```

**Link 3**

```text
https://github.com/jackzhaojin/bruce-hackathon-2026-09-12/tree/main/hackathon-log
```

Description:

```text
Build-day log and picture log
```

### Prior Work

```text
Play Eleven is a net-new project created during the official hackathon period. It builds on reusable interaction patterns from our pre-existing Play Ten browser game, including the 2×4 card grid, draw/discard loop, autosave and menu patterns, and opponent-name inspirations. Bruce created the Play Eleven concept, 166-card deck, scoring and bonuses, 11-hole structure, AI behavior, and all game-specific rules during the event. The Play Eleven implementation, OpenRouter decision contract, interface, tests, deployment, documentation, and demo were created during the hackathon. No pre-existing Play Eleven project was extended or resubmitted.
```

### Social Media Posts

Publish at least one public post, then paste its URL into **Social Media Post URL 1**. The other two URL fields are optional.

## Two-minute demonstration video

Record three short clips and trim them together. This avoids spending the video waiting for a model response or playing an entire hole. Record the live GitHub Pages build in Chrome with the OpenRouter key already saved, the model set to `openai/gpt-5.4-nano`, notifications off, and unrelated tabs closed.

| Time | What to show | Voiceover |
| --- | --- | --- |
| 0:00–0:12 | Title screen and Jack and Bruce team photo | “Hi, we're Jack and Bruce, a father-and-son team building at AI Tinkerers Columbus. Bruce is nine, and he designed Play Eleven: Block Party.” |
| 0:12–0:30 | Main menu, player count, AI-ready status, and Start Game | “It's an 11-hole card game for one human and up to nine AI opponents. The agents live inside the card table: they see only visible cards and scores, choose legal moves, explain their strategy, and talk in character.” |
| 0:30–0:45 | Dealer choice and opening two cards | “Bruce invented all 166 cards, their values, the scoring rules, and the dealer and turn flow. We built it in plain HTML, CSS, and JavaScript and deployed it on GitHub Pages.” |
| 0:45–1:15 | A human draw/discard/flip or swap, followed by Chip's OpenRouter move and table talk | “On my turn I can commit to the discard, or draw, keep, swap, or discard and flip. Chip reads the visible state through OpenRouter, returns a structured move, and tells us why. If the model or network fails, a validated local strategy keeps the game moving.” |
| 1:15–1:32 | A prepared seven-visible-card turn showing both **Skip** and the last face-down card | “Here seven cards are visible. Bruce caught this rule during play-testing: after discarding a deck draw, I can reveal the last card or press Skip and keep it face down.” |
| 1:32–1:49 | Hole scorecard, then final standings or the build log | “Every hole reveals and scores the two-by-four grid, including matching pairs and Bruce's bonuses. Autosave and recovery protect an in-progress game, and our public build log shows what we created today.” |
| 1:49–2:00 | Public game URL and repository | “Play Eleven turns an AI opponent into part of family game night. You can play it now from our public repository. Thanks!” |

### Recording checklist

- Keep the finished video at **1:50–1:58** so upload processing or title cards cannot push it over two minutes.
- Use jump cuts between the opening, an AI turn, the seven-card Skip choice, and scoring.
- Make the browser text large enough to read at 720p or 1080p.
- Capture at least one real OpenRouter move with its explanation and character dialogue visible.
- Keep the key input off-screen. Do not open browser storage or developer tools while recording.
- End on both the playable URL and GitHub repository URL.
- Upload to YouTube as **Unlisted** or **Public**, or use a Loom link that works in a logged-out window.
- Test the finished link in a private window and confirm its displayed duration is no more than two minutes.

Suggested video title:

```text
Play Eleven: Block Party — AI Tinkerers Agents Everywhere Demo
```

Suggested video description:

```text
Play Eleven: Block Party is a family card game designed by nine-year-old Bruce and built with his dad, Jack, at the AI Tinkerers Columbus Agents Everywhere hackathon. One human plays up to nine interactive AI opponents powered by OpenRouter, with a local strategy fallback.

Play: https://www.jackzhaojin.com/bruce-hackathon-2026-09-12/
Code: https://github.com/jackzhaojin/bruce-hackathon-2026-09-12
```

## Social post

LinkedIn is the easiest single post because it has room for the story, links, and all partner names. When pasting, type `@` before each partner name and select the official company page so the names become real tags.

```text
Built today with my nine-year-old son Bruce at AI Tinkerers Columbus: Play Eleven: Block Party. 🃏⛳

Bruce designed a 166-card, 11-hole family game. I helped turn it into a browser game where one human plays up to nine AI opponents. Chip and friends see the visible table, make real moves through OpenRouter, explain their strategy, and talk in character. The agent belongs at the card table instead of in a separate chat window.

It runs as a dependency-free GitHub Pages site, works with a player-owned OpenRouter key, and falls back to a local strategy. We also added autosave, recovery, accessible controls, and responsive layouts.

Play: https://www.jackzhaojin.com/bruce-hackathon-2026-09-12/
Code: https://github.com/jackzhaojin/bruce-hackathon-2026-09-12
Demo: https://youtube.com/shorts/9rJ8PU0GHDw?feature=share

Built for #AgentsEverywhere. Thank you to AI Tinkerers, OpenAI, CopilotKit, OpenRouter, Exa, Auth0, Ambiguous AI, Trigger.dev, Mozilla.ai, and Google Cloud for supporting the global build day, and to Rev1 Ventures for hosting us in Columbus.
```

Optional X thread:

**Post 1**

```text
Built with my 9-year-old son Bruce at @AITinkerers Columbus: Play Eleven: Block Party. 🃏 One human plays 11 holes against AI opponents that make real moves, explain strategy, and talk through @openrouter. #AgentsEverywhere

https://www.jackzhaojin.com/bruce-hackathon-2026-09-12/
```

**Post 2**

```text
Bruce designed 166 cards, scoring, AI personalities, and the seven-card Skip rule. Built with @OpenAI Codex and GitHub Pages.

Thanks @CopilotKit @exaailabs @auth0 @ambiguousio @triggerdotdev @mozillaAI @googlecloud!

https://github.com/jackzhaojin/bruce-hackathon-2026-09-12
```

## Final portal check

- [ ] Project name says **Play Eleven: Block Party**, not the default team name.
- [ ] Description is pasted in full.
- [ ] Products and Other Products are filled accurately.
- [ ] Combined Jack and Bruce contribution is pasted.
- [x] Video opens publicly and is no longer than two minutes (verified at 1:59).
- [ ] All three additional links open.
- [ ] Prior-work disclosure is included.
- [ ] Social post is public, includes `#AgentsEverywhere`, and tags the partner pages.
- [ ] Social post URL is pasted into the first required URL field.
- [ ] **Save Draft** reports the required fields complete.
- [ ] **Submit Entry** is selected before 4:30 PM EDT.
