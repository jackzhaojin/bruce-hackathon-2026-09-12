'use strict';

import {
  AI_PROFILES,
  CARD_TYPES,
  DEAL_MODES,
  TOTAL_HOLES,
  bestPlacement,
  buildDeck,
  canSkipLastFlip,
  cardValue,
  chooseDealerDraws,
  faceUpCount,
  fallbackAIDecision,
  formatPoints,
  matchedSlotIndexes,
  normalizeAIDecision,
  parseJSONObject,
  scoreGrid,
  shuffle,
  visibleScore,
} from './game-core.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const KEY_STORAGE = 'bruceHackathon.openRouterKey';
const MODEL_STORAGE = 'bruceHackathon.openRouterModel';
const GAME_STORAGE = 'bruceHackathon.playElevenSave.v1';
const DEFAULT_MODEL = 'openrouter/free';
const REQUEST_TIMEOUT_MS = 20_000;
const AI_BEAT_MS = 850;
const VERSION = 1;

const app = document.querySelector('#app');
let state = { screen: 'menu' };
let menuPlayerCount = 2;
let menuDealMode = 'lowest';
let aiTimer = null;
let aiController = null;
let sessionApiKey = readStorage(KEY_STORAGE);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  })[character]);
}

function readStorage(key, fallback = '') {
  try { return window.localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function writeStorage(key, value) {
  try { window.localStorage.setItem(key, value); return true; } catch { return false; }
}

function removeStorage(key) {
  try { window.localStorage.removeItem(key); return true; } catch { return false; }
}

function getSavedGame() {
  try {
    const saved = JSON.parse(readStorage(GAME_STORAGE, 'null'));
    return saved?.version === VERSION && Array.isArray(saved.players) ? saved : null;
  } catch { return null; }
}

function saveGame() {
  if (!state?.players || state.screen === 'menu' || state.gameDone) return;
  writeStorage(GAME_STORAGE, JSON.stringify(state));
}

function cancelAI() {
  window.clearTimeout(aiTimer);
  aiTimer = null;
  if (aiController) aiController.abort();
  aiController = null;
}

function createPlayers(playerCount) {
  const players = [{ id: 'human', name: 'You', avatar: 'Y', isHuman: true, personality: 'The human player', holeScores: [] }];
  for (let index = 0; index < playerCount - 1; index += 1) {
    players.push({ id: `ai-${index + 1}`, ...AI_PROFILES[index], isHuman: false, holeScores: [] });
  }
  return players;
}

function addActivity(speaker, dialogue, detail = '', via = 'game') {
  if (!Array.isArray(state.activity)) state.activity = [];
  state.activity.push({ speaker, dialogue, detail, via, id: `${Date.now()}-${Math.random()}` });
  state.activity = state.activity.slice(-30);
}

function startNewGame() {
  cancelAI();
  const players = createPlayers(menuPlayerCount);
  const dealer = chooseDealerDraws(players.length, menuDealMode);
  state = {
    version: VERSION,
    screen: 'dealer',
    players,
    playerCount: players.length,
    dealMode: menuDealMode,
    hole: 1,
    dealerIndex: dealer.dealerIndex,
    firstPlayerIndex: dealer.firstPlayerIndex,
    dealerDraws: dealer.draws,
    currentPlayer: dealer.firstPlayerIndex,
    deck: [],
    discard: [],
    held: null,
    phase: null,
    endedBy: null,
    pendingLastTurns: null,
    activity: [],
    lastHoleResults: null,
    gameDone: false,
    turnNumber: 0,
  };
  addActivity('Starter', `${state.players[state.dealerIndex].name} will deal.`, `${state.players[state.firstPlayerIndex].name} goes first.`);
  saveGame();
  render();
}

function startHole() {
  cancelAI();
  const deck = shuffle(buildDeck(state.hole));
  for (const player of state.players) {
    player.grid = Array.from({ length: 8 }, () => ({ card: deck.pop(), faceUp: false }));
    if (!player.isHuman) {
      const column = Math.floor(Math.random() * 4);
      player.grid[column].faceUp = true;
      player.grid[column + 4].faceUp = true;
    }
  }
  state.deck = deck;
  state.discard = [deck.pop()];
  state.held = null;
  state.screen = 'game';
  state.phase = 'initFlip';
  state.currentPlayer = state.firstPlayerIndex;
  state.endedBy = null;
  state.pendingLastTurns = null;
  state.lastHoleResults = null;
  state.message = 'Flip any two of your cards to begin the hole.';
  state.turnNumber = 0;
  addActivity('Course', `Hole ${state.hole} begins!`, state.hole <= 3 ? 'Purple targets are out of play.' : 'Purple targets are now in the deck.');
  saveGame();
  render();
}

function drawFromDeck() {
  if (state.deck.length === 0) reshuffleDiscard();
  const card = state.deck.pop();
  state.held = { card, from: 'deck' };
  return card;
}

function takeFromDiscard() {
  const card = state.discard.pop();
  state.held = { card, from: 'discard' };
  return card;
}

function reshuffleDiscard() {
  if (state.discard.length <= 1) return;
  const topCard = state.discard.pop();
  state.deck = shuffle(state.discard);
  state.discard = [topCard];
  addActivity('Course', 'The discard pile was shuffled into a new deck.');
}

function placeHeld(player, slotIndex) {
  const incoming = state.held.card;
  const outgoing = player.grid[slotIndex].card;
  player.grid[slotIndex] = { card: incoming, faceUp: true };
  state.discard.push(outgoing);
  state.held = null;
  return { incoming, outgoing, slotIndex };
}

function discardHeld() {
  const card = state.held.card;
  state.discard.push(card);
  state.held = null;
  return card;
}

function beginTurns() {
  state.phase = 'awaitDraw';
  announceTurn();
}

function announceTurn() {
  if (state.screen !== 'game') return;
  const player = state.players[state.currentPlayer];
  state.turnNumber += 1;
  if (player.isHuman) {
    state.phase = 'awaitDraw';
    state.message = state.endedBy === null
      ? 'Your turn: touch the deck or the top discard. Your choice is committed.'
      : 'Your last turn: choose the deck or top discard.';
    saveGame();
    render();
    return;
  }
  state.phase = 'aiThinking';
  state.message = `${player.name} is reading the table…`;
  saveGame();
  render();
  const expectedTurn = state.turnNumber;
  aiTimer = window.setTimeout(() => runAITurn(expectedTurn), AI_BEAT_MS);
}

function finishTurn() {
  if (state.screen !== 'game') return;
  const player = state.players[state.currentPlayer];
  if (state.endedBy === null && faceUpCount(player) === 8) {
    state.endedBy = state.currentPlayer;
    state.pendingLastTurns = state.players.map((_, index) => index).filter((index) => index !== state.currentPlayer);
    addActivity('Course', `${player.name} revealed all eight cards.`, 'Everyone else gets one final turn.');
  } else if (state.endedBy !== null) {
    state.pendingLastTurns = state.pendingLastTurns.filter((index) => index !== state.currentPlayer);
  }
  if (state.endedBy !== null && state.pendingLastTurns.length === 0) {
    beginReveal();
    return;
  }
  let nextPlayer = (state.currentPlayer + 1) % state.players.length;
  if (state.endedBy !== null) {
    while (!state.pendingLastTurns.includes(nextPlayer)) nextPlayer = (nextPlayer + 1) % state.players.length;
  }
  state.currentPlayer = nextPlayer;
  state.held = null;
  state.phase = 'awaitDraw';
  announceTurn();
}

function beginReveal() {
  cancelAI();
  for (const player of state.players) {
    if (!player.isHuman) player.grid.forEach((slot) => { slot.faceUp = true; });
  }
  state.phase = 'reveal';
  state.currentPlayer = 0;
  state.held = null;
  state.message = faceUpCount(state.players[0]) === 8
    ? 'All cards are visible. Continue to the scorecard when you are ready.'
    : 'Final reveal: flip each of your remaining cards, then continue to the scorecard.';
  addActivity('Course', 'The hole is finished.', 'Reveal the remaining cards before scoring.');
  saveGame();
  render();
}

function showScoreboard() {
  if (state.phase !== 'reveal') return;
  state.players.forEach((player) => player.grid.forEach((slot) => { slot.faceUp = true; }));
  const results = state.players.map((player) => {
    const result = scoreGrid(player.grid);
    if (player.holeScores.length < state.hole) player.holeScores.push(result.total);
    return { playerId: player.id, name: player.name, ...result };
  });
  state.lastHoleResults = results;
  state.screen = 'scoreboard';
  state.phase = null;
  state.gameDone = state.hole >= TOTAL_HOLES;
  if (state.gameDone) removeStorage(GAME_STORAGE);
  else saveGame();
  render();
}

function nextHole() {
  if (state.hole >= TOTAL_HOLES) return;
  state.hole += 1;
  state.firstPlayerIndex = (state.firstPlayerIndex + 1) % state.players.length;
  startHole();
}

function revealHumanCard(slotIndex) {
  const human = state.players[0];
  if (state.phase !== 'reveal' || human.grid[slotIndex].faceUp) return;
  human.grid[slotIndex].faceUp = true;
  state.message = faceUpCount(human) === 8 ? 'All cards are visible. Continue to the scorecard.' : 'Keep revealing your remaining cards.';
  saveGame();
  render();
}

function humanInitialFlip(slotIndex) {
  const human = state.players[0];
  if (state.phase !== 'initFlip' || human.grid[slotIndex].faceUp) return;
  human.grid[slotIndex].faceUp = true;
  const count = faceUpCount(human);
  if (count >= 2) {
    const opened = human.grid.filter((slot) => slot.faceUp);
    addActivity('You', 'Ready to play.', `Opened with ${CARD_TYPES[opened[0].card].name} and ${CARD_TYPES[opened[1].card].name}.`);
    beginTurns();
  } else {
    state.message = 'Flip one more card to begin.';
    saveGame();
    render();
  }
}

function humanDrawDeck() {
  if (state.currentPlayer !== 0 || state.phase !== 'awaitDraw') return;
  const card = drawFromDeck();
  state.phase = 'holdingDeck';
  state.message = canSkipLastFlip(state.players[0])
    ? `You drew ${CARD_TYPES[card].name}. Swap it into your grid, or discard it and choose whether to flip your last card.`
    : `You drew ${CARD_TYPES[card].name}. Swap it into any grid spot, or discard it and flip a face-down card.`;
  saveGame();
  render();
}

function humanTakeDiscard() {
  if (state.currentPlayer !== 0 || state.phase !== 'awaitDraw' || !state.discard.length) return;
  const card = takeFromDiscard();
  state.phase = 'holdingDiscard';
  state.message = `You committed to ${CARD_TYPES[card].name}. Swap it into any face-up or face-down grid spot.`;
  saveGame();
  render();
}

function humanPlace(slotIndex) {
  if (state.currentPlayer !== 0 || !['holdingDeck', 'holdingDiscard'].includes(state.phase)) return;
  const result = placeHeld(state.players[0], slotIndex);
  addActivity('You', `Kept ${CARD_TYPES[result.incoming].name}.`, `Replaced ${CARD_TYPES[result.outgoing].name} in slot ${slotIndex + 1}.`);
  state.message = `You placed ${CARD_TYPES[result.incoming].name} and discarded ${CARD_TYPES[result.outgoing].name}.`;
  state.phase = 'turnResult';
  saveGame();
  render();
  window.setTimeout(finishTurn, 450);
}

function humanDiscardDrawn() {
  if (state.currentPlayer !== 0 || state.phase !== 'holdingDeck') return;
  const card = discardHeld();
  const maySkip = canSkipLastFlip(state.players[0]);
  state.phase = maySkip ? 'maySkipFlip' : 'mustFlip';
  state.message = maySkip
    ? `You discarded ${CARD_TYPES[card].name}. Flip your last card, or skip and leave it face down.`
    : `You discarded ${CARD_TYPES[card].name}. Now commit to one face-down card to reveal.`;
  saveGame();
  render();
}

function humanFlipAfterDiscard(slotIndex) {
  const human = state.players[0];
  if (state.currentPlayer !== 0 || !['mustFlip', 'maySkipFlip'].includes(state.phase) || human.grid[slotIndex].faceUp) return;
  human.grid[slotIndex].faceUp = true;
  addActivity('You', `Flipped ${CARD_TYPES[human.grid[slotIndex].card].name}.`, `Revealed slot ${slotIndex + 1} after discarding the draw.`);
  state.message = `You revealed ${CARD_TYPES[human.grid[slotIndex].card].name}.`;
  state.phase = 'turnResult';
  saveGame();
  render();
  window.setTimeout(finishTurn, 450);
}

function humanSkipLastFlip() {
  const human = state.players[0];
  if (state.currentPlayer !== 0 || state.phase !== 'maySkipFlip' || !canSkipLastFlip(human)) return;
  addActivity('You', 'Skipped the flip.', 'Kept the final card face down after discarding the draw.');
  state.message = 'You skipped the optional flip and kept your last card face down.';
  state.phase = 'turnResult';
  saveGame();
  render();
  window.setTimeout(finishTurn, 450);
}

function describeVisibleGrid(player) {
  return player.grid.map((slot, index) => ({
    slot: index,
    row: index < 4 ? 'top' : 'bottom',
    column: (index % 4) + 1,
    card: slot.faceUp ? CARD_TYPES[slot.card].name : 'face-down',
    value: slot.faceUp ? cardValue(slot.card) : null,
  }));
}

function aiPrompt(player, topDiscard) {
  const opponents = state.players
    .filter((candidate) => candidate.id !== player.id)
    .map((candidate) => ({
      name: candidate.name,
      showingScore: visibleScore(candidate.grid),
      faceUpCards: candidate.grid.filter((slot) => slot.faceUp).map((slot) => CARD_TYPES[slot.card].name),
    }));

  return `You are ${player.name}, an interactive AI opponent in the family card game Play Eleven: Block Party.
Personality: ${player.personality}

Make one legal, strategic decision using only visible information. Lower scores are better. Positive matching cards in a column cancel to zero. Negative targets stay negative and are especially valuable beside other negatives. Taking the discard commits you to using it. Drawing from the deck is hidden; if you choose it, set a value threshold for keeping the unknown draw and choose a face-down slot to flip if it is discarded. When exactly one face-down card remains, you may set skip_last_flip to true so that discarding the deck draw ends your turn without revealing that final card.

Current state:
${JSON.stringify({
    hole: state.hole,
    totalHoles: TOTAL_HOLES,
    ownGrid: describeVisibleGrid(player),
    ownShowingScore: visibleScore(player.grid),
    discard: topDiscard ? { card: CARD_TYPES[topDiscard].name, value: cardValue(topDiscard) } : null,
    opponents,
    lastEvent: state.activity.at(-1)?.dialogue || '',
  })}

Return only JSON with this shape:
{"source":"discard or deck","target_slot":0,"keep_if_value_at_most":3,"flip_slot":2,"skip_last_flip":false,"explanation":"short strategic reason","dialogue":"one playful in-character sentence spoken at the table"}

target_slot is used if you take the discard. flip_slot must be a currently face-down slot. skip_last_flip is legal only when exactly one card is face down and only applies if the deck draw is discarded. Keep dialogue family-friendly and under 18 words.`;
}

function responseText(content) {
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';
  return content.map((part) => (typeof part === 'string' ? part : part?.text || '')).join('\n').trim();
}

async function requestAIDecision(player, topDiscard) {
  const fallback = fallbackAIDecision(player, topDiscard);
  const apiKey = sessionApiKey || readStorage(KEY_STORAGE);
  if (!apiKey) return { ...fallback, error: 'No OpenRouter key; quick strategy used.' };

  aiController = new AbortController();
  const timeout = window.setTimeout(() => aiController?.abort(), REQUEST_TIMEOUT_MS);
  try {
    const model = readStorage(MODEL_STORAGE, DEFAULT_MODEL);
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-OpenRouter-Title': 'Play Eleven: Block Party',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a game-playing agent. Follow the rules and return only valid JSON.' },
          { role: 'user', content: aiPrompt(player, topDiscard) },
        ],
        temperature: 0.8,
        max_tokens: 260,
      }),
      signal: aiController.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error?.message || `OpenRouter returned ${response.status}`);
    const parsed = parseJSONObject(responseText(payload?.choices?.[0]?.message?.content));
    if (!parsed) throw new Error('The AI response was not valid JSON.');
    return normalizeAIDecision(parsed, player, topDiscard);
  } catch (error) {
    const message = error?.name === 'AbortError' ? 'AI request skipped or timed out.' : error.message;
    return { ...fallback, error: message };
  } finally {
    window.clearTimeout(timeout);
    aiController = null;
  }
}

