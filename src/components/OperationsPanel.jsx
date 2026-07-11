import React, { useState } from 'react';
import { Users, Clock, ShieldCheck, UserCheck, Play, Sparkles, Check } from 'lucide-react';

export default function OperationsPanel({ stadiumStats, operationalInsights, dispatchStaff }) {
  const [acknowledgedInsights, setAcknowledgedInsights] = useState({});
  const [staffDispatched, setStaffDispatched] = useState(false);

  const handleAcknowledge = (id) => {
    setAcknowledgedInsights(prev => ({
      ...prev,
      [id]: true
    }));
  };

  const handleDispatchStaff = () => {
    setStaffDispatched(true);
    dispatchStaff();
    setTimeout(() => {
      setStaffDispatched(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Fans checked in */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-5 rounded-[24px] flex items-center justify-between shadow-sm transition-colors duration-300">
          <div>
            <span className="text-[10px] text-neutral-450 dark:text-neutral-400 uppercase font-mono block font-bold">Checked In Fans</span>
            <span className="text-2xl font-black text-neutral-800 dark:text-white font-display mt-0.5">
              {stadiumStats.totalCheckedIn.toLocaleString()} 
              <span className="text-xs text-neutral-450 dark:text-neutral-500 font-normal font-mono"> / {stadiumStats.capacity.toLocaleString()}</span>
            </span>
            <div className="w-24 bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-black dark:bg-[#e2ff70] h-full rounded-full"
                style={{ width: `${(stadiumStats.totalCheckedIn / stadiumStats.capacity) * 100}%` }}
              />
            </div>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 shadow-sm text-neutral-800 dark:text-white rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Wait Time */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-5 rounded-[24px] flex items-center justify-between shadow-sm transition-colors duration-300">
          <div>
            <span className="text-[10px] text-neutral-450 dark:text-neutral-400 uppercase font-mono block font-bold">Avg Gate Wait</span>
            <span className="text-2xl font-black text-neutral-800 dark:text-white font-display mt-0.5">{stadiumStats.avgWaitTime} mins</span>
            <span className="text-[9px] text-neutral-400 dark:text-neutral-500 block mt-1 font-mono">Real-time loops sync</span>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 shadow-sm text-neutral-800 dark:text-white rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Active Volunteers */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-5 rounded-[24px] flex items-center justify-between shadow-sm transition-colors duration-300">
          <div>
            <span className="text-[10px] text-neutral-455 dark:text-neutral-400 uppercase font-mono block font-bold">Active Staff</span>
            <span className="text-2xl font-black text-neutral-800 dark:text-white font-display mt-0.5">{stadiumStats.activeStaff}</span>
            <span className="text-[9px] text-neutral-400 dark:text-neutral-500 block mt-1 font-mono">14 Squads active</span>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 shadow-sm text-neutral-800 dark:text-white rounded-2xl">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-5 rounded-[24px] flex items-center justify-between shadow-sm transition-colors duration-300">
          <div>
            <span className="text-[10px] text-neutral-455 dark:text-neutral-400 uppercase font-mono block font-bold">Incidents Active</span>
            <span className={`text-2xl font-black font-display mt-0.5 ${stadiumStats.activeAlerts > 0 ? 'text-red-500' : 'text-neutral-850 dark:text-white'}`}>
              {stadiumStats.activeAlerts}
            </span>
            <span className="text-[9px] text-neutral-400 dark:text-neutral-500 block mt-1 font-mono">
              {stadiumStats.activeAlerts > 0 ? 'Urgent action pending' : 'All systems nominal'}
            </span>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 shadow-sm text-neutral-800 dark:text-white rounded-2xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Operational Insight Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-4 border-b border-neutral-100 dark:border-neutral-850 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-neutral-850 dark:text-white animate-pulse" />
              <h3 className="text-sm font-bold tracking-wider text-neutral-450 dark:text-neutral-400 uppercase font-mono">AI Operational Feed</h3>
            </div>
            <span className="bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-mono font-bold">
              Simulated Telemetry
            </span>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {operationalInsights.map((insight) => {
              const isAcked = acknowledgedInsights[insight.id];
              return (
                <div 
                  key={insight.id} 
                  className={`bg-neutral-50 dark:bg-neutral-900 border p-4 rounded-2xl transition-all duration-300 ${
                    isAcked ? 'border-neutral-100 dark:border-neutral-950 opacity-60' : 'border-neutral-150 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full font-mono ${
                          insight.type === 'system-alert' 
                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300' 
                            : 'bg-[#e2ff70] dark:bg-[#e2ff70]/10 text-black dark:text-[#e2ff70] border border-neutral-305 dark:border-[#e2ff70]'
                        }`}>
                          {insight.badge}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-450 dark:text-neutral-500">{insight.timestamp}</span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-white leading-normal">{insight.message}</h4>
                      <p className="text-[9px] text-neutral-500 dark:text-neutral-450 font-mono leading-relaxed">
                        <strong className="text-neutral-700 dark:text-neutral-350">REASONING:</strong> {insight.reason}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAcknowledge(insight.id)}
                      disabled={isAcked}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${
                        isAcked 
                          ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-100 dark:border-neutral-850 text-neutral-400 dark:text-neutral-600 cursor-default shadow-inner' 
                          : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-750 text-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer shadow-sm font-mono'
                      }`}
                    >
                      {isAcked ? <Check className="w-3.5 h-3.5" /> : <span className="text-[9px] uppercase font-mono px-1">Ack</span>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Simulation Commands */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex items-center space-x-2 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <Play className="w-4 h-4 text-neutral-850 dark:text-white" />
              <h3 className="text-sm font-bold tracking-wider text-neutral-400 uppercase font-mono">Volunteer Dispatch</h3>
            </div>

            <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-4 leading-relaxed font-sans">
              Preview a simulated volunteer allocation for bottlenecks flagged by the demo telemetry engine. This does not contact staff.
            </p>

            <div className="space-y-4">
              <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl space-y-3">
                <span className="text-[8px] font-mono text-neutral-405 dark:text-neutral-500 uppercase block font-bold">Active Bottleneck Task</span>
                <h4 className="text-xs font-bold text-neutral-800 dark:text-white uppercase font-sans">Redirect Gate 3 Queueing</h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal font-sans">
                  Dispatch a team of 10 stewards to physically divide traffic and open auxiliary Gate 5.
                </p>

                {staffDispatched ? (
                  <div className="bg-[#e2ff70] text-black border border-neutral-350 p-2.5 rounded-xl flex items-center space-x-2 text-xs font-bold shadow-sm animate-pulse">
                    <Check className="w-4 h-4 text-black" />
                    <span>Demo: Squads #4 and #6 would be assigned. Estimated arrival: 2m.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleDispatchStaff}
                    className="w-full bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 border border-neutral-900 dark:border-neutral-200 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer shadow-sm font-sans"
                  >
                    Simulate Staff Dispatch
                  </button>
                )}
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl flex items-center justify-between text-xs text-neutral-550 dark:text-neutral-400 font-mono">
                <span>Total Staff Allocated</span>
                <span className="text-neutral-850 dark:text-white font-bold">120 / 342 deployed</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl text-[9px] text-neutral-400 dark:text-neutral-500 leading-relaxed mt-4 font-mono">
            Demo boundary: this action records only a local simulation notification; it cannot reach staff devices.
          </div>
        </div>

      </div>
    </div>
  );
}
