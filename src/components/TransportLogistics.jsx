import React from 'react';
import { Car, Cloud, Navigation, Train, Wind, Sun, Clock } from 'lucide-react';

export default function TransportLogistics({ parking, transit, weather }) {
  
  const getTrafficStatus = () => {
    const avgParking = parking.reduce((acc, p) => acc + p.filled, 0) / parking.length;
    if (avgParking > 85) return { label: "SEVERE CONGESTION", color: "bg-[#121212] dark:bg-white text-white dark:text-black border-neutral-900 dark:border-neutral-200", speed: "12 km/h" };
    if (avgParking > 65) return { label: "MODERATE TRAFFIC", color: "bg-[#e2ff70] text-black border-neutral-300 dark:border-neutral-700", speed: "28 km/h" };
    return { label: "FREE FLOWING", color: "bg-white dark:bg-neutral-800 text-black dark:text-white border-neutral-200 dark:border-neutral-750", speed: "48 km/h" };
  };

  const traffic = getTrafficStatus();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
      
      {/* Parking Lot Status */}
      <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] flex flex-col justify-between shadow-sm transition-colors duration-300">
        <div>
          <div className="flex justify-between items-center mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-neutral-800 dark:text-white" />
              <h3 className="text-sm font-bold tracking-wider text-neutral-400 uppercase font-mono">Parking Allocations</h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 font-bold bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-full">
              4 Lots Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parking.map((lot) => (
              <div key={lot.id} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-neutral-800 dark:text-white uppercase">{lot.name}</h4>
                    <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-450">{lot.type}</span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    lot.filled > 90 ? 'bg-[#121212] dark:bg-white text-white dark:text-black border-black dark:border-neutral-200' : 'bg-[#e2ff70] text-black border-neutral-350 dark:border-neutral-600'
                  }`}>
                    {lot.rate}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span className="text-neutral-500">Filled percentage</span>
                    <span className="text-neutral-850 dark:text-neutral-200">{lot.filled}%</span>
                  </div>
                  <div className="w-full bg-neutral-250 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#121212] dark:bg-[#e2ff70] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${lot.filled}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[9px] text-neutral-400 dark:text-neutral-500 pt-1 border-t border-neutral-100 dark:border-neutral-800 font-mono">
                  <span>Cap: 2,500 slots</span>
                  <span>Exit queue: {lot.filled > 90 ? '25m' : '5m'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Indicator */}
        <div className="mt-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-sm text-neutral-800 dark:text-white rounded-xl">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-800 dark:text-white uppercase">Stadium Perimeter Traffic</h4>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-450 leading-tight">External ring roadways sensors</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end md:self-auto">
            <div className="text-right">
              <span className="text-[9px] text-neutral-455 block font-mono">Speed Average</span>
              <span className="text-xs font-mono font-bold text-neutral-800 dark:text-white">{traffic.speed}</span>
            </div>
            <span className={`text-[9px] font-mono font-bold px-3 py-1 rounded-full border ${traffic.color} shadow-sm`}>
              {traffic.label}
            </span>
          </div>
        </div>
      </div>

      {/* Transit Board & Weather Widget */}
      <div className="space-y-6">
        
        {/* Transit Board */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <Train className="w-5 h-5 text-neutral-800 dark:text-white" />
              <h3 className="text-sm font-bold tracking-wider text-neutral-400 uppercase font-mono">Transit Board</h3>
            </div>
            <Clock className="w-3.5 h-3.5 text-neutral-450" />
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-150 dark:divide-neutral-800 font-mono shadow-sm">
            {transit.map((t) => (
              <div key={t.id} className="p-3.5 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-2 h-2 rounded-full ${
                    t.arrivalIn <= 2 ? 'bg-[#121212] dark:bg-white animate-pulse-live' : 'bg-neutral-350 dark:bg-neutral-700'
                  }`} />
                  <div>
                    <span className="text-neutral-800 dark:text-white font-bold block leading-tight">{t.name}</span>
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500">Freq: {t.frequency}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="bg-[#121212] dark:bg-white text-white dark:text-black px-2.5 py-1 rounded-full font-extrabold text-[11px] inline-block font-mono">
                    {t.arrivalIn} <span className="text-[8px] font-normal text-neutral-300 dark:text-neutral-600 uppercase">min</span>
                  </span>
                  <span className="text-[8px] text-neutral-500 dark:text-neutral-450 uppercase tracking-widest block mt-0.5">{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Widget */}
        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-850 p-6 rounded-[32px] shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold tracking-wider text-neutral-400 uppercase font-mono">Arena Climate</h3>
            <Cloud className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Sun className="w-8 h-8 text-neutral-700 dark:text-neutral-300 animate-[spin_45s_linear_infinite]" />
              <div>
                <span className="text-2xl font-black text-neutral-850 dark:text-white font-display leading-none">
                  {weather.tempC}°C <span className="text-neutral-400 dark:text-neutral-500 text-xs font-normal font-mono">/ {weather.tempF}°F</span>
                </span>
                <span className="text-[9px] text-neutral-500 dark:text-neutral-400 font-bold block uppercase mt-0.5 font-mono">{weather.condition}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-right">
              <div>
                <span className="text-[8px] text-neutral-455 block font-mono">Humidity</span>
                <span className="text-xs font-mono font-bold text-neutral-800 dark:text-white">{weather.humidity}%</span>
              </div>
              <div>
                <span className="text-[8px] text-neutral-455 block font-mono">Wind</span>
                <span className="text-xs font-mono font-bold text-neutral-800 dark:text-white flex items-center justify-end">
                  <Wind className="w-3 h-3 mr-0.5 text-neutral-500" /> {weather.windKmh} <span className="text-[8px] ml-0.5">k/h</span>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