async function runAITurn(expectedTurn) {
  if (state.screen !== 'game' || state.phase !== 'aiThinking' || state.turnNumber !== expectedTurn) return;
  const playerIndex = state.currentPlayer;
  const player = state.players[playerIndex];
  const topDiscard = state.discard.at(-1);
  const decision = await requestAIDecision(player, topDiscard);
  if (state.screen !== 'game' || state.currentPlayer !== playerIndex || state.turnNumber !== expectedTurn) return;

  let outcome;
  if (decision.source === 'discard' && state.discard.length) {
    const incoming = takeFromDiscard();
    const move = placeHeld(player, decision.targetSlot);
    outcome = `${player.name} took ${CARD_TYPES[incoming].name} and replaced ${CARD_TYPES[move.outgoing].name}.`;
  } else {
    const drawn = drawFromDeck();
    const placement = bestPlacement(player.grid, drawn);
    const shouldKeep = cardValue(drawn) <= decision.keepMax || placement.score >= 4 || cardValue(drawn) < 0;
    if (shouldKeep) {
      const move = placeHeld(player, placement.index);
      outcome = `${player.name} drew and kept ${CARD_TYPES[drawn].name}, replacing ${CARD_TYPES[move.outgoing].name}.`;
    } else {
      discardHeld();
      const faceDown = player.grid.map((slot, index) => (!slot.faceUp ? index : -1)).filter((index) => index >= 0);
      const maySkip = faceDown.length === 1 && decision.skipLastFlip;
      const flipIndex = faceDown.includes(decision.flipSlot) ? decision.flipSlot : faceDown[0];
      if (maySkip) {
        outcome = `${player.name} discarded ${CARD_TYPES[drawn].name} and skipped the optional final flip.`;
      } else if (flipIndex !== undefined) {
        player.grid[flipIndex].faceUp = true;
        outcome = `${player.name} discarded ${CARD_TYPES[drawn].name} and flipped ${CARD_TYPES[player.grid[flipIndex].card].name}.`;
      } else {
        outcome = `${player.name} discarded ${CARD_TYPES[drawn].name}.`;
      }
    }
  }

  const detail = `${outcome} ${decision.explanation}${decision.error ? ` ${decision.error}` : ''}`;
  addActivity(player.name, decision.dialogue, detail, decision.via);
  state.message = `${outcome} ${player.name} says: “${decision.dialogue}”`;
  state.phase = 'aiResult';
  saveGame();
  render();
  addScreenReaderAnnouncement(`${decision.via === 'llm' ? 'OpenRouter decision' : 'Quick strategy'}. ${state.message}`);
  aiTimer = window.setTimeout(finishTurn, AI_BEAT_MS);
}

