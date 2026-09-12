'use strict';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const STORAGE_KEY = 'bruceHackathon.openRouterKey';
const REQUEST_TIMEOUT_MS = 45_000;

const elements = {
  form: document.querySelector('#harness-form'),
  apiKey: document.querySelector('#api-key'),
  toggleKey: document.querySelector('#toggle-key'),
  saveKey: document.querySelector('#save-key'),
  forgetKey: document.querySelector('#forget-key'),
  storageStatus: document.querySelector('#storage-status'),
  model: document.querySelector('#model'),
  systemPrompt: document.querySelector('#system-prompt'),
  playerPrompt: document.querySelector('#player-prompt'),
  runTest: document.querySelector('#run-test'),
  keyStatus: document.querySelector('#key-status'),
  responseStatus: document.querySelector('#response-status'),
  responseOutput: document.querySelector('#response-output'),
  diagnosticModel: document.querySelector('#diagnostic-model'),
  diagnosticTime: document.querySelector('#diagnostic-time'),
  diagnosticTokens: document.querySelector('#diagnostic-tokens'),
};

let activeController = null;

function readRememberedKey() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function rememberKey(apiKey) {
  try {
    window.localStorage.setItem(STORAGE_KEY, apiKey);
    return true;
  } catch {
    return false;
  }
}

function forgetRememberedKey() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function updateKeyStatus(message) {
  const apiKey = elements.apiKey.value.trim();
  const hasKey = Boolean(apiKey);
  const isSaved = hasKey && apiKey === readRememberedKey();
  elements.keyStatus.textContent = message || (isSaved ? 'Saved key ready' : hasKey ? 'Unsaved key ready' : 'Waiting for key');
  elements.keyStatus.dataset.ready = String(hasKey);
}

function setResponseStatus(label, tone) {
  elements.responseStatus.textContent = label;
  elements.responseStatus.dataset.tone = tone;
  elements.responseOutput.dataset.tone = tone === 'error' ? 'error' : 'default';
}

function setBusy(isBusy) {
  elements.runTest.disabled = isBusy;
  elements.apiKey.disabled = isBusy;
  elements.model.disabled = isBusy;
  elements.systemPrompt.disabled = isBusy;
  elements.playerPrompt.disabled = isBusy;
  elements.runTest.querySelector('.button-label').textContent = isBusy ? 'Contacting agent…' : 'Run AI check';
}

function resetDiagnostics() {
  elements.diagnosticModel.textContent = '—';
  elements.diagnosticTime.textContent = '—';
  elements.diagnosticTokens.textContent = '—';
}

function getResponseText(content) {
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';

  return content
    .map((part) => {
      if (typeof part === 'string') return part;
      if (part && typeof part.text === 'string') return part.text;
      return '';
    })
    .filter(Boolean)
    .join('\n')
    .trim();
}

function getErrorMessage(payload, responseStatus) {
  const apiMessage = typeof payload?.error === 'string'
    ? payload.error
    : payload?.error?.message;

  if (apiMessage) return apiMessage;
  if (responseStatus === 401) return 'OpenRouter rejected this key. Check it and try again.';
  if (responseStatus === 402) return 'This account does not have access to the selected model. Try openrouter/free.';
  if (responseStatus === 429) return 'OpenRouter is rate-limiting requests. Wait a moment and try again.';
  return `OpenRouter returned HTTP ${responseStatus}.`;
}

function showError(message, elapsedMs) {
  setResponseStatus('Needs attention', 'error');
  elements.responseOutput.textContent = message;
  elements.diagnosticTime.textContent = elapsedMs ? `${elapsedMs} ms` : '—';
}

function saveCurrentKey() {
  const apiKey = elements.apiKey.value.trim();
  if (!apiKey) {
    elements.storageStatus.textContent = 'Enter a key first';
    updateKeyStatus();
    elements.apiKey.focus();
    return;
  }

  const saved = rememberKey(apiKey);
  elements.storageStatus.textContent = saved ? 'Saved in local storage' : 'Browser storage is blocked';
  updateKeyStatus(saved ? 'Saved key ready' : 'Key ready · storage blocked');
}

