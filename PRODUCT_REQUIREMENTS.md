# Play Eleven: Block Party

> Public build copy processed from the local intake on September 12, 2026. The child designer is identified by the gamer name **Bruce**. Items marked `[ASSUMPTION]` still need confirmation.

## Product Requirements Document (PRD) v0.1

**Date:** September 12, 2026
**Lead game designer:** Bruce
**Producer / build lead:** Jack
**Scribe:** Claude (requirements captured verbatim from Bruce, then organized)
**Status:** Draft for build, updated with Jack and Bruce's post-intake decisions. Assumptions are marked `[ASSUMPTION]`. Open questions are collected in Section 15.

---

## 1. Overview

Play Eleven is the third game Bruce and Jack are building together, after **Play Ten** and **Lava Dash**. It is a digital card game in the Play Nine family, themed on **Topgolf's Block Party** game mode (Play Nine = putt-putt with one hole, Play Ten = Topgolf with many targets, Play Eleven = Block Party).

Players are dealt a 2x4 grid of face-down cards, flip and swap cards over a series of turns, and try to finish each hole with the **lowest** score. The game runs **11 holes**. Lowest total after hole 11 wins.

Play Eleven shares most of its structure with Play Ten (same grid, same draw/discard loop, same autosave and menu patterns) but has a **new 166-card deck**, a **new bonus system**, and a **bigger table (2 to 10 players)**.

### 1.1 Hackathon context (from Jack)

- Built for an **AI hackathon**. The game must be AI-driven *inside the game*, not just AI-built.
- The AI opponents (Chip and friends) should be real LLM-backed players via **OpenRouter**.
- The existing **play-ten repository** holds the rules and code Play Eleven is based on; the build agent has access to it.
- Everything Bruce said in the requirements session is preserved in the companion conversation log (hackathon artifact).

---

## 2. Goals

1. Ship a playable Play Eleven with the full 166-card deck and Bruce's scoring rules.
2. AI opponents that actually reason: Chip **explains his moves** in plain language.
3. Reuse Play Ten's proven UI patterns (grid, discard pile, showing score, autosave, and menus).
4. Cross-navigation between Play Ten, Lava Dash, and Play Eleven from a shared menu.

## 3. Non-goals (v0.1)

- Online multiplayer with real remote humans. Every game has one human player; all remaining seats are AI opponents.
- Other Topgolf modes (Angry Birds, Sonic, Shot Shuffle, etc.) mentioned during Play Ten. Not in scope here.

---

## 4. Players

| Game | Players |
|---|---|
| Lava Dash | 1 or 2 |
| Play Ten | 2 to 5 |
| **Play Eleven** | **2 to 10** ("ten people can play because there are lots of cards") |

- Player count is chosen on the main menu (buttons for 2 through 10).
- `[ASSUMPTION]` Once a game starts, the player count is **locked** until all 11 holes are done. (Bruce: "you can't make any more room until the game is over, and you can't delete any until the game is over.")
- **Seat 1 is the only human player. Every other seat is an AI opponent.** Jack and Bruce confirmed this after the intake was processed.

---

## 5. The Deck

**166 cards total.** On holes 1, 2, and 3 the three purple cards are removed, so the deck is **163 cards**. Purple is in play on holes 4 through 11 (8 of 11 holes, about 73%).

Every card shows its **name** and its **point value**. If there is more than one copy of a card, all copies look identical.

### 5.1 Target cards (negative values, solid color)

| Card | Value | Count | Art |
|---|---|---|---|
| Gray | -25 | 1 | Whole card gray |
| Purple | -22 | 3 | Whole card purple (holes 4 to 11 only) |
| White | -20 | 1 | Whole card white |
| Blue | -15 | 1 | Whole card blue |
| Brown | -10 | 1 | Whole card brown |
| Green | -9 | 1 | Whole card green |
| Yellow | -5 | 2 | Whole card yellow |
| Red | -1 | 4 | Whole card red |

Bruce: "Those are for the targets."

### 5.2 Zero and positive cards