function addScreenReaderAnnouncement(message) {
  const region = document.querySelector('#announcer');
  if (region) region.textContent = message;
}

const STRIKE_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'white', 'gray', 'black', 'brown'];
const BIRDIE_COLORS = [...STRIKE_COLORS].reverse();

function cardFace(cardId) {
  const card = CARD_TYPES[cardId];
  if (card.kind === 'balls') {
    return `<span class="card-name">${escapeHTML(card.name)}</span><span class="balls">${Array.from({ length: card.balls }, () => `<i class="ball ball-${card.color}"></i>`).join('')}</span>`;
  }
  if (card.kind === 'screen') {
    return '<span class="target-screen"><i></i><i></i><i></i><i></i><b>BLOCK<br>PARTY</b></span><span class="card-name">Any Target</span>';
  }
  if (card.kind === 'strike') {
    return `<span class="attempt-art">${card.icon}<small>Completed on<br>attempt 1</small></span><span class="card-name">Strike</span>`;
  }
  if (card.kind === 'birdie') {
    return `<span class="attempt-art">${card.icon}<small>Two-shot<br>birdie</small></span><span class="card-name">Birdie</span>`;
  }
  if (card.kind === 'icon') {
    return `<span class="card-icon" aria-hidden="true">${card.icon}</span><span class="card-name">${escapeHTML(card.name)}</span>`;
  }
  return `<span class="card-name">${escapeHTML(card.name)}</span><span class="target-value">${formatPoints(card.value)}</span>`;
}

