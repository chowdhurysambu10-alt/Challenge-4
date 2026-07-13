import './setup.js';
import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import React from 'react';
import rtl from '@testing-library/react';
const { render, screen, fireEvent, cleanup } = rtl;
import StadiumMap from '../src/components/StadiumMap.jsx';
import { StadiumProvider } from '../src/context/StadiumContext.jsx';

afterEach(() => {
  cleanup();
});

const mockGates = [
  { id: 1, name: 'Gate 1', waitTime: 8, density: 30, status: 'low' },
  { id: 2, name: 'Gate 2', waitTime: 15, density: 50, status: 'moderate' },
  { id: 3, name: 'Gate 3', waitTime: 25, density: 80, status: 'high' }
];

const mockZones = [
  { id: 'A', name: 'Zone A', density: 30 },
  { id: 'B', name: 'Zone B', density: 50 }
];

test('StadiumMap renders gates and concessions with correct accessibility tags', () => {
  render(
    <StadiumProvider>
      <StadiumMap 
        gates={mockGates} 
        zones={mockZones} 
        emergencyState={{ active: false }}
        selectDestinationForNav={() => {}}
      />
    </StadiumProvider>
  );

  // Verify filter buttons are rendered
  const allButton = screen.getByRole('button', { name: /all/i });
  assert.ok(allButton);

  // Verify that POI marker buttons are rendered with appropriate accessibility labels
  const gate1Button = screen.getByRole('button', { name: /Gate 1/i });
  assert.ok(gate1Button);
  assert.match(gate1Button.getAttribute('aria-label'), /Wait time 8 minutes/);
});

test('StadiumMap handles POI marker selection and updates details panel', () => {
  render(
    <StadiumProvider>
      <StadiumMap 
        gates={mockGates} 
        zones={mockZones} 
        emergencyState={{ active: false }}
        selectDestinationForNav={() => {}}
      />
    </StadiumProvider>
  );

  // Click on "Golden Goal Burgers" (food-1)
  const burgerButton = screen.getByRole('button', { name: /Golden Goal Burgers/i });
  fireEvent.click(burgerButton);

  // Check that the details panel shows selected burger stall details
  const heading = screen.getByRole('heading', { name: /Golden Goal Burgers/i });
  assert.ok(heading);
  assert.ok(screen.getByText(/Zone A - Concourse Level 1/i));
});

test('StadiumMap displays emergency override banner when evacuation is active', () => {
  render(
    <StadiumProvider>
      <StadiumMap 
        gates={mockGates} 
        zones={mockZones} 
        emergencyState={{ active: true, location: 'Zone B Stand', type: 'fire', message: 'Evacuate immediately' }}
        selectDestinationForNav={() => {}}
      />
    </StadiumProvider>
  );

  // Verify evacuation alert text exists
  assert.ok(screen.getByText(/EVACUATION ACTIVE/i));
  assert.ok(screen.getByText(/Zone B Stand/i));
});