function handleKeyInput() {
  const apiKey = elements.apiKey.value.trim();
  const storedKey = readRememberedKey();

  if (apiKey && apiKey === storedKey) {
    elements.storageStatus.textContent = 'Saved in local storage';
  } else if (storedKey) {
    elements.storageStatus.textContent = 'A different key is saved';
  } else {
    elements.storageStatus.textContent = 'Not saved';
  }

  updateKeyStatus();
}

async function runHarness(event) {
  event.preventDefault();

  const apiKey = elements.apiKey.value.trim();
  const model = elements.model.value.trim();
  const systemPrompt = elements.systemPrompt.value.trim();
  const playerPrompt = elements.playerPrompt.value.trim();

  if (!apiKey || !model || !playerPrompt) {
    showError('Add an OpenRouter key, model, and test prompt before running the check.');
    return;
  }

  updateKeyStatus();

  if (activeController) activeController.abort();
  activeController = new AbortController();
  const timeout = window.setTimeout(() => activeController.abort(), REQUEST_TIMEOUT_MS);
  const startedAt = performance.now();

  setBusy(true);
  resetDiagnostics();
  setResponseStatus('Working', 'working');
  elements.responseOutput.textContent = 'Sending a small test prompt to OpenRouter…';

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-OpenRouter-Title': "Bruce's Agent Lab",
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: playerPrompt },
        ],
        max_tokens: 512,
        temperature: 0.8,
      }),
      signal: activeController.signal,
    });

    const payload = await response.json().catch(() => ({}));
    const elapsedMs = Math.round(performance.now() - startedAt);

    if (!response.ok) {
      showError(getErrorMessage(payload, response.status), elapsedMs);
      return;
    }

    const responseText = getResponseText(payload?.choices?.[0]?.message?.content);
    if (!responseText) {
      showError('The request succeeded, but the model returned no displayable text.', elapsedMs);
      return;
    }

    setResponseStatus('Connected', 'success');
    elements.responseOutput.textContent = responseText;
    elements.diagnosticModel.textContent = payload.model || model;
    elements.diagnosticTime.textContent = `${elapsedMs} ms`;
    elements.diagnosticTokens.textContent = payload.usage?.total_tokens ?? 'Not reported';
  } catch (error) {
    const elapsedMs = Math.round(performance.now() - startedAt);
    const message = error?.name === 'AbortError'
      ? 'The request took longer than 45 seconds and was stopped. Try again or choose another model.'
      : 'The browser could not reach OpenRouter. Check the connection and try again.';
    showError(message, elapsedMs);
  } finally {
    window.clearTimeout(timeout);
    activeController = null;
    setBusy(false);
  }
}

function toggleKeyVisibility() {
  const shouldShow = elements.apiKey.type === 'password';
  elements.apiKey.type = shouldShow ? 'text' : 'password';
  elements.toggleKey.textContent = shouldShow ? 'Hide' : 'Show';
  elements.toggleKey.setAttribute('aria-label', shouldShow ? 'Hide API key' : 'Show API key');
  elements.toggleKey.setAttribute('aria-pressed', String(shouldShow));
}

function clearKey() {
  const removed = forgetRememberedKey();
  elements.apiKey.value = '';
  elements.apiKey.type = 'password';
  elements.storageStatus.textContent = removed ? 'Saved key removed' : 'Field cleared · storage blocked';
  elements.toggleKey.textContent = 'Show';
  elements.toggleKey.setAttribute('aria-label', 'Show API key');
  elements.toggleKey.setAttribute('aria-pressed', 'false');
  updateKeyStatus(removed ? 'Key forgotten' : 'Key cleared · storage blocked');
  elements.apiKey.focus();
}

const storedKey = readRememberedKey();
if (storedKey) {
  elements.apiKey.value = storedKey;
  elements.storageStatus.textContent = 'Loaded from local storage';
  updateKeyStatus('Saved key loaded');
} else {
  updateKeyStatus();
}

elements.form.addEventListener('submit', runHarness);
elements.apiKey.addEventListener('input', handleKeyInput);
elements.toggleKey.addEventListener('click', toggleKeyVisibility);
elements.saveKey.addEventListener('click', saveCurrentKey);
elements.forgetKey.addEventListener('click', clearKey);