function cardHTML(cardId, options = {}) {
  const { faceDown = false, clickable = false, slotIndex, playerIndex = 0, mini = false, matched = false, pile = '' } = options;
  const card = CARD_TYPES[cardId];
  const tag = clickable ? 'button' : 'div';
  const attributes = clickable
    ? ` type="button"${slotIndex !== undefined ? ` data-slot="${slotIndex}" data-player="${playerIndex}"` : ''}${pile ? ` data-pile="${pile}"` : ''}`
    : '';
  const dynamicColor = !faceDown && card.kind === 'strike'
    ? ` hole-${STRIKE_COLORS[state.hole - 1]}`
    : !faceDown && card.kind === 'birdie'
      ? ` hole-${BIRDIE_COLORS[state.hole - 1]}`
      : '';
  const targetClass = !faceDown && card.kind === 'target' ? ` target-${cardId}` : '';
  const label = faceDown ? `Face-down card${slotIndex !== undefined ? ` in slot ${slotIndex + 1}` : ''}` : `${card.name}, ${formatPoints(card.value)} points`;
  return `<${tag} class="card${faceDown ? ' card-back' : ''}${clickable ? ' clickable' : ''}${mini ? ' mini-card' : ''}${matched ? ' matched' : ''}${dynamicColor}${targetClass}"${attributes} aria-label="${escapeHTML(label)}">${faceDown ? '<span class="back-logo">PLAY<br><b>ELEVEN</b></span>' : `<span class="corner">${formatPoints(card.value)}</span>${cardFace(cardId)}<span class="corner corner-bottom">${formatPoints(card.value)}</span>`}</${tag}>`;
}

