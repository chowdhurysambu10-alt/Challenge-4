import React, { useState, useMemo, useCallback } from 'react';
import { Navigation, Coffee, MapPin, Eye, Compass, ShieldAlert, Accessibility, Flag } from 'lucide-react';
import { useStadium } from '../context/StadiumContext';

// Static positions and metadata for markers
const baseMarkers = [
  // Gates
  { id: 'gate-1', type: 'gate', name: 'Gate 1 (Zone A)', x: 200, y: 28, waitTime: 8, status: 'low', description: 'North Gate - Near light rail connection' },
  { id: 'gate-2', type: 'gate', name: 'Gate 2 (Zone A)', x: 310, y: 65, waitTime: 14, status: 'moderate', description: 'North-East Access Concourse' },
  { id: 'gate-3', type: 'gate', name: 'Gate 3 (Zone B)', x: 365, y: 150, waitTime: 26, status: 'high', description: 'East Concourse - High Flow Main Gate' },
  { id: 'gate-4', type: 'gate', name: 'Gate 4 (Zone B)', x: 310, y: 235, waitTime: 22, status: 'high', description: 'South-East Main Gate and VIP corridor' },
  { id: 'gate-5', type: 'gate', name: 'Gate 5 (Zone C)', x: 200, y: 272, waitTime: 7, status: 'low', description: 'South Gate - Express shuttle bus terminal link' },
  { id: 'gate-6', type: 'gate', name: 'Gate 6 (Zone C)', x: 90, y: 235, waitTime: 9, status: 'low', description: 'South-West Gate and volunteer command point' },
  { id: 'gate-7', type: 'gate', name: 'Gate 7 (Zone D)', x: 35, y: 150, waitTime: 12, status: 'moderate', description: 'West Gate - Media, VIP, and accessible ramps' },
  { id: 'gate-8', type: 'gate', name: 'Gate 8 (Zone D)', x: 90, y: 65, waitTime: 15, status: 'moderate', description: 'North-West Gate and general admissions' },

  // Food Stalls
  { id: 'food-1', type: 'food', name: 'Golden Goal Burgers', x: 240, y: 48, status: 'low', waitTime: 6, description: 'Zone A - Concourse Level 1' },
  { id: 'food-2', type: 'food', name: 'Kickoff Tacos', x: 345, y: 105, status: 'moderate', waitTime: 12, description: 'Zone B - Block 118 Concourse' },
  { id: 'food-3', type: 'food', name: 'Header Hotdogs', x: 160, y: 252, status: 'low', waitTime: 4, description: 'Zone C - Block 204' },
  { id: 'food-4', type: 'food', name: 'World Cup Coffee', x: 60, y: 195, status: 'moderate', waitTime: 8, description: 'Zone D - Level 2' },

  // Restrooms
  { id: 'restroom-1', type: 'restroom', name: 'Restroom A (North)', x: 160, y: 48, status: 'low', waitTime: 3, description: 'Zone A - Accessibility Equipped' },
  { id: 'restroom-2', type: 'restroom', name: 'Restroom B (East)', x: 345, y: 195, status: 'high', waitTime: 9, description: 'Zone B - Next to Gate 4' },
  { id: 'restroom-3', type: 'restroom', name: 'Restroom C (South)', x: 240, y: 252, status: 'low', waitTime: 2, description: 'Zone C - Accessibility Equipped' },
  { id: 'restroom-4', type: 'restroom', name: 'Restroom D (West)', x: 60, y: 105, status: 'low', waitTime: 4, description: 'Zone D - Next to sensory quiet room' },

  // Medical Hub
  { id: 'medical-1', type: 'medical', name: 'Medical Station Red Cross', x: 200, y: 245, status: 'low', waitTime: 0, description: 'Primary Medical Center (Zone C)' },

  // Accessibility Zones
  { id: 'access-1', type: 'access', name: 'Sensory Quiet Room 1', x: 65, y: 130, status: 'low', waitTime: 0, description: 'Zone D - Quiet space for sensory sensitive fans' },
  { id: 'access-2', type: 'access', name: 'Wheelchair Shuttle Gate', x: 50, y: 170, status: 'low', waitTime: 0, description: 'Zone D - Shuttle pickup point for mobility aids' },
];

