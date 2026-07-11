import assert from 'node:assert/strict';
import test from 'node:test';
import { initialMockData, updateMockData } from '../src/data/mockData.js';
import { buildTelemetrySnapshot, isEmergencyMessage } from '../src/lib/fanAssistant.js';

test('emergency detection is deterministic and case-insensitive', () => {
  assert.equal(isEmergencyMessage('There is a FIRE near my seat'), true);
  assert.equal(isEmergencyMessage('Where is the nearest food stall?'), false);
});

test('telemetry snapshot excludes unrelated application state', () => {
  const snapshot = buildTelemetrySnapshot(initialMockData);

  assert.deepEqual(Object.keys(snapshot).sort(), ['emergency', 'gates', 'parking', 'weather', 'zones']);
  assert.equal('operationalInsights' in snapshot, false);
  assert.equal(snapshot.gates.length, 8);
});

test('simulated telemetry remains within operational bounds', () => {
  let currentData = structuredClone(initialMockData);

  for (let iteration = 0; iteration < 100; iteration += 1) {
    const previousCheckIns = currentData.stadiumStats.totalCheckedIn;
    currentData = updateMockData(currentData);

    assert.ok(currentData.stadiumStats.totalCheckedIn >= previousCheckIns);
    assert.ok(currentData.stadiumStats.totalCheckedIn <= currentData.stadiumStats.capacity);

    for (const gate of currentData.gates) {
      assert.ok(gate.waitTime >= 2 && gate.waitTime <= 45);
      assert.ok(gate.density >= 10 && gate.density <= 100);
      assert.equal(gate.status, gate.waitTime > 20 ? 'high' : gate.waitTime > 10 ? 'moderate' : 'low');
    }
  }
});