function gridHTML(player, playerIndex, { mini = false, clickable = () => false } = {}) {
  const matched = matchedSlotIndexes(player.grid);
  return `<div class="card-grid${mini ? ' mini-grid' : ''}">${player.grid.map((slot, index) => cardHTML(slot.card, {
    faceDown: !slot.faceUp,
    clickable: clickable(slot, index),
    slotIndex: index,
    playerIndex,
    mini,
    matched: matched.has(index),
  })).join('')}</div>`;
}

function totalScore(player) {
  return player.holeScores.reduce((total, score) => total + score, 0);
}

function playerScoreLabel(player) {
  return `showing ${visibleScore(player.grid)} · total ${totalScore(player)}`;
}

function siteHeader({ compact = false } = {}) {
  return `<header class="site-header${compact ? ' compact' : ''}">
    <a class="brand" href="./" data-act="home" aria-label="Play Eleven home"><span class="brand-mark">11</span><span><strong>Play Eleven</strong><small>Block Party</small></span></a>
    <div class="header-meta"><span>Jack + Bruce</span><span>AI Tinkerers Columbus</span></div>
  </header>`;
}

function renderMenu() {
  const saved = getSavedGame();
  const savedKey = readStorage(KEY_STORAGE);
  const hasKey = Boolean(sessionApiKey || savedKey);
  const keyIsSaved = Boolean(savedKey && sessionApiKey === savedKey);
  const model = readStorage(MODEL_STORAGE, DEFAULT_MODEL);
  app.innerHTML = `<div class="page-shell menu-shell">
    ${siteHeader()}
    <main class="menu-main">
      <section class="menu-hero">
        <div>
          <p class="eyebrow">THE CARD GAME OF GOLF · PLUS ELEVEN</p>
          <h1>Build the lowest grid.<br><span>Outsmart a table of AI rivals.</span></h1>
          <p>Play 11 holes against Chip and friends. They use OpenRouter to choose moves, explain their strategy, and bring the table to life.</p>
          <div class="hero-facts"><span>166 cards</span><span>2–10 players</span><span>1 human + AI</span></div>
        </div>
        <div class="hero-card-stack" aria-hidden="true">
          <div class="showcase-card gray-card"><b>-25</b><span>GRAY</span></div>
          <div class="showcase-card purple-card"><b>-22</b><span>PURPLE</span></div>
          <div class="showcase-card party-card"><b>0</b><span>BLOCK<br>PARTY</span></div>
        </div>
      </section>

      <div class="setup-grid">
        <section class="setup-card" aria-labelledby="players-heading">
          <div class="section-number">01</div>
          <h2 id="players-heading">Choose the table</h2>
          <p>You are Player 1. Every other seat is an interactive AI opponent.</p>
          <div class="choice-grid player-choices" role="group" aria-label="Number of players">
            ${Array.from({ length: 9 }, (_, index) => index + 2).map((count) => `<button type="button" class="choice-button${menuPlayerCount === count ? ' selected' : ''}" data-player-count="${count}" aria-pressed="${menuPlayerCount === count}">${count}</button>`).join('')}
          </div>
          <div class="selection-caption"><strong>${menuPlayerCount} players</strong><span>You + ${menuPlayerCount - 1} AI ${menuPlayerCount === 2 ? 'opponent' : 'opponents'}</span></div>
        </section>

        <section class="setup-card" aria-labelledby="deal-heading">
          <div class="section-number">02</div>
          <h2 id="deal-heading">Choose who deals</h2>
          <p>Tied deal cards trigger a complete redraw.</p>
          <div class="deal-choices" role="group" aria-label="Dealer selection rule">
            ${Object.entries(DEAL_MODES).map(([id, deal]) => `<button type="button" class="deal-button${menuDealMode === id ? ' selected' : ''}" data-deal-mode="${id}" aria-pressed="${menuDealMode === id}"><strong>${escapeHTML(deal.label)}</strong><span>${escapeHTML(deal.description)}</span></button>`).join('')}
          </div>
        </section>

        <section class="setup-card ai-setup" aria-labelledby="ai-heading">
          <div class="section-number">03</div>
          <div class="heading-row"><h2 id="ai-heading">Connect the opponents</h2><span class="status-pill ${hasKey ? 'ready' : ''}">${hasKey ? 'AI ready' : 'Quick mode'}</span></div>
          <p>Paste a player-owned OpenRouter key for live LLM decisions. Saving it is optional; without one, the game uses a local strategy fallback.</p>
          <label for="api-key">OpenRouter API key</label>
          <div class="key-row"><input id="api-key" type="password" autocomplete="off" spellcheck="false" placeholder="sk-or-v1-…"><button type="button" class="small-button" data-act="toggleKey">Show</button></div>
          <div class="key-actions"><button type="button" class="small-button primary-small" data-act="saveKey">Save on this device</button><button type="button" class="text-button" data-act="forgetKey">Forget key</button><span id="key-note" aria-live="polite">${keyIsSaved ? 'A saved key will power the opponents.' : hasKey ? 'Unsaved key ready for this tab.' : 'No key entered yet.'}</span></div>
          <small class="storage-note">An unsaved key stays in this tab. If saved, it stays in this browser's local storage until you press Forget. This site loads no third-party scripts.</small>
          <label for="model">Opponent model</label>
          <input id="model" value="${escapeHTML(model)}" list="model-options" autocomplete="off" spellcheck="false">
          <datalist id="model-options"><option value="openrouter/free"><option value="openai/gpt-5.4-nano"></datalist>
        </section>
      </div>

      <div class="launch-row">${saved ? '<button type="button" class="launch-button continue-button" data-act="continue">Continue saved game <span>→</span></button>' : ''}<button type="button" class="launch-button" data-act="newGame">Start a new game <span>→</span></button></div>

      <nav class="game-links" aria-label="Bruce's games"><a href="https://www.jackzhaojin.com/bruce-play-ten/">Play Ten</a><a href="https://www.jackzhaojin.com/bruce-lava-dash/">Lava Dash</a><a href="PRODUCT_REQUIREMENTS.md">Bruce's rules</a></nav>
    </main>
    <footer><span>Built at the Agents, Everywhere hackathon.</span><a href="https://github.com/jackzhaojin/bruce-hackathon-2026-09-12">View source ↗</a></footer>
  </div>`;
  const keyInput = document.querySelector('#api-key');
  if (keyInput && hasKey) keyInput.value = sessionApiKey || savedKey;
}

