import test from 'node:test';
import assert from 'node:assert/strict';
import { broadcastTelemetry, getActiveClientsCount } from '../server/services/wsService.js';

test('WebSocket Core operations integration tests', async (t) => {
  await t.test('Connection counter initializes at zero', () => {
    assert.equal(getActiveClientsCount(), 0);
  });

  await t.test('Broadcast functions do not throw when zero clients are active', () => {
    assert.doesNotThrow(() => {
      broadcastTelemetry({
        gates: [],
        zones: [],
        emergencyState: { active: false }
      });
    });
  });
});
