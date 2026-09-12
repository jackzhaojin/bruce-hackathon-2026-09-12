'use strict';

export const TOTAL_HOLES = 11;

export const CARD_TYPES = Object.freeze({
  gray: { name: 'Gray', value: -25, count: 1, kind: 'target', color: 'gray' },
  purple: { name: 'Purple', value: -22, count: 3, kind: 'target', color: 'purple' },
  white: { name: 'White', value: -20, count: 1, kind: 'target', color: 'white' },
  blue: { name: 'Blue', value: -15, count: 1, kind: 'target', color: 'blue' },
  brown: { name: 'Brown', value: -10, count: 1, kind: 'target', color: 'brown' },
  green: { name: 'Green', value: -9, count: 1, kind: 'target', color: 'green' },
  yellow: { name: 'Yellow', value: -5, count: 2, kind: 'target', color: 'yellow' },
  red: { name: 'Red', value: -1, count: 4, kind: 'target', color: 'red' },
  'any-target': { name: 'Any Target', value: 0, count: 8, kind: 'screen', icon: '◎' },
  strike: { name: 'Strike', value: 1, count: 8, kind: 'strike', icon: '✓' },
  birdie: { name: 'Birdie', value: 2, count: 8, kind: 'birdie', icon: '↟' },
  fastball: { name: 'Fastball', value: 3, count: 8, kind: 'icon', icon: '➜' },
  'far-ball': { name: 'Far Ball', value: 4, count: 8, kind: 'icon', icon: '◉' },
  five: { name: '5 Red Ball = 5', value: 5, count: 8, kind: 'balls', balls: 5, color: 'red' },
  six: { name: '6 Orange Ball = 6', value: 6, count: 8, kind: 'balls', balls: 6, color: 'orange' },
  seven: { name: '7 Yellow Ball = 7', value: 7, count: 8, kind: 'balls', balls: 7, color: 'yellow' },
  eight: { name: '8 Green Ball = 8', value: 8, count: 8, kind: 'balls', balls: 8, color: 'green' },
  nine: { name: '9 Blue Ball = 9', value: 9, count: 8, kind: 'balls', balls: 9, color: 'blue' },
  ten: { name: 'Ten', value: 10, count: 8, kind: 'balls', balls: 10, color: 'purple' },
  eleven: { name: 'Eleven', value: 11, count: 8, kind: 'balls', balls: 11, color: 'pink' },
  'no-target': { name: 'No Target', value: 12, count: 8, kind: 'icon', icon: '⊘' },
  'out-of-bounds': { name: 'Out of Bounds', value: 13, count: 8, kind: 'icon', icon: '⚑' },
  'game-over': { name: 'Game Over', value: 14, count: 8, kind: 'icon', icon: '🎮' },
  'time-up': { name: 'Time Up', value: 15, count: 8, kind: 'icon', icon: '◷' },
  'didnt-register': { name: "Didn't Register", value: 16, count: 8, kind: 'icon', icon: '⇣' },
  'club-hazard': { name: 'Club Hazard', value: 17, count: 8, kind: 'icon', icon: '⌁' },
  'net-hazard': { name: 'Net Hazard', value: 18, count: 8, kind: 'icon', icon: '⚠' },
});

export const AI_PROFILES = Object.freeze([
  { name: 'Chip', avatar: 'C', personality: 'Warm, clever, and always explains the golf strategy behind a move.' },
  { name: 'Birdie Bot', avatar: 'B', personality: 'Bubbly and optimistic, celebrating pairs and lucky flips.' },
  { name: 'Ace', avatar: 'A', personality: 'Confident and competitive, but always kind and family-friendly.' },
  { name: 'Putter', avatar: 'P', personality: 'Calm and thoughtful, speaking like a patient course veteran.' },
  { name: 'Caddie', avatar: 'C', personality: 'Helpful and observant, noticing risks and useful matches.' },
  { name: 'Sky', avatar: 'S', personality: 'Adventurous and dramatic, treating every draw like a big moment.' },
  { name: 'Bunker', avatar: 'B', personality: 'Goofy and resilient, laughing off bad cards and hazards.' },
  { name: 'Mulligan', avatar: 'M', personality: 'Hopeful and playful, always believing the next card can change everything.' },
  { name: 'Eagle Eye', avatar: 'E', personality: 'Sharp and concise, spotting column matches quickly.' },
]);

export const DEAL_MODES = Object.freeze({
  lowest: { label: 'Lowest card deals', description: 'Lowest draw deals; highest draw starts.' },
  highest: { label: 'Highest card deals', description: 'Highest draw deals; lowest draw starts.' },
  random: { label: 'Random person deals', description: 'A random player deals; the next seat starts.' },
});