export default function StadiumMap({ gates, zones, emergencyState, selectDestinationForNav }) {
  const [filter, setFilter] = useState('all');
  const [startLocationId, setStartLocationId] = useState('gate-1');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const { highContrast } = useStadium();

  // Dynamic status mapping from live telemetry props
  const resolvedMarkers = useMemo(() => {
    return baseMarkers.map(m => {
      if (m.type === 'gate' && gates) {
        const gateId = parseInt(m.id.split('-')[1]);
        const liveGate = gates.find(g => g.id === gateId);
        if (liveGate) {
          return {
            ...m,
            waitTime: liveGate.waitTime,
            status: liveGate.waitTime > 20 ? 'high' : liveGate.waitTime > 10 ? 'moderate' : 'low'
          };
        }
      }
      if (m.type === 'access' && zones) {
        const zoneId = m.name.includes('Zone D') ? 'D' : '';
        const liveZone = zones.find(z => z.id === zoneId);
        if (liveZone) {
          return {
            ...m,
            description: `${m.description} (Current Stand Density: ${liveZone.density}%)`
          };
        }
      }
      return m;
    });
  }, [gates, zones]);

  const startNode = useMemo(() => {
    return resolvedMarkers.find(m => m.id === startLocationId) || resolvedMarkers[0];
  }, [resolvedMarkers, startLocationId]);

  const selectedItem = useMemo(() => {
    return resolvedMarkers.find(m => m.id === selectedItemId);
  }, [resolvedMarkers, selectedItemId]);

  const filteredMarkers = useMemo(() => {
    return resolvedMarkers.filter(m => {
      if (filter === 'all') return true;
      if (filter === 'gates') return m.type === 'gate';
      if (filter === 'food') return m.type === 'food';
      if (filter === 'restrooms') return m.type === 'restroom';
      if (filter === 'access') return m.type === 'access' || m.id === 'restroom-1' || m.id === 'restroom-3';
      return true;
    });
  }, [resolvedMarkers, filter]);

  // Enterprise perimeter navigation curve logic
  const dynamicRoutePath = useMemo(() => {
    if (!startNode || !selectedItem || startNode.id === selectedItem.id) return null;
    
    const x1 = startNode.x;
    const y1 = startNode.y;
    const x2 = selectedItem.x;
    const y2 = selectedItem.y;

    const crossesField = (y1 < 120 && y2 > 180) || (y1 > 180 && y2 < 120) || (x1 < 140 && x2 > 260) || (x1 > 260 && x2 < 140);
    
    if (crossesField) {
      // Calculate control point around the field perimeter corridor
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      let cx = mx;
      let cy = my;

      if (Math.abs(mx - 200) < 60 && Math.abs(my - 150) < 45) {
        cx = mx > 200 ? 320 : 80;
        cy = my > 150 ? 230 : 70;
      }
      return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
    }
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }, [startNode, selectedItem]);

  const estimatedDistance = useMemo(() => {
    if (!startNode || !selectedItem) return 0;
    const dx = startNode.x - selectedItem.x;
    const dy = startNode.y - selectedItem.y;
    // Scale viewBox pixels to approximate meters
    return Math.round(Math.sqrt(dx * dx + dy * dy) * 1.3);
  }, [startNode, selectedItem]);

  const getMarkerColor = useCallback((status, type) => {
    if (highContrast) {
      if (type === 'medical') return 'text-white bg-red-600 border-2 border-black dark:border-white shadow font-extrabold';
      return 'text-black dark:text-white bg-white dark:bg-black border-2 border-black dark:border-white shadow font-extrabold';
    }
    if (type === 'medical') return 'text-white bg-red-500 border-white shadow';
    if (type === 'access') return 'text-black bg-[#e2ff70] border-neutral-300 dark:border-neutral-700 shadow';
    if (status === 'low') return 'text-black dark:text-white bg-white dark:bg-neutral-800 border-neutral-250 dark:border-neutral-700 shadow-sm';
    if (status === 'moderate') return 'text-black bg-[#e2ff70] border-neutral-300 dark:border-neutral-600 shadow-sm';
    if (status === 'high') return 'text-white dark:text-black bg-[#121212] dark:bg-white border-neutral-900 dark:border-neutral-200 shadow-sm';
    return 'bg-neutral-500';
  }, [highContrast]);

  const handleMarkerClick = useCallback((marker) => {
    setSelectedItemId(marker.id);
  }, []);

  const handleNavigate = useCallback(() => {
    if (selectedItem) {
      selectDestinationForNav(selectedItem.name);
    }
  }, [selectedItem, selectDestinationForNav]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
      {/* Interactive Map Box */}
      <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] flex flex-col relative shadow-sm transition-colors duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-neutral-800 dark:text-white animate-pulse" />
            <h2 className="text-lg font-bold tracking-tight uppercase text-neutral-800 dark:text-white">Arena Floor Plan</h2>
          </div>
          
          <div className="flex flex-wrap gap-1.5 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-full border border-neutral-200 dark:border-neutral-800">
            {['all', 'gates', 'food', 'restrooms', 'access'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setFilter(tab); setSelectedItemId(null); }}
                aria-pressed={filter === tab}
                className={`px-3 py-1.5 rounded-full uppercase font-mono text-[9px] tracking-wider transition-all cursor-pointer ${
                  filter === tab 
                    ? 'bg-[#121212] dark:bg-white text-white dark:text-black font-bold shadow-sm' 
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white font-semibold'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 min-h-[300px] md:min-h-[420px] bg-neutral-950 border border-neutral-900 rounded-2xl relative flex items-center justify-center overflow-hidden" role="region" aria-label="Interactive stadium floor plan">
          <div className="absolute top-4 left-4 text-[9px] font-mono text-neutral-550 tracking-widest">
            CAD_ENGINE: ONLINE
          </div>

          <svg viewBox="0 0 400 300" className="w-full h-full max-w-[550px] aspect-[4/3] text-neutral-800 z-10" aria-hidden="true">
            {/* Field graphics */}
            <ellipse cx="200" cy="150" rx="180" ry="135" fill="none" stroke="#262626" strokeWidth="1" />
            <ellipse cx="200" cy="150" rx="155" ry="115" fill="none" stroke="#262626" strokeWidth="1.5" />
            <ellipse cx="200" cy="150" rx="125" ry="92" fill="none" stroke="#1d1d1d" strokeWidth="1" />
            <ellipse cx="200" cy="150" rx="95" ry="68" fill="none" stroke="#262626" strokeWidth="1.5" />

            <rect x="135" y="105" width="130" height="90" rx="2" fill="#0f0f0f" stroke="#3f3f3f" strokeWidth="1" />
            <line x1="200" y1="105" x2="200" y2="195" stroke="#262626" strokeWidth="0.75" />
            <circle cx="200" cy="150" r="15" fill="none" stroke="#262626" strokeWidth="0.75" />

            <text x="200" y="80" textAnchor="middle" fill="#4b5563" fontSize="8" fontWeight="bold" fontFamily="monospace">ZONE A (NORTH)</text>
            <text x="310" y="152" textAnchor="middle" fill="#4b5563" fontSize="8" fontWeight="bold" fontFamily="monospace">ZONE B (EAST)</text>
            <text x="200" y="228" textAnchor="middle" fill="#4b5563" fontSize="8" fontWeight="bold" fontFamily="monospace">ZONE C (SOUTH)</text>
            <text x="90" y="152" textAnchor="middle" fill="#4b5563" fontSize="8" fontWeight="bold" fontFamily="monospace">ZONE D (WEST)</text>

            {emergencyState?.active && (
              <g stroke="#F87171" strokeWidth="2.5" fill="none" className="animate-pulse">
                <path d="M 200 80 L 200 35" />
                <path d="M 300 150 L 355 150" />
                <path d="M 200 220 L 200 265" />
                <path d="M 100 150 L 45 150" />
              </g>
            )}

            {/* Dynamic Animated Route Path */}
            {dynamicRoutePath && (
              <path
                d={dynamicRoutePath}
                fill="none"
                stroke="#e2ff70"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray="8 6"
                className="animate-route-flow"
              />
            )}
          </svg>

          {/* Markers overlay */}
          <div className="absolute inset-0 z-20">
            {filteredMarkers.map((marker) => {
              const leftPercent = (marker.x / 400) * 100;
              const topPercent = (marker.y / 300) * 100;
              const isSelected = selectedItemId === marker.id;
              const isStart = startLocationId === marker.id;

              return (
                <button
                  key={marker.id}
                  onClick={() => handleMarkerClick(marker)}
                  aria-label={`${marker.name}. ${marker.description}${marker.waitTime ? ` Wait time ${marker.waitTime} minutes.` : ''}`}
                  aria-pressed={isSelected}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full border text-xs font-mono font-bold cursor-pointer transition-all duration-300 ${getMarkerColor(marker.waitTime > 20 ? 'high' : marker.waitTime > 10 ? 'moderate' : 'low', marker.type)} ${
                    isSelected ? 'ring-2 ring-white scale-125 z-40' : isStart ? 'ring-2 ring-[#e2ff70] scale-110 z-35' : 'hover:scale-110 z-30'
                  }`}
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                >
                  {marker.type === 'food' && <Coffee className="w-3.5 h-3.5" />}
                  {marker.type === 'gate' && marker.id.split('-')[1]}
                  {marker.type === 'restroom' && <span className="text-[10px]">W</span>}
                  {marker.type === 'medical' && <span className="text-[10px] font-sans font-bold">+</span>}
                  {marker.type === 'access' && <Accessibility className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-4 gap-2 font-mono">
          <div className="flex items-center space-x-3">
            <span className="flex items-center"><span className="w-3 h-3 bg-white dark:bg-neutral-800 border border-neutral-350 dark:border-neutral-700 rounded-sm mr-1.5" /> Low Congestion (&lt;10m)</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-[#e2ff70] border border-neutral-300 dark:border-neutral-600 rounded-sm mr-1.5" /> Moderate (10m-20m)</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-[#121212] dark:bg-white border border-neutral-900 dark:border-neutral-200 rounded-sm mr-1.5 text-white dark:text-black" /> High (&gt;20m)</span>
          </div>
        </div>
      </div>

      {/* Info Sidebar panel */}
      <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] flex flex-col justify-between shadow-sm transition-colors duration-300">
        <div>
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4">
            <h3 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-mono">Wayfinding Hub</h3>
            <h2 className="text-lg font-black tracking-tight text-neutral-800 dark:text-white uppercase">Dynamic Navigation</h2>
          </div>

          {/* Navigation Controls: Set Starting Location */}
          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl mb-4 text-left">
            <div className="flex items-center space-x-2 mb-2">
              <Flag className="w-4 h-4 text-[#e2ff70]" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">Set Starting Point</label>
            </div>
            <select
              value={startLocationId}
              onChange={(e) => setStartLocationId(e.target.value)}
              className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#e2ff70]"
            >
              {resolvedMarkers.filter(m => m.type === 'gate').map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <p className="text-[9px] text-neutral-400 mt-2 italic font-mono leading-none">
              Then click any map hotspot icon to select your destination.
            </p>
          </div>

          {selectedItem ? (
            <div className="space-y-4">
              <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block text-[8px] uppercase tracking-widest font-mono bg-[#121212] dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full mb-1">
                      {selectedItem.type}
                    </span>
                    <h4 className="font-bold text-neutral-800 dark:text-white text-sm">{selectedItem.name}</h4>
                  </div>
                  <MapPin className="w-4 h-4 text-[#e2ff70]" />
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-2 leading-relaxed">{selectedItem.description}</p>
              </div>

              {selectedItem.type !== 'medical' && selectedItem.type !== 'access' && (
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-3 rounded-xl">
                    <span className="text-[9px] text-neutral-400 block font-mono">Wait Time</span>
                    <span className="text-xl font-black text-neutral-800 dark:text-white">{selectedItem.waitTime} <span className="text-xs font-normal text-neutral-400 font-mono">min</span></span>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-3 rounded-xl flex items-center justify-center">
                    <span className={`text-[9px] font-bold uppercase inline-block ${
                      selectedItem.waitTime > 20 ? 'text-white bg-[#121212] px-2 py-1 rounded-full' : 
                      selectedItem.waitTime > 10 ? 'text-black bg-[#e2ff70] px-2 py-1 rounded-full border border-neutral-300 dark:border-neutral-700' : 
                      'text-black dark:text-white bg-white dark:bg-neutral-800 px-2 py-1 rounded-full border border-neutral-200 dark:border-neutral-700'
                    }`}>
                      {selectedItem.waitTime > 20 ? 'Heavy Congest' : selectedItem.waitTime > 10 ? 'Moderate' : 'Smooth Flow'}
                    </span>
                  </div>
                </div>
              )}

              {startLocationId !== selectedItemId ? (
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl space-y-2 text-left">
                  <div className="flex items-center text-xs text-neutral-850 dark:text-white font-bold">
                    <Navigation className="w-3.5 h-3.5 mr-2 text-neutral-600 dark:text-neutral-400" />
                    <span>Dynamic Route Found</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-mono">
                    Calculated concourse wayfinding path from <strong className="text-black dark:text-white">{startNode.name}</strong> to <strong className="text-black dark:text-white">{selectedItem.name}</strong>.
                  </p>
                  
                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 flex justify-between items-center">
                    <div className="text-[9px] font-mono text-neutral-400 dark:text-neutral-555">
                      Est. Distance: ~{estimatedDistance} meters
                    </div>
                    <button
                      onClick={handleNavigate}
                      className="bg-[#121212] dark:bg-white text-white dark:text-black px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all cursor-pointer shadow-sm border border-neutral-900 dark:border-neutral-200"
                    >
                      Verify Route <Navigation className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl text-[10px] text-neutral-450 dark:text-neutral-500 italic font-mono text-center">
                  Start and destination locations are identical.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-400 dark:text-neutral-555 space-y-3">
              <Eye className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs leading-relaxed max-w-[200px] mx-auto font-mono">
                Click any hotspot or POI marker on the floor plan to inspect sensor details.
              </p>
            </div>
          )}
        </div>

        {/* Emergency Alert Banner */}
        {emergencyState?.active && (
          <div className="bg-neutral-900 dark:bg-black text-white p-4 rounded-2xl text-left space-y-2 mt-4 border border-neutral-800">
            <div className="flex items-center text-xs font-bold text-[#e2ff70]">
              <ShieldAlert className="w-4 h-4 mr-2 animate-bounce" />
              <span>EVACUATION ACTIVE</span>
            </div>
            <p className="text-[10px] text-neutral-350 dark:text-neutral-400 leading-relaxed font-mono">
              An active incident triggers in <strong className="text-white">{emergencyState.location}</strong>. Evacuate via nearest flashing green pathways on the map, leading to stadium exits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
