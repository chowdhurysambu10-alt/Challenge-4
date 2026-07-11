import React, { useState } from 'react';
import { ShieldAlert, Accessibility, Heart, VolumeX, ArrowRight, CheckCircle, Bell } from 'lucide-react';

export default function EmergencyAccessibility({ emergencyState, setEmergencyState, addNotification }) {
  const [shuttleRequested, setShuttleRequested] = useState(false);

  const triggerIncident = (type, location, message) => {
    setEmergencyState({
      active: true,
      type,
      location,
      message,
      evacRoute: ['Zone B Stand', 'Concourse Corridor B', 'Gate 5/6 Exit']
    });
    addNotification("system-alert", `INCIDENT ALARM: ${type.toUpperCase()} in ${location}. Evac paths computed.`);
  };

  const clearIncident = () => {
    setEmergencyState({
      active: false,
      type: null,
      location: null,
      message: "",
      evacRoute: []
    });
    addNotification("system-alert", "Nominal safety checks restored. Evacuation paths cleared.");
  };

  const handleRequestShuttle = () => {
    setShuttleRequested(true);
    setTimeout(() => {
      setShuttleRequested(false);
    }, 4000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
      
      {/* Safety Command Center */}
      <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] flex flex-col justify-between shadow-sm transition-colors duration-300">
        <div>
          <div className="flex justify-between items-center mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-neutral-800 dark:text-white animate-pulse" />
              <h3 className="text-sm font-bold tracking-wider text-neutral-400 uppercase font-mono">Emergency Systems</h3>
            </div>
            <span className="text-[9px] font-mono bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 px-2.5 py-1 rounded-full font-bold">
              Demo Simulator
            </span>
          </div>

          <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-4 leading-relaxed font-sans">
            Simulate arena emergency triggers to test pathing concepts and the dynamic exit-mapping overlay. No real alerts or dispatches are sent.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => triggerIncident("smoke", "Zone B East Stand", "Smoke sensor trigger at Concourse B. Evacuate East stand.")}
              className="bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl text-left flex flex-col justify-between transition-all cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-700"
            >
              <span className="text-xs font-bold block uppercase text-neutral-800 dark:text-white">Zone B Smoke Warning</span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-450 mt-2 leading-normal">Triggers fire evacuation paths out of East zone.</span>
            </button>

            <button
              onClick={() => triggerIncident("crowd", "Gate 3 Entrance", "High crowd pinch threshold detected at Gate 3. Hold entry flows.")}
              className="bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl text-left flex flex-col justify-between transition-all cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-700"
            >
              <span className="text-xs font-bold block uppercase text-neutral-800 dark:text-white">Gate 3 Crowd Alert</span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-455 mt-2 leading-normal">Reroutes active arrivals to southern Gate 5/6.</span>
            </button>
          </div>

          {/* AI Evacuation route planning outputs */}
          {emergencyState.active ? (
            <div className="mt-5 bg-neutral-900 dark:bg-black text-white p-4 rounded-2xl space-y-3 border border-neutral-950 dark:border-neutral-850">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#e2ff70] font-bold uppercase tracking-wider flex items-center font-mono">
                  <ShieldAlert className="w-4 h-4 mr-1.5" />
                  SIMULATED INCIDENT: {emergencyState.type}
                </span>
                <button
                  onClick={clearIncident}
                  className="bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 px-3 py-1 rounded-full text-[9px] font-bold cursor-pointer transition-all border border-white dark:border-neutral-700"
                >
                  Clear Simulation
                </button>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <span className="text-[9px] text-neutral-500 uppercase block">Location</span>
                <span className="text-white font-bold">{emergencyState.location}</span>
                <p className="text-[10px] text-neutral-300 dark:text-neutral-400 italic mt-1 font-sans">"{emergencyState.message}"</p>
              </div>

              <div className="border-t border-neutral-800 dark:border-neutral-900 pt-3 space-y-2">
                <div className="flex items-center text-[9px] font-mono text-neutral-450">
                  <span className="bg-[#e2ff70] dark:bg-white text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full mr-1.5">AI ROUTING</span>
                  <span>Evacuation paths calculated</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-white font-mono">
                  <span>Stand B</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="underline">Concourse B</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="font-bold text-black bg-[#e2ff70] px-2 py-0.5 rounded-full">Gate 5 & 6</span>
                </div>
                <p className="text-[9px] text-neutral-400 dark:text-neutral-500 leading-normal font-mono">
                  Exit Gate 3 locked by AI control. Stewards directed to sweep sectors 110-120.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center text-xs text-neutral-500 dark:text-neutral-400 font-mono font-bold">
              No active emergency incidents detected. Arena runs on nominal protocols.
            </div>
          )}
        </div>

        {emergencyState.active && (
          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl flex items-center space-x-2 mt-4 text-[9px] font-mono text-neutral-500 dark:text-neutral-450">
            <Bell className="w-4 h-4 text-neutral-850 dark:text-neutral-200 animate-bounce" />
            <span>Simulated operational log updated. No first responders were notified.</span>
          </div>
        )}
      </div>

      {/* Accessibility Services */}
      <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] flex flex-col justify-between shadow-sm transition-colors duration-300">
        <div>
          <div className="flex justify-between items-center mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <Accessibility className="w-5 h-5 text-neutral-800 dark:text-white" />
              <h3 className="text-sm font-bold tracking-wider text-neutral-400 uppercase font-mono">Accessibility Services</h3>
            </div>
            <span className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-full font-bold">
              Demo Services
            </span>
          </div>

          <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-4 leading-relaxed font-sans">
            Request assistance services, inspect Quiet sensory zones, and manage inventory of ADA assistance equipment.
          </p>

          <div className="space-y-4">
            
            {/* Sensory quiet room status */}
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white dark:bg-neutral-850 border border-neutral-150 dark:border-neutral-800 shadow-sm text-neutral-850 dark:text-white rounded-xl">
                  <VolumeX className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-850 dark:text-white uppercase">Sensory Quiet Room 1</h4>
                  <span className="text-[9px] text-neutral-500 dark:text-neutral-450 font-mono">Zone D Concourse - Soundproofing</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-neutral-800 dark:text-white">3 / 8 Seats filled</span>
                <span className="text-[8px] bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-350 dark:border-neutral-700 px-1.5 py-0.5 rounded-full font-mono font-bold uppercase block mt-0.5">OPEN</span>
              </div>
            </div>

            {/* ADA Shuttle Assist Request */}
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-white uppercase">Mobility Shuttle Dispatch</h4>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-450">Request electric cart pickup at Gate 7</p>
                </div>
                <Accessibility className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              </div>

              {shuttleRequested ? (
                <div className="bg-[#e2ff70] text-black border border-neutral-300 p-3 rounded-xl flex items-center space-x-2 text-xs font-bold shadow-sm animate-pulse" role="status">
                  <CheckCircle className="w-4 h-4 text-black" />
                  <span>Demo: Cart #3 would be assigned to Gate 7. Estimated arrival: 4m.</span>
                </div>
              ) : (
                <button
                  onClick={handleRequestShuttle}
                  className="w-full bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 border border-neutral-900 dark:border-neutral-200 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer shadow-sm font-sans"
                >
                  Request Shuttle Dispatch
                </button>
              )}
            </div>

            {/* Hearing aids kit registry */}
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-3.5 rounded-2xl flex justify-between items-center text-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white dark:bg-neutral-850 border border-neutral-150 dark:border-neutral-800 shadow-sm text-neutral-850 dark:text-white rounded-xl">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-white uppercase">Hearing Loop Kits</h4>
                  <span className="text-[9px] text-neutral-500 dark:text-neutral-450 font-mono">Checked out induction headsets</span>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-neutral-800 dark:text-white">18 / 50 Checked Out</span>
                <span className="text-[9px] text-neutral-500 dark:text-neutral-450 block font-mono">32 Kits Available</span>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-4 p-3 bg-[#e2ff70]/30 dark:bg-[#e2ff70]/10 border border-[#e2ff70] rounded-xl text-[10px] text-neutral-700 dark:text-neutral-300 leading-normal font-mono">
          Demo suggestion: wheelchair assistance demand may spike 10 minutes post-game. Validate any real staffing plan with the venue accessibility team.
        </div>
      </div>

    </div>
  );
}