export function cardValue(cardId) {
  return CARD_TYPES[cardId]?.value ?? 0;
}

export function formatPoints(value) {
  return value > 0 ? `+${value}` : String(value);
}

export function buildDeck(hole = 1) {
  const deck = [];
  for (const [id, card] of Object.entries(CARD_TYPES)) {
    if (id === 'purple' && hole <= 3) continue;
    for (let copy = 0; copy < card.count; copy += 1) deck.push(id);
  }
  return deck;
}

export function shuffle(cards, random = Math.random) {
  const result = [...cards];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function slotCard(slot) {
  return typeof slot === 'string' ? slot : slot.card;
}

function slotIsVisible(slot, visibleOnly) {
  return !visibleOnly || typeof slot === 'string' || slot.faceUp;
}

export function scoreGrid(grid, { visibleOnly = false } = {}) {
  if (!Array.isArray(grid) || grid.length !== 8) {
    throw new Error('A Play Eleven grid must contain exactly eight cards.');
  }

  const lines = [];
  const matchedColumns = [];
  let total = 0;

  for (let column = 0; column < 4; column += 1) {
    const top = grid[column];
    const bottom = grid[column + 4];
    const topVisible = slotIsVisible(top, visibleOnly);
    const bottomVisible = slotIsVisible(bottom, visibleOnly);

    if (!topVisible && !bottomVisible) continue;

    const topId = slotCard(top);
    const bottomId = slotCard(bottom);

    if (topVisible && bottomVisible && topId === bottomId) {
      const value = cardValue(topId);
      const points = value >= 0 ? 0 : value * 2;
      total += points;
      matchedColumns.push(topId);
      lines.push({
        text: value >= 0
          ? `Column ${column + 1}: two ${CARD_TYPES[topId].name} cards cancel`
          : `Column ${column + 1}: two ${CARD_TYPES[topId].name} targets add`,
        points,
        kind: 'column',
      });
      continue;
    }

    let points = 0;
    const names = [];
    if (topVisible) {
      points += cardValue(topId);
      names.push(CARD_TYPES[topId].name);
    }
    if (bottomVisible) {
      points += cardValue(bottomId);
      names.push(CARD_TYPES[bottomId].name);
    }
    total += points;
    lines.push({ text: `Column ${column + 1}: ${names.join(' + ')}`, points, kind: 'column' });
  }

  if (matchedColumns.length >= 3) {
    total -= 15;
    lines.push({ text: 'Three pairs bonus', points: -15, kind: 'bonus' });
  }

  const kindCounts = matchedColumns.reduce((counts, id) => {
    counts[id] = (counts[id] || 0) + 1;
    return counts;
  }, {});

  for (const [id, matchedCount] of Object.entries(kindCounts)) {
    if (CARD_TYPES[id].count < 4 || matchedCount < 2) continue;
    const bonus = matchedCount >= 4 ? -20 : matchedCount === 3 ? -15 : -5;
    total += bonus;
    lines.push({
      text: `${matchedCount * 2} ${CARD_TYPES[id].name} cards bonus`,
      points: bonus,
      kind: 'bonus',
    });
  }

  return { total, lines, matchedColumns };
}

export function visibleScore(grid) {
  return scoreGrid(grid, { visibleOnly: true }).total;
}

export function faceUpCount(player) {
  return player.grid.filter((slot) => slot.faceUp).length;
}

export function canSkipLastFlip(player) {
  return faceUpCount(player) === 7;
}

export function matchedSlotIndexes(grid) {
  const matches = new Set();
  for (let column = 0; column < 4; column += 1) {
    const top = grid[column];
    const bottom = grid[column + 4];
    if (top.faceUp && bottom.faceUp && top.card === bottom.card) {
      matches.add(column);
      matches.add(column + 4);
    }
  }
  return matches;
}

function estimatedSlotValue(slot) {
  return slot.faceUp ? cardValue(slot.card) : 7;
}

export function placementScore(grid, targetIndex, cardId) {
  const partnerIndex = (targetIndex + 4) % 8;
  const target = grid[targetIndex];
  const partner = grid[partnerIndex];
  let gain = estimatedSlotValue(target) - cardValue(cardId);

  if (partner.faceUp && partner.card === cardId) {
    const value = cardValue(cardId);
    gain += value >= 0 ? value : Math.abs(value) * 0.35;
  }

  if (cardValue(cardId) < 0 && partner.faceUp && cardValue(partner.card) < 0) {
    gain += 10;
  }

  if (target.faceUp && partner.faceUp && target.card === partner.card && cardValue(target.card) >= 0) {
    gain -= 12;
  }

  return gain;
}

export function bestPlacement(grid, cardId) {
  let best = { index: 0, score: Number.NEGATIVE_INFINITY };
  for (let index = 0; index < grid.length; index += 1) {
    const score = placementScore(grid, index, cardId);
    if (score > best.score) best = { index, score };
  }
  return best;
}

export function fallbackAIDecision(player, topDiscard, random = Math.random) {
  const discardPlacement = topDiscard ? bestPlacement(player.grid, topDiscard) : null;
  const faceDown = player.grid
    .map((slot, index) => (!slot.faceUp ? index : -1))
    .filter((index) => index >= 0);
  const flipIndex = faceDown[Math.floor(random() * Math.max(faceDown.length, 1))] ?? 0;
  const shouldTakeDiscard = Boolean(
    topDiscard
    && (discardPlacement.score >= 4 || cardValue(topDiscard) < 0),
  );

  return {
    source: shouldTakeDiscard ? 'discard' : 'deck',
    targetSlot: discardPlacement?.index ?? 0,
    keepMax: 3,
    flipSlot: flipIndex,
    skipLastFlip: faceDown.length === 1 && visibleScore(player.grid) > 18,
    explanation: shouldTakeDiscard
      ? `The ${CARD_TYPES[topDiscard].name} improves my grid, so the commitment is worth it.`
      : 'I will risk the deck and keep a low card or a useful match.',
    dialogue: shouldTakeDiscard ? 'That discard fits my plan perfectly!' : 'Let’s see what the deck sends my way!',
    via: 'fallback',
  };
}

function integerInRange(value, minimum, maximum, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number >= minimum && number <= maximum ? number : fallback;
}

export function normalizeAIDecision(rawDecision, player, topDiscard) {
  const fallback = fallbackAIDecision(player, topDiscard, () => 0);
  const source = rawDecision?.source === 'discard' && topDiscard ? 'discard' : 'deck';
  const targetSlot = integerInRange(rawDecision?.target_slot, 0, 7, fallback.targetSlot);
  const keepMax = integerInRange(rawDecision?.keep_if_value_at_most, -25, 18, fallback.keepMax);
  const faceDown = player.grid
    .map((slot, index) => (!slot.faceUp ? index : -1))
    .filter((index) => index >= 0);
  const requestedFlip = integerInRange(rawDecision?.flip_slot, 0, 7, fallback.flipSlot);
  const flipSlot = faceDown.includes(requestedFlip) ? requestedFlip : (faceDown[0] ?? 0);
  const requestedSkip = typeof rawDecision?.skip_last_flip === 'boolean'
    ? rawDecision.skip_last_flip
    : fallback.skipLastFlip;
  const skipLastFlip = canSkipLastFlip(player) && requestedSkip;
  const safeText = (value, fallbackText, maximum = 180) => (
    typeof value === 'string' && value.trim() ? value.trim().slice(0, maximum) : fallbackText
  );

  return {
    source,
    targetSlot,
    keepMax,
    flipSlot,
    skipLastFlip,
    explanation: safeText(rawDecision?.explanation, fallback.explanation),
    dialogue: safeText(rawDecision?.dialogue, fallback.dialogue, 120),
    via: 'llm',
  };
}

export function chooseDealerDraws(playerCount, mode, random = Math.random) {
  if (!DEAL_MODES[mode]) throw new Error(`Unknown deal mode: ${mode}`);
  let draws = [];

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const deck = shuffle(buildDeck(1), random);
    draws = deck.slice(0, playerCount);
    if (new Set(draws).size === draws.length) break;
  }

  if (new Set(draws).size !== draws.length) {
    draws = Object.keys(CARD_TYPES).filter((id) => id !== 'purple').slice(0, playerCount);
  }

  const indexed = draws.map((card, index) => ({ index, card, value: cardValue(card) }));
  let dealerIndex;
  let firstPlayerIndex;

  if (mode === 'random') {
    dealerIndex = Math.floor(random() * playerCount);
    firstPlayerIndex = (dealerIndex + 1) % playerCount;
  } else if (mode === 'highest') {
    dealerIndex = indexed.reduce((best, draw) => (draw.value > best.value ? draw : best)).index;
    firstPlayerIndex = indexed.reduce((best, draw) => (draw.value < best.value ? draw : best)).index;
  } else {
    dealerIndex = indexed.reduce((best, draw) => (draw.value < best.value ? draw : best)).index;
    firstPlayerIndex = indexed.reduce((best, draw) => (draw.value > best.value ? draw : best)).index;
  }

  return { draws, dealerIndex, firstPlayerIndex };
}

export function parseJSONObject(text) {
  if (typeof text !== 'string') return null;
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}
