import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AI_PROFILES,
  CARD_TYPES,
  buildDeck,
  canSkipLastFlip,
  chooseDealerDraws,
  fallbackAIDecision,
  normalizeAIDecision,
  parseJSONObject,
  scoreGrid,
} from '../game-core.js';

const slots = (ids, faceUp = true) => ids.map((card) => ({ card, faceUp }));

test('deck contains all 166 cards and removes purple for holes 1 through 3', () => {
  assert.equal(buildDeck(1).length, 163);
  assert.equal(buildDeck(3).length, 163);
  assert.equal(buildDeck(4).length, 166);
  assert.equal(buildDeck(11).length, 166);
  assert.equal(buildDeck(1).filter((id) => id === 'purple').length, 0);
  assert.equal(buildDeck(4).filter((id) => id === 'purple').length, 3);
  assert.equal(Object.keys(CARD_TYPES).length, 27);
  assert.equal(AI_PROFILES.length, 9);
});

test('positive pairs cancel while negative pairs keep their values', () => {
  const positivePair = scoreGrid(slots([
    'time-up', 'gray', 'white', 'blue',
    'time-up', 'red', 'red', 'red',
  ]));
  assert.equal(positivePair.lines[0].points, 0);

  const negativePair = scoreGrid(slots([
    'purple', 'gray', 'white', 'blue',
    'purple', 'red', 'red', 'red',
  ]));
  assert.equal(negativePair.lines[0].points, -44);
});

test('scoring matches Bruce’s four-of-a-kind and three-pairs example', () => {
  const result = scoreGrid(slots([
    'game-over', 'net-hazard', 'game-over', 'red',
    'game-over', 'net-hazard', 'game-over', 'strike',
  ]));
  assert.equal(result.total, -20);
  assert.deepEqual(result.lines.filter((line) => line.kind === 'bonus').map((line) => line.points), [-15, -5]);
});

test('scoring matches Bruce’s six- and eight-of-a-kind examples', () => {
  const six = scoreGrid(slots([
    'any-target', 'any-target', 'yellow', 'any-target',
    'any-target', 'any-target', 'five', 'any-target',
  ]));
  assert.equal(six.total, -30);

  const eight = scoreGrid(slots(Array(8).fill('no-target')));
  assert.equal(eight.total, -35);
});

test('four reds score negative nine', () => {
  const result = scoreGrid(slots([
    'red', 'red', 'yellow', 'brown',
    'red', 'red', 'five', 'ten',
  ]));
  assert.equal(result.lines[0].points, -2);
  assert.equal(result.lines[1].points, -2);
  assert.equal(result.lines.find((line) => line.text.includes('4 Red'))?.points, -5);
  assert.equal(result.total, -9);
});

test('best possible hand scores negative 145', () => {
  const result = scoreGrid(slots([
    'gray', 'purple', 'purple', 'green',
    'white', 'purple', 'blue', 'brown',
  ]));
  assert.equal(result.total, -145);
});

test('dealer draws are unique and follow the selected mode', () => {
  let seed = 17;
  const random = () => {
    seed = (seed * 48271) % 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const result = chooseDealerDraws(10, 'lowest', random);
  assert.equal(new Set(result.draws).size, 10);
  const values = result.draws.map((id) => CARD_TYPES[id].value);
  assert.equal(values[result.dealerIndex], Math.min(...values));
  assert.equal(values[result.firstPlayerIndex], Math.max(...values));
});

test('AI output is bounded to legal values and JSON can be extracted from fences', () => {
  const player = {
    grid: slots(['gray', 'strike', 'birdie', 'five', 'red', 'six', 'seven', 'eight'])
      .map((slot, index) => ({ ...slot, faceUp: index < 2 })),
  };
  const parsed = parseJSONObject('```json\n{"source":"discard","target_slot":99,"dialogue":"Fore!"}\n```');
  const decision = normalizeAIDecision(parsed, player, 'strike');
  assert.equal(decision.source, 'discard');
  assert.ok(decision.targetSlot >= 0 && decision.targetSlot <= 7);
  assert.equal(decision.dialogue, 'Fore!');
});

test('the optional skip is legal only when exactly seven cards are face up', () => {
  const player = {
    grid: slots(['gray', 'strike', 'birdie', 'five', 'red', 'six', 'seven', 'eight'])
      .map((slot, index) => ({ ...slot, faceUp: index < 7 })),
  };

  assert.equal(canSkipLastFlip(player), true);
  const skipDecision = normalizeAIDecision({ source: 'deck', skip_last_flip: true }, player, 'strike');
  assert.equal(skipDecision.skipLastFlip, true);

  player.grid[6].faceUp = false;
  assert.equal(canSkipLastFlip(player), false);
  const illegalSkip = normalizeAIDecision({ source: 'deck', skip_last_flip: true }, player, 'strike');
  assert.equal(illegalSkip.skipLastFlip, false);

  const highGridPlayer = {
    grid: slots(['ten', 'eleven', 'no-target', 'out-of-bounds', 'game-over', 'time-up', 'didnt-register', 'gray'])
      .map((slot, index) => ({ ...slot, faceUp: index < 7 })),
  };
  assert.equal(fallbackAIDecision(highGridPlayer, null, () => 0).skipLastFlip, true);
});
