import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Sparkles, Volume2 } from 'lucide-react';

export default function CrowdDashboard({ gates, zones, operationalInsights, triggerBroadcastRedirect }) {
  const [broadcastSentId, setBroadcastSentId] = useState(null);

  // Forecast data
  const surgeData = [
    { name: '+10m', predictedFans: 69500, loadFactor: 72 },
    { name: '+20m', predictedFans: 70850, loadFactor: 85 },
    { name: '+30m', predictedFans: 71500, loadFactor: 87 },
    { name: '+40m', predictedFans: 72000, loadFactor: 64 },
    { name: '+50m', predictedFans: 71200, loadFactor: 80 },
    { name: '+60m', predictedFans: 68500, loadFactor: 74 }
  ];

  const handleBroadcast = (id) => {
    setBroadcastSentId(id);
    triggerBroadcastRedirect();
    setTimeout(() => {
      setBroadcastSentId(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Upper Grid: Heat Levels & AI Dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Zone Heat levels styled like screenshot */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-mono">Sensors</h3>
              <h2 className="text-base font-black text-neutral-850 dark:text-white uppercase">Live Stand Occupancy</h2>
            </div>
            <span className="text-[9px] font-mono font-bold bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 px-2 py-1 rounded-full">
              4 Zones Connected
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {zones.map((zone) => {
              const isHighlighted = zone.id === 'B';

              return (
                <div 
                  key={zone.id} 
                  className={`border p-4 rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                    isHighlighted 
                      ? 'bg-[#e2ff70] border-[#e2ff70] text-[#121212] shadow' 
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-white hover:border-neutral-400 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold">{zone.id}</span>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      isHighlighted 
                        ? 'bg-[#121212] text-[#e2ff70]' 
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {zone.density} / 100
                    </span>
                  </div>
                  
                  <div className="my-2 text-center">
                    <span className="text-3xl font-black tracking-tight font-display">{zone.density}%</span>
                    <div className="flex space-x-1.5 justify-center mt-3">
                      {Array.from({ length: 6 }).map((_, idx) => {
                        const filled = idx < Math.round((zone.density / 100) * 6);
                        return (
                          <div
                            key={idx}
                            className={`w-3.5 h-7 rounded-full ${
                              filled 
                                ? (isHighlighted ? 'bg-black' : 'bg-[#121212] dark:bg-white') 
                                : 'bg-transparent border border-dashed border-neutral-300 dark:border-neutral-700'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className={`text-[9px] font-mono font-bold text-center truncate ${
                    isHighlighted ? 'text-neutral-700' : 'text-neutral-400 dark:text-neutral-500'
                  }`}>
                    {zone.name.split(' (')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Load Balancing Action */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex items-center space-x-1.5 mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <Sparkles className="w-4 h-4 text-neutral-750 dark:text-neutral-400" />
              <h3 className="text-xs font-bold tracking-wider text-neutral-400 uppercase font-mono">Load Optimizer</h3>
            </div>
            
            {operationalInsights.filter(i => i.type === 'ai-suggestion').slice(0, 1).map((insight) => (
              <div key={insight.id} className="space-y-4">
                <div className="bg-[#121212] dark:bg-white text-white dark:text-black p-4 rounded-2xl space-y-2.5 border dark:border-neutral-200">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold uppercase tracking-widest bg-[#e2ff70] dark:bg-black text-black dark:text-white px-2 py-0.5 rounded-full font-mono">
                      {insight.badge}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500">{insight.timestamp}</span>
                  </div>
                  <p className="text-xs font-bold leading-normal">{insight.message}</p>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl text-[10px] font-mono text-neutral-500 leading-normal">
                  <strong className="text-neutral-800 dark:text-neutral-350">REASONING:</strong> {insight.reason}
                </div>

                <button
                  onClick={() => handleBroadcast(insight.id)}
                  disabled={broadcastSentId === insight.id}
                  className={`w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border shadow-sm ${
                    broadcastSentId === insight.id 
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 border-neutral-200 dark:border-neutral-850 cursor-default shadow-inner' 
                      : 'bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 border-neutral-900 dark:border-neutral-200 cursor-pointer'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{broadcastSentId === insight.id ? 'Broadcast Sent!' : 'Dispatch Broadcast'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Grid: Congestion Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gate wait times Bar Chart */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-mono">Live Congestion</h3>
              <h2 className="text-base font-black text-neutral-850 dark:text-white uppercase">Wait Times per Gate</h2>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono font-bold bg-[#e2ff70] text-black px-2 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700">
              <span>Wait Times (mins)</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gates} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="splitBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#121212" />
                    <stop offset="50%" stopColor="#121212" />
                    <stop offset="50%" stopColor="#e2ff70" />
                    <stop offset="100%" stopColor="#e2ff70" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" darkStroke="#1f1f1f" vertical={false} />
                <XAxis 
                  dataKey="id" 
                  tickFormatter={(val) => `G${val}`} 
                  stroke="#a3a3a3" 
                  fontSize={10} 
                  fontFamily="monospace"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#a3a3a3" 
                  fontSize={10} 
                  fontFamily="monospace"
                  axisLine={false}
                  tickLine={false}
                  unit="m"
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                  labelStyle={{ color: '#121212', fontFamily: 'monospace', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#121212', fontSize: '12px' }}
                  formatter={(value) => [`${value} minutes`, 'Wait Time']}
                  labelFormatter={(label) => `Gate ${label}`}
                />
                <Bar 
                  dataKey="waitTime" 
                  fill="url(#splitBar)" 
                  radius={[12, 12, 12, 12]} 
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictive Surge Line Chart */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-mono">Surge Forecast</h3>
              <h2 className="text-base font-black text-neutral-850 dark:text-white uppercase">Pre-Game Loading Factor</h2>
            </div>
            <span className="flex items-center text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-full text-neutral-500 dark:text-neutral-400">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-neutral-705" /> AI Forecast
            </span>
          </div>

          <div className="h-64 w-full font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={surgeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" darkStroke="#1f1f1f" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#a3a3a3" 
                  fontSize={10} 
                  fontFamily="monospace"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#a3a3a3" 
                  fontSize={10} 
                  fontFamily="monospace"
                  axisLine={false}
                  tickLine={false}
                  domain={[50, 100]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                  labelStyle={{ color: '#121212', fontFamily: 'monospace', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#121212', fontSize: '12px' }}
                  formatter={(value) => [`${value}% Capacity`, 'Predicted Surge']}
                />
                <Line 
                  type="monotone" 
                  dataKey="loadFactor" 
                  stroke="#121212" 
                  strokeWidth={3} 
                  dot={{ r: 4, stroke: '#121212', strokeWidth: 2, fill: '#e2ff70' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