| Card | Value | Count | Art |
|---|---|---|---|
| Any Target | 0 | 8 | The Topgolf TV screen showing Block Party, with the purple spots |
| Strike | +1 | 8 | Text "Completed on attempt 1"; card color changes by hole (see 5.3) |
| Birdie | +2 | 8 | `[ASSUMPTION]` Reversed hole-color order (see 5.3); Bruce did not confirm which card the reversed order belongs to |
| Fastball | +3 | 8 | A ball running toward a target |
| Far Ball | +4 | 8 | The blue target with a ball running toward it |
| 5 Red Ball = 5 | +5 | 8 | Five red balls |
| 6 Orange Ball = 6 | +6 | 8 | Six orange balls |
| 7 Yellow Ball = 7 | +7 | 8 | Seven yellow balls |
| 8 Green Ball = 8 | +8 | 8 | Eight green balls |
| 9 Blue Ball = 9 | +9 | 8 | Nine blue balls |
| Ten | +10 | 8 | Ten purple balls |
| Eleven | +11 | 8 | Eleven pink balls |
| No Target | +12 | 8 | A target with an X over it |
| Out of Bounds | +13 | 8 | A tall stick with a circle on top (the Practice Mode pole marker at Topgolf) |
| Game Over | +14 | 8 | A game controller |
| Time Up | +15 | 8 | A clock |
| Didn't Register | +16 | 8 | A ball falling down the net |
| Club Hazard | +17 | 8 | A club stuck in the net |
| Net Hazard | +18 | 8 | A ball, a person, and a club all falling into the net (the worst card in the deck) |

Count check: 14 target cards + 8 Any Target + 18 named types x 8 = 14 + 8 + 144 = **166**.

### 5.3 Hole-based card colors (Strike, and the reversed set)

Strike's art reads "Completed on attempt 1" and the card's color depends on the current hole:

| Hole | Strike color | Reversed order (Birdie `[ASSUMPTION]`) |
|---|---|---|
| 1 | Red | Brown |
| 2 | Orange | Black |
| 3 | Yellow | Gray |
| 4 | Green | White |
| 5 | Blue | Pink |
| 6 | Purple | Purple |
| 7 | Pink | Blue |
| 8 | White | Green |
| 9 | Gray | Yellow |
| 10 | Black | Orange |
| 11 | Brown | Red |

The reversed column is exactly the Strike order backwards (Bruce confirmed the pattern; the card it belongs to is Open Question 5).

Implementation note: these two card faces are **dynamic per hole**, so card rendering needs the current hole number.

---

## 6. Game Setup

1. **Shuffle** the deck randomly (163 cards on holes 1 to 3, 166 from hole 4 on).
2. **Deal order draw:** each player is dealt one card face up.
   - **Lowest card deals.**
   - **Highest card goes first.**
   - Any tie on *any* card (including negatives and zeros: yellow/yellow, purple/purple, red/red, Any Target/Any Target) means reshuffle and redraw until every card is different.
   - Example: Player 1 draws Didn't Register (16), Player 2 draws Net Hazard (18). Player 1 deals, Player 2 goes first.
3. **Deal option on the menu** (chosen after picking player count): **Lowest card deals**, **Highest card deals**, or **Random person deals**.
   - `[ASSUMPTION]` "Highest card deals" simply flips the rule (highest deals, lowest goes first). "Random person deals" picks a random dealer and the player after them goes first. See Open Question 7.
4. Each player gets **8 cards**, laid out **2 rows by 4 columns**, all **face down**.
5. Each player **flips any 2 cards** to start. Any two are allowed; flipping both cards in one column is the smart play, but not required.

