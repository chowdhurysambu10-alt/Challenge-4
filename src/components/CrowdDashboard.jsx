import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  LineChart, Line, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, Sparkles, Volume2, Activity, BarChart3 } from 'lucide-react';
import { useStadium } from '../context/StadiumContext';

const SURGE_DATA = [
  { name: '+10m', predictedFans: 69500, loadFactor: 72 },
  { name: '+20m', predictedFans: 70850, loadFactor: 85 },
  { name: '+30m', predictedFans: 71500, loadFactor: 87 },
  { name: '+40m', predictedFans: 72000, loadFactor: 64 },
  { name: '+50m', predictedFans: 71200, loadFactor: 80 },
  { name: '+60m', predictedFans: 68500, loadFactor: 74 }
];

const ANALYTICS_CROWD_TIMELINE = [
  { time: '12:00', ZoneA: 40, ZoneB: 50, ZoneC: 30, ZoneD: 45 },
  { time: '12:30', ZoneA: 45, ZoneB: 60, ZoneC: 38, ZoneD: 48 },
  { time: '13:00', ZoneA: 55, ZoneB: 72, ZoneC: 45, ZoneD: 58 },
  { time: '13:30', ZoneA: 65, ZoneB: 85, ZoneC: 50, ZoneD: 62 },
  { time: '14:00', ZoneA: 72, ZoneB: 89, ZoneC: 58, ZoneD: 68 },
  { time: '14:30', ZoneA: 80, ZoneB: 92, ZoneC: 62, ZoneD: 75 }
];

const ANALYTICS_INCIDENTS = [
  { time: '12:00', count: 0 },
  { time: '12:30', count: 1 },
  { time: '13:00', count: 0 },
  { time: '13:30', count: 2 },
  { time: '14:00', count: 1 },
  { time: '14:30', count: 4 }
];

const PIE_COLORS = ['#121212', '#e2ff70', '#5b21b6', '#0369a1', '#15803d', '#7c2d12'];

