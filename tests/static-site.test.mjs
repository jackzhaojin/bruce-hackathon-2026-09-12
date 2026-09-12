import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('GitHub Pages entry point uses relative local assets', async () => {
  const html = await read('index.html');

  assert.match(html, /href="style\.css"/);
  assert.match(html, /src="redirect\.js"/);
  assert.match(html, /src="app\.js"/);
  assert.doesNotMatch(html, /(?:src|href)="\//);
});

test('page exposes an accessible player-owned key flow', async () => {
  const html = await read('index.html');

  assert.match(html, /<label for="api-key">/);
  assert.match(html, /id="api-key"[^>]+type="password"/);
  assert.match(html, /id="save-key"[^>]+type="button"/);
  assert.match(html, /id="forget-key"[^>]+type="button"/);
  assert.match(html, /id="response-output"[^>]+aria-live="polite"/);
});

test('browser client limits network access and never renders model HTML', async () => {
  const [html, app] = await Promise.all([read('index.html'), read('app.js')]);

  assert.match(html, /connect-src https:\/\/openrouter\.ai/);
  assert.match(app, /https:\/\/openrouter\.ai\/api\/v1\/chat\/completions/);
  assert.match(app, /localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.match(app, /responseOutput\.textContent = responseText/);
  assert.doesNotMatch(app, /innerHTML/);
});

test('public HTTP traffic is upgraded before API-key use', async () => {
  const redirect = await read('redirect.js');

  assert.match(redirect, /window\.location\.protocol === 'http:'/);
  assert.match(redirect, /window\.location\.replace/);
  assert.match(redirect, /localhost/);
});