**Turn order** across holes: the first player rotates each hole (Bruce's two-player example: Player 2 first on hole 1, Player 1 first on hole 2, and so on). `[ASSUMPTION]` With more than 2 players, play proceeds in seat order after the first player, and the first-player token advances one seat per hole.

---

## 7. Taking a Turn

On your turn, do **one** of the following:

- **Take the top card of the discard pile**, then swap it for one of your cards. The card you swapped out goes on the discard pile.
- **Draw from the deck**, then either:
  - **Keep it:** swap it for any one of your cards, whether that card is face up or face down. The replaced card goes face up on the discard pile.
  - **Don't want it:** put the drawn card on the discard pile and **flip any one of your face-down cards**.

**Seven-card skip rule (confirmed by Bruce):** if exactly 7 grid cards are already face up, a player who draws from the deck and discards that draw may choose either to flip the final face-down card or to **skip the flip and end the turn with that card still face down**. The interface must show both choices: the remaining card can be touched to flip it, or the player can touch a **Skip** button. This rule applies to human and AI players. It does not change the commitment rule for a card taken from the discard pile.

Bruce's worked example: Player 2 sees a 5 on the discard pile, doesn't want it, draws a Net Hazard, discards it, and flips a card (which turns out to be a Net Hazard). Player 1 draws a Club Hazard, discards it, flips a card (Net Hazard). Player 1 then draws a Strike and swaps it for a random face-down card, which turns out to have been a Club Hazard.

Bruce confirmed after the intake was processed that a drawn card may replace either a face-up or face-down grid card. A replaced face-down card is revealed when it is discarded.

Play Ten's **commitment rule** carries over exactly: players must go with what they touch and cannot retake a card. A card taken from the discard pile **must** replace a face-up or face-down card in that player's grid; it cannot be thrown back or exchanged for a deck draw.

---

## 8. How a Hole Ends

1. The hole ends when **one player has all 8 cards face up**.
2. **Every other player gets one last turn.** The player who ended the hole is done and does not get another turn.
3. After the last turns, each player **flips their remaining face-down cards themselves** and can see what was under them. The game does **not** jump straight to the score sheet.
4. A **Next arrow** appears. Clicking it moves to the score sheet.

`[ASSUMPTION]` Flipped cards count at face value. There is no penalty for the player who ended the hole (no "doubling" rule as in some golf card games; Bruce did not mention one).

---

## 9. Scoring

Scores are per hole, added across all 11 holes. **Lower is better.**

### 9.1 Column scoring (the two cards stacked in one column)

- **Matching pair of any card from 0 through +18** (Any Target through Net Hazard): the column scores **0**. Example: Strike + Strike = 0, not 2.
- **Negative cards do not cancel. They add.**
  - Purple + Purple = **-44**
  - Yellow + Yellow = **-10**
  - Red + Red = **-2**
  - (Gray, white, blue, brown, and green have one copy each, so they can never pair.)
- Any two **different** cards in a column simply add. Examples: Red + Strike = 0. Gray + Purple = -47. Gray + Net Hazard = -7.

### 9.2 Bonuses

There are **two independent bonus families**, and they **stack** (add together).

**A. Pairs bonus** (matched columns; the pairs can be *different* cards)

| Matched columns | Bonus |
|---|---|
| 3 matched columns | **-15** ("three pairs bonus") |
| 4 matched columns | still **-15** (there is no separate four pairs bonus) |

`[ASSUMPTION]` Two matched columns of *different* cards earn **no** pairs bonus. Bruce's final ruling was that the -5 "has to be the same number." See Open Question 3.

**B. Of-a-kind bonus** (the *same* card across matched columns)

| Copies of one card in matched columns | Bonus |
|---|---|
| 4 of a kind (2 columns) | **-5** |
| 6 of a kind (3 columns) | **-15** |
| 8 of a kind (4 columns) | **-20** |

- Only the **largest** of-a-kind bonus applies (six of a kind does not also collect the four of a kind -5).
- Only **full matched columns** count. Six Any Targets arranged as two full pairs plus two singles in other columns = only the four of a kind -5, because only two columns are actually matched.
- The of-a-kind bonus applies to every card that has enough copies: Any Target, Red, Strike, Birdie, Fastball, Far Ball, 5 through 9, Ten, Eleven, No Target, Out of Bounds, Game Over, Time Up, Didn't Register, Club Hazard, Net Hazard. (Yellow and purple can't reach four copies.)
- **Four reds** (two columns of red pairs) score **-9 total**. `[ASSUMPTION]` This is the natural result of the rules above: -2 + -2 from the columns plus the -5 four of a kind bonus = -9. Bruce stated -9 as the number; the breakdown is Claude's reading. See Open Question 4.

