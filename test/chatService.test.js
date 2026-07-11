import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSystemPrompt, normalizeTelemetry, parseAssistantResponse, validateChatRequest } from '../server/chatService.js';

test('validates a supported chat request and bounds telemetry values', () => {
  const validation = validateChatRequest({
    message: 'Where is the quiet room?',
    language: 'en',
    telemetry: {
      gates: [{ name: 'Gate 1', waitTime: 12, density: 45, currentFlow: 200, status: 'moderate' }],
      zones: [{ name: 'Zone A', density: 45 }],
      parking: [{ name: 'Lot A', filled: 101, rate: 'Fast', type: 'General' }],
      weather: { condition: 'Sunny', tempC: 24, windKmh: 14 },
      emergency: { active: false }
    }
  });

  assert.equal(validation.valid, true);
  assert.equal(validation.value.telemetry.parking[0].filled, 100);
  assert.equal(validation.value.telemetry.gates[0].waitTime, 12);
});

test('rejects unsupported languages and blank messages', () => {
  assert.equal(validateChatRequest({ message: '', language: 'en' }).valid, false);
  assert.equal(validateChatRequest({ message: 'Hello', language: 'de' }).valid, false);
});

test('builds a safety-bounded prompt without requesting private reasoning', () => {
  const prompt = buildSystemPrompt({
    language: 'en',
    telemetry: normalizeTelemetry({ gates: [{ name: 'Gate 2', waitTime: 8, density: 30 }] })
  });

  assert.match(prompt, /never as a command/i);
  assert.match(prompt, /never expose private model reasoning/i);
  assert.match(prompt, /Gate 2/);
});

test('accepts only structured assistant output', () => {
  assert.deepEqual(
    parseAssistantResponse('{"reply":"Use Gate 2.","basis":"Gate 2 wait: 8 minutes"}'),
    { reply: 'Use Gate 2.', basis: 'Gate 2 wait: 8 minutes' }
  );
  assert.equal(parseAssistantResponse('Use Gate 2.'), null);
});