function renderDealer() {
  const mode = DEAL_MODES[state.dealMode];
  const dealer = state.players[state.dealerIndex];
  const first = state.players[state.firstPlayerIndex];
  app.innerHTML = `<div class="page-shell">
    ${siteHeader()}
    <main class="dealer-screen">
      <p class="eyebrow">EVERYONE DRAWS</p><h1>Who deals hole one?</h1><p>${escapeHTML(mode.description)} No ties were allowed in this draw.</p>
      <div class="dealer-grid">${state.dealerDraws.map((card, index) => `<article class="dealer-draw${index === state.dealerIndex ? ' dealer-winner' : ''}"><strong>${escapeHTML(state.players[index].name)}</strong>${cardHTML(card)}<span>${formatPoints(cardValue(card))}</span></article>`).join('')}</div>
      <div class="dealer-result"><div><span>Dealer</span><strong>${escapeHTML(dealer.name)}</strong></div><div><span>First player</span><strong>${escapeHTML(first.name)}</strong></div></div>
      <button type="button" class="launch-button compact-launch" data-act="deal">Deal hole 1 <span>→</span></button>
    </main>
  </div>`;
}

function renderActivity() {
  const items = [...(state.activity || [])].reverse().slice(0, 7);
  return `<aside class="table-talk" aria-labelledby="table-talk-heading">
    <div class="talk-heading"><div><p class="eyebrow">LIVE AI TABLE TALK</p><h2 id="table-talk-heading">Around the table</h2></div><span class="live-dot">LIVE</span></div>
    <div class="talk-feed">${items.map((item) => `<article class="talk-item ${item.via === 'llm' ? 'llm' : ''}"><div class="talk-avatar">${escapeHTML(item.speaker.slice(0, 1))}</div><div><div class="talk-name">${escapeHTML(item.speaker)}${item.via === 'llm' ? '<span>OpenRouter</span>' : ''}</div><p>“${escapeHTML(item.dialogue)}”</p>${item.detail ? `<small>${escapeHTML(item.detail)}</small>` : ''}</div></article>`).join('')}</div>
  </aside>`;
}

function renderGame() {
  const human = state.players[0];
  const isHumanTurn = state.currentPlayer === 0;
  const initialFlip = state.phase === 'initFlip';
  const revealPhase = state.phase === 'reveal';
  const clickableHumanSlot = (slot) => {
    if (initialFlip || revealPhase || ['mustFlip', 'maySkipFlip'].includes(state.phase)) return !slot.faceUp;
    return isHumanTurn && ['holdingDeck', 'holdingDiscard'].includes(state.phase);
  };
  const topDiscard = state.discard.at(-1);
  const deckClickable = isHumanTurn && state.phase === 'awaitDraw';
  const discardClickable = isHumanTurn && ['awaitDraw', 'holdingDeck'].includes(state.phase);
  const activePlayer = state.players[state.currentPlayer];
  const turnLabel = activePlayer.isHuman ? 'YOUR TURN' : `${activePlayer.name.toUpperCase()}'S TURN`;

  app.innerHTML = `<div class="game-shell">
    <div id="announcer" class="sr-only" aria-live="assertive"></div>
    <header class="game-topbar">
      <div class="round-mark"><span>HOLE</span><strong>${state.hole}</strong><small>of ${TOTAL_HOLES}</small></div>
      <div class="turn-summary"><span>${revealPhase ? 'FINAL REVEAL' : initialFlip ? 'OPENING CARDS' : escapeHTML(turnLabel)}</span><strong>Lowest score wins</strong></div>
      <div class="topbar-actions"><span class="deck-count">${state.deck.length} cards left</span><button type="button" class="menu-icon" data-act="pause">Menu</button></div>
    </header>
    <main class="game-layout">
      <section class="table-zone">
        <div class="opponent-rail">${state.players.slice(1).map((player, offset) => {
          const playerIndex = offset + 1;
          return `<article class="opponent${state.currentPlayer === playerIndex && !initialFlip && !revealPhase ? ' active' : ''}"><div class="opponent-heading"><span class="avatar">${escapeHTML(player.avatar)}</span><div><strong>${escapeHTML(player.name)}</strong><small>${escapeHTML(playerScoreLabel(player))}</small></div></div>${gridHTML(player, playerIndex, { mini: true })}</article>`;
        }).join('')}</div>
        <div class="play-surface">
          <div class="piles">
            <div class="pile"><span>DRAW DECK</span>${cardHTML('any-target', { faceDown: true, clickable: deckClickable, pile: 'deck' })}<small>${deckClickable ? 'Touch to draw' : `${state.deck.length} remaining`}</small></div>
            ${state.held && isHumanTurn ? `<div class="held-card"><span>YOUR CARD</span>${cardHTML(state.held.card)}<small>${state.held.from === 'discard' ? 'Must be used' : 'Keep or discard'}</small></div>` : '<div class="table-logo" aria-hidden="true"><span>BLOCK</span><strong>11</strong><span>PARTY</span></div>'}
            <div class="pile"><span>DISCARD</span>${topDiscard ? cardHTML(topDiscard, { clickable: discardClickable, pile: 'discard' }) : '<div class="empty-card">Empty</div>'}<small>${state.phase === 'holdingDeck' && isHumanTurn ? 'Touch to discard draw' : discardClickable ? 'Touch to take' : 'Top card'}</small></div>
          </div>
          <div class="message-bar${isHumanTurn || initialFlip || revealPhase ? ' attention' : ''}"><span>${escapeHTML(state.message || '')}</span>${state.phase === 'aiThinking' ? '<button type="button" class="quick-move" data-act="quickAI">Use quick move</button>' : ''}${state.phase === 'maySkipFlip' && isHumanTurn ? '<button type="button" class="quick-move skip-flip" data-act="skipFlip">Skip (keep it face down)</button>' : ''}</div>
        </div>
        <section class="human-board${isHumanTurn || initialFlip || revealPhase ? ' active' : ''}" aria-labelledby="your-grid-heading">
          <div class="board-heading"><div><p class="eyebrow">PLAYER 1</p><h2 id="your-grid-heading">Your grid</h2></div><div class="score-stack"><span>Showing <strong>${visibleScore(human.grid)}</strong></span><span>Game total <strong>${totalScore(human)}</strong></span></div></div>
          ${gridHTML(human, 0, { clickable: clickableHumanSlot })}
          ${revealPhase && faceUpCount(human) === 8 ? '<button type="button" class="next-arrow" data-act="score">See the scorecard <span>→</span></button>' : ''}
        </section>
      </section>
      ${renderActivity()}
    </main>
  </div>`;
}