### 9.3 Worked examples (all from Bruce)

**Example A: four of a kind + three pairs**

| Column | Cards | Score |
|---|---|---|
| 1 | Game Over + Game Over | 0 |
| 2 | Net Hazard + Net Hazard | 0 |
| 3 | Game Over + Game Over | 0 |
| 4 | Red + Strike | 0 |
| | Three pairs bonus | -15 |
| | Four Game Over bonus | -5 |
| | **Total** | **-20** |

**Example B: six of a kind + three pairs**

| Column | Cards | Score |
|---|---|---|
| 1 | Any Target + Any Target | 0 |
| 2 | Any Target + Any Target | 0 |
| 3 | Yellow + "5 Red Ball = 5" | 0 |
| 4 | Any Target + Any Target | 0 |
| | Three pairs bonus | -15 |
| | Six Any Target bonus | -15 |
| | **Total** | **-30** |

**Example C: eight of a kind**

| Column | Cards | Score |
|---|---|---|
| 1 to 4 | No Target + No Target (x4) | 0 each |
| | Three pairs bonus | -15 |
| | Eight No Target bonus | -20 |
| | **Total** | **-35** |

**Example D: the best possible hole (Bruce's theory)**

| Column | Cards | Score |
|---|---|---|
| 1 | Gray + White | -45 |
| 2 | Purple + Purple | -44 |
| 3 | Purple + Blue | -37 |
| 4 | Green + Brown | -19 |
| | **Total** | **-145** |

(This hand uses every big negative in the deck, so nobody else gets any.)

### 9.4 Score display ("showing")

- When a pair is made, the UI draws a **box around the pair**.
- The **showing** score for a matched column displays **0**. (Physical Play Nine shows 30 for Time Up + Time Up; Play Ten and Play Eleven show 0.)
- `[ASSUMPTION]` "Showing" continues to mean the running total of face-up cards plus any bonuses currently earned, as in Play Ten.

---

## 10. Winning

- The game is **11 holes**.
- After hole 11, add up every player's hole scores. **Lowest total wins.**
- The final screen shows a ranking of all players from best to worst. Bruce's example with 10 players: places 1 through 5 "won" and places 6 through 10 "lost," with the last-place player at 99 and everyone under 100.
- `[ASSUMPTION]` Only first place is the winner; the "top half wins" framing was an example of rankings, not a rule. See Open Question 6.

---

## 11. App Structure and Navigation

### 11.1 Main menu (Play Eleven)

- Player count buttons: **2, 3, 4, 5, 6, 7, 8, 9, 10**
- After choosing players: deal option buttons **Lowest card deals / Highest card deals / Random person deals**
- **Lava Dash** button (goes to Lava Dash, which runs Lava Dash rules)
- **Play Ten** button (goes to Play Ten, which runs Play Ten rules)

### 11.2 Cross-game navigation

Each of the three games links to the other two:

| From | Buttons |
|---|---|
| Play Eleven | Play Ten, Lava Dash |
| Play Ten | Play Eleven, Lava Dash |
| Lava Dash | Play Ten, Play Eleven |

When you enter a game, that game's rules apply. Lava Dash also has its own Claude button.

### 11.3 In-game

- **Main Menu** button available mid-game, giving the choice to go back to the main menu.
- **Autosave:** if the iPad dies or the app is closed mid-game, the game is still there when you come back. Same behavior as Play Ten.
- **Bug recovery:** if the game bugs out mid-hole (Bruce's example: a player has 7 cards flipped, another has 6, and something breaks), show two buttons: **Retake Hole** or **Move On**. The player chooses.
- **Next arrow** after flipping the last cards at hole end (Section 8).

### 11.4 AI interaction

- Play Eleven does **not** need a separate Claude area or Claude button.
- The AI experience lives in Chip and the other opponents at the card table.
- AI opponents talk during the game, explain their moves, and react to cards, matches, bonuses, scores, and other players.
- Their dialogue should be concise, family-friendly, playful, and shaped by distinct personalities so the table feels lively without slowing the game.

---

## 12. AI Players

- **Chip** and the other AI players keep **the same personalities as usual** (as defined in the play-ten / Lava Dash codebase). `[ASSUMPTION]` Names and personalities are sourced from the play-ten repository; they were not restated in this session.
- **Every non-human seat is an interactive AI opponent.** The opponents should talk and react throughout play so the game feels like a fun table of characters rather than silent computer turns.
- **Chip and the other opponents explain their moves.** After acting, an opponent says in plain language what it did and why.
- **Hackathon requirement (Jack):** AI players are backed by an LLM through **OpenRouter**. The LLM must participate in real in-game decisions and generate the opponents' contextual dialogue; scripted heuristics alone do not satisfy this requirement.
- `[ASSUMPTION]` For a 10-player table, AI turns should be fast (parallel or cached prompting, short outputs) so a hole doesn't drag. Design detail for the build agent.
- Suggested minimum AI contract for the build agent: given the visible game state (own grid, discard top, hole number, opponents' face-up cards, purple in play or not) and the opponent's personality, return `{action, target_slot, explanation, dialogue}`.

---

## 13. Strategy Notes (Bruce's, useful for Chip's reasoning and any hints)

- Matching cards in a column is great: any 0 to 18 pair becomes 0.
- Negatives are great if you can get them.
- Don't throw away a bigger negative to keep a smaller one (drawing a gray and discarding a purple is a mistake).
- Put a new negative on the card **next to** an existing negative, not on top of it. Gray + Purple in a column = -47, versus Gray + Net Hazard = -7.
- When flipping your first two cards, flipping a whole column is usually best.
- With seven cards face up, decide whether revealing the last card now is worth ending the hole; after discarding a deck draw, skipping that final flip is legal.
- Bruce's Play Ten records: best hole -48, best full game -147. Play Eleven's negatives are bigger, so these should fall.

---

## 14. Assumptions (consolidated)

| # | Assumption | Where |
|---|---|---|
| A2 | Player count is locked once a game starts | 4 |
| A3 | Reversed hole-color order belongs to Birdie | 5.2, 5.3 |
| A4 | "Highest card deals" mirrors the default rule; "Random person deals" picks a random dealer | 6 |
| A5 | With 3+ players, order proceeds by seat after the first player, rotating each hole | 6 |
| A8 | Flipped cards at hole end count at face value; no end-the-hole penalty | 8 |
| A9 | Two matched columns of different cards earn no bonus | 9.2 |
| A10 | Four reds = -9 is columns (-4) plus four of a kind (-5) | 9.2 |
| A11 | Only first place wins; rankings are displayed for everyone | 10 |
| A13 | AI names/personalities come from the play-ten repository | 12 |

---

## 15. Open Questions

| # | Question | Notes |
|---|---|---|
| 3 | Do two matched columns of *different* cards get a -5 bonus, or is -5 only for four of a kind? | Bruce said both at different times; final ruling was "has to be the same number." Assumed same card only. |
| 4 | Is the four-reds -9 the total for those four cards, or a bonus on top of the column scores? | Assumed total (-2 + -2 + -5). |
| 5 | Which card uses the reversed hole-color order? | Assumed Birdie. |
| 6 | With many players, do the top half "win," or only first place? | Assumed first place only. |
| 7 | When "Highest card deals" is chosen, does lowest go first? What happens under "Random person deals"? | Assumed mirror / random. |
| 9 | Does the "showing" score include bonuses live, or only at the score sheet? | Play Ten behavior assumed. |
| 10 | Any special rule when a player's remaining face-down cards are flipped at hole end (for example, a penalty for the player who ended the hole)? | Assumed none. |

---

## 16. Reference

- **Play Ten repository:** rules baseline, grid UI, autosave, Claude area, AI personalities.
- **Play Ten requirements (July 2026):** Play-Ten-Requirements.md, v0.1.
- **Companion artifact:** conversation log of the full requirements session with Bruce (verbatim prompts).
