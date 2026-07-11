import React, { useState, useEffect } from 'react';
import { Shield, Users, ArrowRight, Activity, Cpu } from 'lucide-react';

const steps = [
  "Initializing Neural Core...",
  "Connecting Stadium IoT Grid...",
  "Syncing Crowd Flow Sensors...",
  "FIFA Copilot 2026 Ready."
];

export default function LandingPage({ onEnter }) {
  const [loadingStep, setLoadingStep] = useState(0);
  const [viewMode, setViewMode] = useState('fan');

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 6000 / steps.length);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#121212] flex flex-col justify-between p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e2ff70] rounded-full blur-[120px] opacity-35 z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-neutral-300 rounded-full blur-[120px] opacity-25 z-0" />

      {/* Header */}
      <header className="z-10 flex justify-between items-center w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#121212] text-white flex items-center justify-center font-extrabold text-xl rounded-2xl tracking-tighter">
            F26
          </div>
          <div>
            <h2 className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase leading-none">FIFA World Cup</h2>
            <h1 className="text-base font-black tracking-tight leading-none text-[#121212] mt-0.5">COPILOT</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 bg-[#121212] text-white px-3 py-1.5 rounded-full text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#e2ff70] animate-pulse-live" />
          <span>Live Stadium Link</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="z-10 my-auto flex flex-col lg:flex-row items-center justify-between gap-12 max-w-7xl mx-auto w-full py-8">
        
        {/* Left Info Column */}
        <div className="flex-1 text-left space-y-6 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-[#e2ff70] text-[#121212] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Core v1.4 • Ready</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-[#121212] uppercase">
            Managing <br />
            <span className="bg-[#e2ff70] px-2 py-0.5 inline-block my-1 rounded-lg">Your Arena</span> <br />
            and Operations
          </h2>
          
          <p className="text-neutral-600 text-sm md:text-base font-normal leading-relaxed">
            Welcome to the future of tournament operations. FIFA Copilot integrates live IoT sensors, crowd analysis, transit tracking, and language-adaptive AI assistants to offer unified guidance for fans and organizers.
          </p>

          {/* Loading status bar */}
          <div className="space-y-2 bg-white border border-neutral-200 p-4 rounded-3xl font-mono text-xs max-w-md shadow-sm">
            <div className="flex justify-between text-neutral-500">
              <span>System Boot Status:</span>
              <span className="text-[#121212] font-bold">{Math.round(((loadingStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#121212] h-full transition-all duration-500 ease-out"
                style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="text-neutral-600 italic text-[11px] animate-pulse">
              &gt; {steps[loadingStep]}
            </div>
          </div>

          {/* Mode Selection */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setViewMode('fan')}
              className={`flex-1 flex items-center justify-between p-4 rounded-3xl border transition-all ${
                viewMode === 'fan' 
                  ? 'bg-[#e2ff70] text-[#121212] border-[#e2ff70] shadow-md font-bold' 
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3 text-left">
                <Users className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wide">Fan Portal</h3>
                  <p className={`text-[9px] ${viewMode === 'fan' ? 'text-neutral-700' : 'text-neutral-500'}`}>Wayfinding & Multilingual Assist</p>
                </div>
              </div>
              {viewMode === 'fan' && <div className="w-2 h-2 rounded-full bg-[#121212]" />}
            </button>

            <button
              onClick={() => setViewMode('ops')}
              className={`flex-1 flex items-center justify-between p-4 rounded-3xl border transition-all ${
                viewMode === 'ops' 
                  ? 'bg-[#e2ff70] text-[#121212] border-[#e2ff70] shadow-md font-bold' 
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3 text-left">
                <Shield className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wide">Staff Panel</h3>
                  <p className={`text-[9px] ${viewMode === 'ops' ? 'text-neutral-700' : 'text-neutral-500'}`}>AI Dispatch & Heatmaps</p>
                </div>
              </div>
              {viewMode === 'ops' && <div className="w-2 h-2 rounded-full bg-[#121212]" />}
            </button>
          </div>

          {/* Action Trigger */}
          <button
            onClick={() => onEnter(viewMode)}
            disabled={loadingStep < steps.length - 1}
            className={`w-full group relative flex items-center justify-center space-x-3 py-4 rounded-3xl font-bold tracking-wider uppercase transition-all duration-300 ${
              loadingStep < steps.length - 1 
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-300' 
                : 'bg-[#121212] text-white hover:bg-neutral-900 cursor-pointer shadow-md'
            }`}
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Right Stadium Illustration (Interactive SVG Concept) */}
        <div className="flex-1 flex justify-center items-center z-10 w-full max-w-md lg:max-w-xl">
          <div className="relative w-full aspect-square border border-neutral-200 rounded-[40px] flex items-center justify-center p-8 bg-white shadow-lg">
            {/* Pulsing rings */}
            <div className="absolute inset-4 border border-dashed border-neutral-200 rounded-[35px] animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-16 border border-neutral-100 rounded-full" />
            <div className="absolute inset-28 border border-dashed border-neutral-200 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
            
            {/* Center Stadium Graphic */}
            <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 text-neutral-300">
              {/* Outer shell */}
              <ellipse cx="50" cy="50" rx="45" ry="35" fill="none" stroke="currentColor" strokeWidth="0.75" />
              <ellipse cx="50" cy="50" rx="42" ry="32" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
              
              {/* Seating levels */}
              <ellipse cx="50" cy="50" rx="36" ry="26" fill="none" stroke="currentColor" strokeWidth="1" />
              <ellipse cx="50" cy="50" rx="30" ry="20" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 1" />
              
              {/* Pitch */}
              <rect x="36" y="38" width="28" height="24" rx="2" fill="none" stroke="#121212" strokeWidth="0.5" className="opacity-80" />
              <line x1="50" y1="38" x2="50" y2="62" stroke="#121212" strokeWidth="0.5" className="opacity-80" />
              <circle cx="50" cy="50" r="4" fill="none" stroke="#121212" strokeWidth="0.5" className="opacity-80" />

              {/* Glowing sensors */}
              <g className="text-[#121212]">
                <circle cx="20" cy="30" r="2" fill="currentColor" className="animate-pulse-live" />
                <circle cx="80" cy="70" r="2" fill="currentColor" className="animate-pulse-live" style={{ animationDelay: '0.4s' }} />
                <circle cx="50" cy="18" r="2" fill="currentColor" className="animate-pulse-live" style={{ animationDelay: '0.8s' }} />
                <circle cx="50" cy="82" r="2" fill="currentColor" className="animate-pulse-live" style={{ animationDelay: '1.2s' }} />
                <circle cx="15" cy="50" r="2" fill="currentColor" className="animate-pulse-live" style={{ animationDelay: '0.2s' }} />
                <circle cx="85" cy="50" r="2" fill="currentColor" className="animate-pulse-live" style={{ animationDelay: '0.6s' }} />
              </g>
            </svg>

            {/* Micro details overlay */}
            <div className="absolute top-6 left-6 font-mono text-[9px] text-neutral-400 uppercase tracking-widest">
              Grid status: Online
            </div>
            <div className="absolute bottom-6 right-6 font-mono text-[9px] text-neutral-400 uppercase tracking-widest">
              HARD_ROCK_STAD
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 w-full flex flex-col md:flex-row justify-between items-center text-xs text-neutral-400 gap-4 mt-8">
        <div>
          © 2026 FIFA Operations. Submitted for "Smart Stadiums & Tournament Operations" Challenge.
        </div>
        <div className="flex space-x-6">
          <span className="flex items-center"><Shield className="w-3.5 h-3.5 mr-1" /> Secure Core</span>
          <span className="flex items-center"><Activity className="w-3.5 h-3.5 mr-1" /> 99.98% Telemetry SLA</span>
        </div>
      </footer>
    </div>
  );
}
