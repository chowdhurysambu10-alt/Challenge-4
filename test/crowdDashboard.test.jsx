import './setup.js';
import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import React from 'react';
import rtl from '@testing-library/react';
const { render, screen, fireEvent, cleanup } = rtl;
import CrowdDashboard from '../src/components/CrowdDashboard.jsx';
import { StadiumProvider } from '../src/context/StadiumContext.jsx';

afterEach(() => {
  cleanup();
});

const mockGates = [
  { id: 1, name: 'Gate 1', waitTime: 8, density: 30, status: 'low' }
];

const mockZones = [
  { id: 'A', name: 'Zone A (North Stand)', density: 65 },
  { id: 'B', name: 'Zone B (East Stand)', density: 85 }
];

const mockInsights = [
  {
    id: 123,
    timestamp: '14:41',
    type: 'ai-suggestion',
    badge: 'PA Broadcast',
    message: 'Reroute Zone B East arrivals to auxiliary south-west exits.',
    reason: 'Stand density exceeds threshold.'
  }
];

test('CrowdDashboard renders live stand occupancy and AI insights', () => {
  render(
    <StadiumProvider>
      <CrowdDashboard 
        gates={mockGates} 
        zones={mockZones} 
        operationalInsights={mockInsights} 
        triggerBroadcastRedirect={() => {}}
      />
    </StadiumProvider>
  );

  // Check stand occupancy details
  assert.ok(screen.getByText(/Live Stand Occupancy/i));
  assert.ok(screen.getByText(/65%/));
  assert.ok(screen.getByText(/85%/));

  // Check AI recommendations
  assert.ok(screen.getByText(/Load Optimizer/i));
  assert.ok(screen.getByText(/PA Broadcast/i));
  assert.ok(screen.getByText(/Reroute Zone B East arrivals/i));
});

test('CrowdDashboard triggers broadcast callback when button is clicked', () => {
  let callbackTriggered = false;
  render(
    <StadiumProvider>
      <CrowdDashboard 
        gates={mockGates} 
        zones={mockZones} 
        operationalInsights={mockInsights} 
        triggerBroadcastRedirect={() => { callbackTriggered = true; }}
      />
    </StadiumProvider>
  );

  const dispatchBtn = screen.getByRole('button', { name: /Dispatch Broadcast/i });
  assert.ok(dispatchBtn);
  fireEvent.click(dispatchBtn);

  assert.equal(callbackTriggered, true);
  // Confirm button states change (disabled/active change description)
  assert.match(screen.getByRole('button', { name: /Broadcast Sent!/i }).textContent, /Broadcast Sent!/i);
});
