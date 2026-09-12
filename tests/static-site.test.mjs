import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('GitHub Pages entry point uses relative local assets', async () => {
  const html = await read('index.html');

  assert.match(html, /href="style\.css"/);
  assert.match(html, /src="redirect\.js"/);
  assert.match(html, /type="module" src="app\.js"/);
  assert.doesNotMatch(html, /(?:src|href)="\//);
});

test('page exposes an accessible player-owned key flow', async () => {
  const app = await read('app.js');

  assert.match(app, /<label for="api-key">/);
  assert.match(app, /id="api-key" type="password"/);
  assert.match(app, /data-act="saveKey"/);
  assert.match(app, /data-act="forgetKey"/);
  assert.match(app, /let sessionApiKey = readStorage\(KEY_STORAGE\)/);
  assert.match(app, /const apiKey = sessionApiKey \|\| readStorage\(KEY_STORAGE\)/);
  assert.match(app, /id="announcer"[^>]+aria-live="assertive"/);
});

test('browser client limits network access and never renders model HTML', async () => {
  const [html, app] = await Promise.all([read('index.html'), read('app.js')]);

  assert.match(html, /connect-src https:\/\/openrouter\.ai/);
  assert.match(app, /https:\/\/openrouter\.ai\/api\/v1\/chat\/completions/);
  assert.match(app, /removeStorage\(KEY_STORAGE\)/);
  assert.match(app, /escapeHTML\(item\.dialogue\)/);
  assert.match(app, /parseJSONObject/);
  assert.doesNotMatch(app, /\.innerHTML\s*=\s*[^`'"\n]*responseText/);
});

test('public HTTP traffic is upgraded before API-key use', async () => {
  const redirect = await read('redirect.js');

  assert.match(redirect, /window\.location\.protocol === 'http:'/);
  assert.match(redirect, /window\.location\.replace/);
  assert.match(redirect, /localhost/);
});

test('local preview blocks ignored inputs and secret folders', async () => {
  const server = await read('scripts/serve.mjs');

  assert.match(server, /'local-only'/);
  assert.match(server, /'intake'/);
  assert.match(server, /'\.git'/);
  assert.match(server, /segment\.startsWith\('\.env'\)/);
});
