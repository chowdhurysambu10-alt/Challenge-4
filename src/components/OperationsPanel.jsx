import React, { useState } from 'react';
import { Users, Clock, ShieldCheck, UserCheck, Sparkles, Check, Leaf, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function OperationsPanel({ stadiumStats, operationalInsights, dispatchStaff }) {
  const [acknowledgedInsights, setAcknowledgedInsights] = useState({});
  const [staffDispatched, setStaffDispatched] = useState(false);
  const [incidentDispatched, setIncidentDispatched] = useState({});

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

  const handleIncidentDispatch = (id) => {
    setIncidentDispatched(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setIncidentDispatched(prev => ({ ...prev, [id]: false }));
    }, 4000);
  };

  // Occupancy forecasting chart dataset
  const occupancyForecast = [
    { time: 'T-90m', occupancy: 24200, capacity: 72000 },
    { time: 'T-60m', occupancy: 42800, capacity: 72000 },
    { time: 'T-30m', occupancy: 61500, capacity: 72000 },
    { time: 'T-10m', occupancy: 68900, capacity: 72000 },
    { time: 'Kickoff', occupancy: 70800, capacity: 72000 },
    { time: 'HalfTime', occupancy: 71200, capacity: 72000 },
    { time: 'FullTime', occupancy: 65400, capacity: 72000 }
  ];

  // Dynamic Sustainability calculations
  const calculateEmissions = () => {
    const activeCheckedIn = stadiumStats.totalCheckedIn;
    // Estimate kg CO2 based on checked-in count and a base rate
    const gridEmissions = (activeCheckedIn * 0.004).toFixed(1);
    const transportOffset = ((activeCheckedIn * 0.65) * 0.002).toFixed(1); // 65% public transit offset
    const solarGen = 45.2; // kW offset from stadium panels
    const netEmissions = Math.max(0, parseFloat(gridEmissions) - parseFloat(transportOffset) - solarGen).toFixed(1);
    return { gridEmissions, transportOffset, netEmissions };
  };

  const emissions = calculateEmissions();

  // Simulated AI sensor incident detections
  const activeSensors = [
    { id: 'sens-1', name: 'Zone B East Turnstiles', issue: 'Flow Rate Bottleneck (&gt;45/min)', type: 'crush', severity: 'moderate' },
    { id: 'sens-2', name: 'Stand Sector 114', issue: 'Noise threshold warning (&gt;118dB)', type: 'audio', severity: 'low' },
    { id: 'sens-3', name: 'Concourse Area C', issue: 'Thermal variance anomaly detected', type: 'fire', severity: 'high' }
  ];

  return (
    <div className="space-y-6 fade-in font-sans">
      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Fans checked in */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-5 rounded-[24px] flex items-center justify-between shadow-sm transition-colors duration-300">
          <div>
            <span className="text-[10px] text-neutral-450 dark:text-neutral-400 uppercase font-mono block font-bold">Checked In Fans</span>
            <span className="text-2xl font-black text-neutral-850 dark:text-white font-display mt-0.5">
              {stadiumStats.totalCheckedIn.toLocaleString()} 
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-normal font-mono"> / {stadiumStats.capacity.toLocaleString()}</span>
            </span>
            <div className="w-24 bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-black dark:bg-[#e2ff70] h-full rounded-full"
                style={{ width: `${(stadiumStats.totalCheckedIn / stadiumStats.capacity) * 100}%` }}
              />
            </div>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 shadow-sm text-neutral-800 dark:text-white rounded-2xl">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

        {/* Avg Wait Time */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-5 rounded-[24px] flex items-center justify-between shadow-sm transition-colors duration-300">
          <div>
            <span className="text-[10px] text-neutral-450 dark:text-neutral-400 uppercase font-mono block font-bold">Avg Gate Wait</span>
            <span className="text-2xl font-black text-neutral-850 dark:text-white font-display mt-0.5">{stadiumStats.avgWaitTime} mins</span>
            <span className="text-[9px] text-neutral-400 dark:text-neutral-500 block mt-1 font-mono">Real-time loops sync</span>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 shadow-sm text-neutral-800 dark:text-white rounded-2xl">
            <Clock className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

        {/* Active Volunteers */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-5 rounded-[24px] flex items-center justify-between shadow-sm transition-colors duration-300">
          <div>
            <span className="text-[10px] text-neutral-450 dark:text-neutral-400 uppercase font-mono block font-bold">Active Staff</span>
            <span className="text-2xl font-black text-neutral-850 dark:text-white font-display mt-0.5">{stadiumStats.activeStaff}</span>
            <span className="text-[9px] text-neutral-400 dark:text-neutral-500 block mt-1 font-mono">Real-time dispatches</span>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 shadow-sm text-neutral-800 dark:text-white rounded-2xl">
            <UserCheck className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-5 rounded-[24px] flex items-center justify-between shadow-sm transition-colors duration-300">
          <div>
            <span className="text-[10px] text-neutral-450 dark:text-neutral-400 uppercase font-mono block font-bold">Incidents Active</span>
            <span className={`text-2xl font-black font-display mt-0.5 ${stadiumStats.activeAlerts > 0 ? 'text-red-500' : 'text-neutral-800 dark:text-white'}`}>
              {stadiumStats.activeAlerts}
            </span>
            <span className="text-[9px] text-neutral-400 dark:text-neutral-500 block mt-1 font-mono">
              {stadiumStats.activeAlerts > 0 ? 'Dispatcher intervention' : 'All systems nominal'}
            </span>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 shadow-sm text-neutral-800 dark:text-white rounded-2xl">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

      </div>

      {/* Main Grid: Forecasts and Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stadium Occupancy Forecast area chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-mono">Predictions Model</h3>
              <h2 className="text-base font-black text-neutral-850 dark:text-white uppercase">Hourly Occupancy Curve</h2>
            </div>
            <span className="text-[9px] font-mono font-bold bg-[#e2ff70] text-black px-2 py-0.5 rounded-full">
              Live vs Forecast
            </span>
          </div>

          <div className="h-64 w-full font-mono text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyForecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e2ff70" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#e2ff70" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" darkStroke="#1f1f1f" vertical={false} />
                <XAxis dataKey="time" stroke="#a3a3a3" axisLine={false} tickLine={false} />
                <YAxis stroke="#a3a3a3" axisLine={false} tickLine={false} domain={[0, 75000]} unit="k" tickFormatter={(v) => `${(v/1000).toFixed(0)}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                  labelStyle={{ color: '#121212', fontWeight: 'bold' }}
                  itemStyle={{ color: '#121212' }}
                  formatter={(value) => [`${value} Fans`, 'Occupancy']}
                />
                <Area type="monotone" dataKey="occupancy" stroke="#121212" darkStroke="#e2ff70" strokeWidth={2} fillOpacity={1} fill="url(#colorForecast)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI-Powered Incident Detection console */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-neutral-850 dark:text-white" />
                <h3 className="text-sm font-bold tracking-wider text-neutral-450 dark:text-neutral-400 uppercase font-mono">Sensors Detections</h3>
              </div>
              <span className="w-2.5 h-2.5 bg-[#e2ff70] rounded-full animate-ping" />
            </div>

            <div className="space-y-3">
              {activeSensors.map((sensor) => {
                const dispatched = incidentDispatched[sensor.id];
                return (
                  <div key={sensor.id} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 p-3 rounded-2xl flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                          sensor.severity === 'high' ? 'bg-red-500 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-350'
                        }`}>
                          {sensor.severity}
                        </span>
                        <h4 className="font-mono text-[10px] text-neutral-800 dark:text-white font-bold mt-1.5">{sensor.name}</h4>
                      </div>
                      <span className="text-[9px] text-red-500 font-mono font-bold uppercase">{sensor.type}</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 leading-normal italic">"{sensor.issue}"</p>

                    <button
                      onClick={() => handleIncidentDispatch(sensor.id)}
                      disabled={dispatched}
                      className={`w-full py-1.5 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider transition-all mt-3 border flex items-center justify-center space-x-1.5 ${
                        dispatched 
                          ? 'bg-[#e2ff70] text-black border-[#e2ff70] cursor-default' 
                          : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white border-neutral-200 dark:border-neutral-750 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer'
                      }`}
                    >
                      {dispatched ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Squads Dispatched</span>
                        </>
                      ) : (
                        <span>Deploy Response Squads</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Operations logs and Sustainability Carbon footprint tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Operational Insight Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-4 border-b border-neutral-100 dark:border-neutral-850 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-neutral-850 dark:text-white animate-pulse" />
              <h3 className="text-sm font-bold tracking-wider text-neutral-450 dark:text-neutral-400 uppercase font-mono">AI Operational Feed</h3>
            </div>
            <span className="bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-mono font-bold">
              Telemetry Stream
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
                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-350' 
                            : 'bg-[#e2ff70] dark:bg-[#e2ff70]/10 text-black dark:text-[#e2ff70] border border-neutral-305 dark:border-[#e2ff70]'
                        }`}>
                          {insight.badge}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-450 dark:text-neutral-500">{insight.timestamp}</span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-white leading-normal">{insight.message}</h4>
                      <p className="text-[9px] text-neutral-500 dark:text-neutral-450 font-mono leading-relaxed">
                        <strong className="text-neutral-700 dark:text-neutral-350">BASIS:</strong> {insight.reason}
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

        {/* Sustainability and Volunteer Dispatch Column */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Sustainability Dashboard / Carbon footprint Cockpit */}
          <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div>
              <div className="flex items-center space-x-2 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <Leaf className="w-5 h-5 text-neutral-805 dark:text-white" />
                <h3 className="text-sm font-bold tracking-wider text-neutral-400 uppercase font-mono">Sustainability Cockpit</h3>
              </div>

              <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-4 leading-relaxed">
                Real-time monitoring of energy consumption, green transit metrics, and solar offset contributions.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-neutral-500">Grid Power Draw</span>
                  <span className="font-bold text-neutral-800 dark:text-white">{emissions.gridEmissions} kg CO2e/min</span>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-neutral-500">Transit Offset (65%)</span>
                  <span className="font-bold text-green-500">-{emissions.transportOffset} kg CO2e/min</span>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-neutral-500">Solar Roof Production</span>
                  <span className="font-bold text-green-500">-45.2 kg CO2e/min</span>
                </div>
                <div className="bg-[#e2ff70]/30 dark:bg-[#e2ff70]/10 border border-dashed border-[#8da800] dark:border-[#e2ff70] p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-neutral-850 dark:text-neutral-350 font-bold uppercase text-[10px]">Net Carbon Index</span>
                  <span className="font-black text-sm text-neutral-900 dark:text-white">{emissions.netEmissions} kg CO2e</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl text-[9px] text-neutral-400 dark:text-neutral-550 leading-relaxed mt-4 font-mono">
              Solar roofing offset calculated relative to Hard Rock Arena PV array output.
            </div>
          </div>

          {/* Volunteer Dispatch Dashboard */}
          <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div>
              <div className="flex items-center space-x-2 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <UserCheck className="w-5 h-5 text-neutral-855 dark:text-white" />
                <h3 className="text-sm font-bold tracking-wider text-neutral-400 uppercase font-mono">Volunteer Dispatch</h3>
              </div>

              <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-4 leading-relaxed font-sans">
                Deploy logistics and response volunteers instantly to bottlenecks flagged by the AI telemetry engine.
              </p>

              <div className="space-y-4">
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-4 rounded-2xl space-y-3">
                  <span className="text-[8px] font-mono text-neutral-400 dark:text-neutral-500 uppercase block font-bold">Active Bottleneck Task</span>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-white uppercase font-sans">Redirect Gate 3 Queueing</h4>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal font-sans">
                    Dispatch a team of 10 stewards to physically divide traffic and open auxiliary Gate 5.
                  </p>

                  {staffDispatched ? (
                    <div className="bg-[#e2ff70] text-black border border-neutral-350 p-2.5 rounded-xl flex items-center space-x-2 text-xs font-bold shadow-sm animate-pulse">
                      <Check className="w-4 h-4 text-black" />
                      <span>Squads #4 and #6 are en-route. ETA: 2m.</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleDispatchStaff}
                      className="w-full bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 border border-neutral-900 dark:border-neutral-200 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer shadow-sm font-sans"
                    >
                      Deploy Staff Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