function renderScoreboard() {
  const ranking = state.players
    .map((player) => ({ player, total: totalScore(player) }))
    .sort((a, b) => a.total - b.total);
  const holesPlayed = state.players[0].holeScores.length;
  const lastResults = state.lastHoleResults || [];
  const winner = ranking[0];
  const winnerHeadline = winner.player.isHuman
    ? 'You win Play Eleven!'
    : `${escapeHTML(winner.player.name)} wins Play Eleven!`;

  app.innerHTML = `<div class="page-shell score-shell">
    ${siteHeader({ compact: true })}
    <main class="score-screen">
      <p class="eyebrow">${state.gameDone ? 'FINAL RESULTS' : `HOLE ${state.hole} COMPLETE`}</p>
      <h1>${state.gameDone ? winnerHeadline : 'Scorecard updated.'}</h1>
      <p>${state.gameDone ? `The lowest total after all ${TOTAL_HOLES} holes takes the trophy.` : `${TOTAL_HOLES - state.hole} holes remain. Lowest total is leading.`}</p>
      <div class="score-table-wrap"><table class="score-table"><thead><tr><th>Hole</th>${state.players.map((player) => `<th>${escapeHTML(player.name)}</th>`).join('')}</tr></thead><tbody>${Array.from({ length: holesPlayed }, (_, holeIndex) => `<tr><th>${holeIndex + 1}</th>${state.players.map((player) => `<td>${player.holeScores[holeIndex]}</td>`).join('')}</tr>`).join('')}<tr class="total-row"><th>Total</th>${state.players.map((player) => `<td>${totalScore(player)}</td>`).join('')}</tr></tbody></table></div>
      <div class="result-grid">${lastResults.map((result) => `<article class="result-card"><div><h2>${escapeHTML(result.name)}</h2><strong>${result.total}</strong></div><ul>${result.lines.map((line) => `<li class="${line.kind}"><span>${escapeHTML(line.text)}</span><b>${formatPoints(line.points)}</b></li>`).join('')}</ul></article>`).join('')}</div>
      ${state.gameDone ? `<section class="ranking"><h2>Final ranking</h2>${ranking.map((entry, index) => `<div><span>${index + 1}</span><strong>${escapeHTML(entry.player.name)}</strong><b>${entry.total}</b></div>`).join('')}</section>` : ''}
      <div class="score-actions">${state.gameDone ? '<button type="button" class="launch-button" data-act="homeClear">Back to main menu <span>→</span></button>' : `<button type="button" class="launch-button" data-act="nextHole">Start hole ${state.hole + 1} <span>→</span></button>`}<button type="button" class="text-button" data-act="pause">Game menu</button></div>
    </main>
  </div>`;
}

function renderPause() {
  const canRecoverHole = state.pausedFrom === 'game';
  app.innerHTML = `<div class="pause-screen"><section class="pause-card">
    <p class="eyebrow">GAME MENU</p><h1>Hole ${state.hole} is saved.</h1><p>Resume normally${canRecoverHole ? ", or use Bruce's recovery controls if the hole has bugged out" : ''}.</p>
    <div class="pause-actions">
      <button type="button" class="launch-button compact-launch" data-act="resume">Resume game <span>→</span></button>
      ${canRecoverHole ? `<button type="button" class="recovery-button" data-act="retake">Retake hole ${state.hole}</button><button type="button" class="recovery-button" data-act="moveOn">Move on to scoring</button>` : ''}
      <button type="button" class="text-button" data-act="home">Main menu (keep save)</button>
    </div>
  </section></div>`;
}

function render() {
  switch (state.screen) {
    case 'dealer': renderDealer(); break;
    case 'game': renderGame(); break;
    case 'scoreboard': renderScoreboard(); break;
    case 'pause': renderPause(); break;
    default: renderMenu();
  }
}