const CHART_MARGIN_BAR = { top: 10, right: 10, left: -20, bottom: 0 };
const CHART_MARGIN_LINE = { top: 10, right: 10, left: -15, bottom: 0 };
const TOOLTIP_CONTENT_STYLE = { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' };
const TOOLTIP_LABEL_STYLE = { color: '#121212', fontFamily: 'monospace', fontSize: '10px', fontWeight: 'bold' };
const TOOLTIP_ITEM_STYLE = { color: '#121212', fontSize: '12px' };

export default function CrowdDashboard({ gates, zones, operationalInsights, triggerBroadcastRedirect }) {
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'analytics'
  const [broadcastSentId, setBroadcastSentId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const { token, highContrast } = useStadium();

  // Fetch real database-logged analytics from server
  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Failed to load analytics: ", err);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, fetchAnalytics]);

  const handleBroadcast = useCallback((id) => {
    setBroadcastSentId(id);
    triggerBroadcastRedirect();
    setTimeout(() => {
      setBroadcastSentId(null);
    }, 3000);
  }, [triggerBroadcastRedirect]);

  // Aggregate simulated gate check-ins for Analytics
  const gateCheckinsData = useMemo(() => {
    return gates.map(g => ({
      name: `Gate ${g.id}`,
      checkedIn: g.id * 1250 + g.waitTime * 40
    }));
  }, [gates]);

  // Translate database AI usage logs to Recharts format
  const aiIntentChartData = useMemo(() => {
    if (!analyticsData || !analyticsData.aiUsage) {
      return [
        { name: 'Wayfinding', value: 45 },
        { name: 'Concessions', value: 25 },
        { name: 'Schedules', value: 15 },
        { name: 'Safety', value: 10 },
        { name: 'General', value: 5 }
      ];
    }

    const counts = {};
    analyticsData.aiUsage.forEach(log => {
      counts[log.intent] = (counts[log.intent] || 0) + 1;
    });

    return Object.entries(counts).map(([intent, count]) => ({
      name: intent,
      value: count
    }));
  }, [analyticsData]);

  return (
    <div className="space-y-6 fade-in">
      
      {/* Subtab Navigation Switcher */}
      <div className="flex justify-between items-center bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-4 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-base font-black text-neutral-850 dark:text-white uppercase leading-none">Crowd Management</h2>
          <p className="text-[10px] text-neutral-400 font-mono mt-1 uppercase">Steward dispatches & IoT analytics</p>
        </div>
        
        <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-full border border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-full uppercase font-mono text-[9px] tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'live'
                ? 'bg-[#121212] dark:bg-white text-white dark:text-black font-bold shadow-sm'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Telemetry</span>
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-full uppercase font-mono text-[9px] tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'analytics'
                ? 'bg-[#121212] dark:bg-white text-white dark:text-black font-bold shadow-sm'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Operations Analytics</span>
          </button>
        </div>
      </div>

      {activeTab === 'live' ? (
        <>
          {/* Upper Grid: Heat Levels & AI Dispatch */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Zone Heat levels */}
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
                        highContrast
                          ? 'bg-white dark:bg-black border-4 border-black dark:border-white text-black dark:text-white font-extrabold shadow'
                          : isHighlighted 
                            ? 'bg-[#e2ff70] border-[#e2ff70] text-[#121212] shadow' 
                            : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-white hover:border-neutral-400 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-bold">{zone.id}</span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                          highContrast
                            ? 'bg-black dark:bg-white text-white dark:text-black border border-neutral-300'
                            : isHighlighted 
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
                                    ? (highContrast ? 'bg-black dark:bg-white' : isHighlighted ? 'bg-black' : 'bg-[#121212] dark:bg-white') 
                                    : 'bg-transparent border border-dashed border-neutral-300 dark:border-neutral-700'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div className={`text-[9px] font-mono font-bold text-center truncate ${
                        highContrast
                          ? 'text-black dark:text-white'
                          : isHighlighted 
                            ? 'text-neutral-700' 
                            : 'text-neutral-400 dark:text-neutral-555'
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
                        <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-555">{insight.timestamp}</span>
                      </div>
                      <p className="text-xs font-bold leading-normal">{insight.message}</p>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl text-[10px] font-mono text-neutral-505 leading-normal text-left">
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

              <div className="h-64 w-full" role="img" aria-label={`Gate wait-time chart. ${gates.map((gate) => `Gate ${gate.id}: ${gate.waitTime} minutes`).join('. ')}.`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gates} margin={CHART_MARGIN_BAR}>
                    <defs>
                      <linearGradient id="splitBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#121212" />
                        <stop offset="50%" stopColor="#121212" />
                        <stop offset="50%" stopColor="#e2ff70" />
                        <stop offset="100%" stopColor="#e2ff70" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
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
                      contentStyle={TOOLTIP_CONTENT_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
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
                  <TrendingUp className="w-3.5 h-3.5 mr-1 text-[#121212] dark:text-[#e2ff70]" /> AI Forecast
                </span>
              </div>

              <div className="h-64 w-full font-mono" role="img" aria-label={`Predicted crowd-load chart. ${SURGE_DATA.map((point) => `${point.name}: ${point.loadFactor} percent`).join('. ')}.`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SURGE_DATA} margin={CHART_MARGIN_LINE}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
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
                      contentStyle={TOOLTIP_CONTENT_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      formatter={(value) => [`${value}%`, 'Load Factor']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="loadFactor" 
                      stroke="#121212" 
                      strokeWidth={3} 
                      dot={{ r: 4, stroke: '#e2ff70', strokeWidth: 2, fill: '#121212' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Analytics Tab Overhaul */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-300 text-left">
          
          {/* Chart 1: Crowd Density over Time (Line Chart) */}
          <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm">
            <h3 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-mono">Operations Timeline</h3>
            <h2 className="text-base font-black text-neutral-850 dark:text-white uppercase mb-4">Density check per Zone</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ANALYTICS_CROWD_TIMELINE} margin={CHART_MARGIN_LINE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                  <XAxis dataKey="time" stroke="#a3a3a3" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} />
                  <YAxis stroke="#a3a3a3" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} />
                  <Legend iconType="circle" fontSize={10} wrapperStyle={{ paddingTop: 10 }} />
                  <Line type="monotone" dataKey="ZoneA" stroke="#121212" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ZoneB" stroke="#e2ff70" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ZoneC" stroke="#5b21b6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ZoneD" stroke="#0369a1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Gate Traffic Distribution (Bar Chart) */}
          <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm">
            <h3 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-mono">Admission Metrics</h3>
            <h2 className="text-base font-black text-neutral-850 dark:text-white uppercase mb-4">Checked-in count per Gate</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gateCheckinsData} margin={CHART_MARGIN_BAR}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} />
                  <YAxis stroke="#a3a3a3" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} />
                  <Bar dataKey="checkedIn" fill="#121212" radius={[8, 8, 0, 0]} barSize={16}>
                    {gateCheckinsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#121212' : '#e2ff70'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Incident Log Count (Area Chart) */}
          <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm">
            <h3 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-mono">Incident Report Logs</h3>
            <h2 className="text-base font-black text-neutral-850 dark:text-white uppercase mb-4">Security Incident Frequency</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ANALYTICS_INCIDENTS} margin={CHART_MARGIN_LINE}>
                  <defs>
                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F87171" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                  <XAxis dataKey="time" stroke="#a3a3a3" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} />
                  <YAxis stroke="#a3a3a3" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} />
                  <Area type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorIncidents)" name="Incidents" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: AI Assistant Usage (Pie Chart) */}
          <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm">
            <h3 className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-mono">Gemini AI Intent</h3>
            <h2 className="text-base font-black text-neutral-850 dark:text-white uppercase mb-4">AI Assistant Topics</h2>
            <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-around">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aiIntentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {aiIntentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-1.5 text-xs font-mono font-bold max-w-[200px]">
                {aiIntentChartData.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span className="text-neutral-500">{entry.name}:</span>
                    <span className="text-neutral-850 dark:text-white">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