function continueSavedGame() {
  const saved = getSavedGame();
  if (!saved) return;
  cancelAI();
  state = saved;
  if (state.screen === 'pause') state.screen = state.pausedFrom || 'game';
  if (state.screen === 'game' && state.phase === 'aiThinking') state.phase = 'awaitDraw';
  render();
  resumeTurnFlow();
}

function resumeTurnFlow() {
  if (state.screen !== 'game') return;
  if (['aiResult', 'turnResult'].includes(state.phase)) {
    aiTimer = window.setTimeout(finishTurn, 0);
  } else if (state.phase === 'awaitDraw' && !state.players[state.currentPlayer].isHuman) {
    announceTurn();
  }
}

function openPause() {
  if (!state.players) return;
  cancelAI();
  state.pausedFrom = state.screen;
  if (state.phase === 'aiThinking') state.phase = 'awaitDraw';
  state.screen = 'pause';
  saveGame();
  render();
}

function resumeGame() {
  state.screen = state.pausedFrom || 'game';
  delete state.pausedFrom;
  saveGame();
  render();
  resumeTurnFlow();
}

function returnHome({ clear = false } = {}) {
  cancelAI();
  if (clear) {
    removeStorage(GAME_STORAGE);
  } else if (state.players) {
    const savedScreen = state.pausedFrom || (state.screen === 'scoreboard' ? 'scoreboard' : 'game');
    const copy = { ...state, screen: savedScreen };
    delete copy.pausedFrom;
    if (copy.phase === 'aiThinking') copy.phase = 'awaitDraw';
    writeStorage(GAME_STORAGE, JSON.stringify(copy));
  }
  state = { screen: 'menu' };
  render();
}

function saveKeyFromMenu() {
  const input = document.querySelector('#api-key');
  const note = document.querySelector('#key-note');
  const key = input?.value.trim();
  if (!key) {
    if (note) note.textContent = 'Enter a key first.';
    input?.focus();
    return;
  }
  sessionApiKey = key;
  const saved = writeStorage(KEY_STORAGE, key);
  if (note) note.textContent = saved ? 'Saved. AI opponents are ready.' : 'Browser storage is blocked.';
  const status = document.querySelector('.status-pill');
  if (saved && status) { status.textContent = 'AI ready'; status.classList.add('ready'); }
}

function forgetKeyFromMenu() {
  sessionApiKey = '';
  removeStorage(KEY_STORAGE);
  const input = document.querySelector('#api-key');
  if (input) input.value = '';
  const note = document.querySelector('#key-note');
  if (note) note.textContent = 'Key removed from this tab and browser storage.';
  const status = document.querySelector('.status-pill');
  if (status) { status.textContent = 'Quick mode'; status.classList.remove('ready'); }
}

app.addEventListener('input', (event) => {
  if (event.target.id === 'api-key') sessionApiKey = event.target.value.trim();
  if (event.target.id === 'model') writeStorage(MODEL_STORAGE, event.target.value.trim() || DEFAULT_MODEL);
});

app.addEventListener('click', (event) => {
  const target = event.target.closest('[data-act], [data-player-count], [data-deal-mode], [data-pile], [data-slot]');
  if (!target) return;
  if (target.dataset.playerCount) { menuPlayerCount = Number(target.dataset.playerCount); render(); return; }
  if (target.dataset.dealMode) { menuDealMode = target.dataset.dealMode; render(); return; }

  const action = target.dataset.act;
  if (action === 'newGame') { startNewGame(); return; }
  if (action === 'continue') { continueSavedGame(); return; }
  if (action === 'deal') { startHole(); return; }
  if (action === 'nextHole') { nextHole(); return; }
  if (action === 'score') { showScoreboard(); return; }
  if (action === 'pause') { openPause(); return; }
  if (action === 'resume') { resumeGame(); return; }
  if (action === 'retake') { startHole(); return; }
  if (action === 'moveOn') { state.screen = 'game'; delete state.pausedFrom; beginReveal(); return; }
  if (action === 'home') { returnHome(); return; }
  if (action === 'homeClear') { returnHome({ clear: true }); return; }
  if (action === 'saveKey') { saveKeyFromMenu(); return; }
  if (action === 'forgetKey') { forgetKeyFromMenu(); return; }
  if (action === 'toggleKey') {
    const input = document.querySelector('#api-key');
    if (input) { input.type = input.type === 'password' ? 'text' : 'password'; target.textContent = input.type === 'password' ? 'Show' : 'Hide'; }
    return;
  }
  if (action === 'quickAI') {
    if (aiController) aiController.abort();
    state.message = `${state.players[state.currentPlayer].name} is using a quick move…`;
    render();
    return;
  }
  if (action === 'skipFlip') { humanSkipLastFlip(); return; }

  if (state.screen !== 'game') return;
  if (target.dataset.pile === 'deck') { humanDrawDeck(); return; }
  if (target.dataset.pile === 'discard') {
    if (state.phase === 'awaitDraw') humanTakeDiscard();
    else if (state.phase === 'holdingDeck') humanDiscardDrawn();
    return;
  }
  if (target.dataset.slot !== undefined && target.dataset.player === '0') {
    const slotIndex = Number(target.dataset.slot);
    if (state.phase === 'initFlip') humanInitialFlip(slotIndex);
    else if (state.phase === 'reveal') revealHumanCard(slotIndex);
    else if (['mustFlip', 'maySkipFlip'].includes(state.phase)) humanFlipAfterDiscard(slotIndex);
    else if (['holdingDeck', 'holdingDiscard'].includes(state.phase)) humanPlace(slotIndex);
  }
});

render();
