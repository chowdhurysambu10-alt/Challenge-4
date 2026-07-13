import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, Activity, Cpu, AlertCircle } from 'lucide-react';
import { useStadium } from '../context/StadiumContext';

const steps = [
  "Initializing Neural Core...",
  "Connecting Stadium IoT Grid...",
  "Syncing Crowd Flow Sensors...",
  "FIFA Copilot 2026 Ready."
];

export default function LandingPage() {
  const { login } = useStadium();
  const [loadingStep, setLoadingStep] = useState(0);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 4000 / steps.length);
    return () => clearInterval(timer);
  }, []);

  const handleLaunchCommandCenter = async () => {
    setAuthError(null);
    setIsAuthenticating(true);

    // Auto-authenticate as Admin in the background to preserve backend JWT authorization
    const result = await login('admin@fifa.com', 'admin123');
    setIsAuthenticating(false);
    if (!result.success) {
      setAuthError('Connection failure: ' + result.error);
    }
  };

  const isBooted = loadingStep === steps.length - 1;

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
          <span>Live Operations Link</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="z-10 my-auto flex flex-col lg:flex-row items-center justify-between gap-12 max-w-7xl mx-auto w-full py-8">
        
        {/* Left Info Column */}
        <div className="flex-1 text-left space-y-6 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-[#e2ff70] text-[#121212] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Core v1.5 • Online</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-[#121212] uppercase">
            Managing <br />
            <span className="bg-[#e2ff70] px-2 py-0.5 inline-block my-1 rounded-lg">Your Arena</span> <br />
            and Operations
          </h2>
          
          <p className="text-neutral-600 text-sm md:text-base font-normal leading-relaxed">
            Welcome to the future of tournament operations. FIFA Copilot integrates live relational schemas, WebSocket state updates, wayfinding mapping, and role-restricted security for fans, staff, and admin teams.
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
        </div>

        {/* Right Click-to-Launch Panel */}
        <div className="flex-1 flex justify-center items-center z-10 w-full max-w-md">
          {isBooted ? (
            <div className="w-full bg-white border border-neutral-200 rounded-[36px] p-8 shadow-xl flex flex-col space-y-6 text-center transition-all duration-300">
              <div>
                <h3 className="text-lg font-black uppercase text-neutral-850">Ready to Launch</h3>
                <p className="text-neutral-450 text-xs mt-1 leading-none font-mono">Operations Command Center</p>
              </div>

              {authError && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl flex items-center justify-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <p className="text-xs text-neutral-500 font-mono">
                Clicking launch will establish a secure JWT-authorized WebSocket connection to the stadium telemetry core.
              </p>

              <button
                onClick={handleLaunchCommandCenter}
                disabled={isAuthenticating}
                className="w-full py-4 bg-[#121212] hover:bg-neutral-900 text-white rounded-2xl font-bold uppercase text-xs tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isAuthenticating ? 'Authorizing Secure Link...' : 'Launch Command Center'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-full aspect-square border border-neutral-200 rounded-[40px] flex items-center justify-center p-8 bg-white shadow-lg relative">
              <div className="absolute inset-4 border border-dashed border-neutral-200 rounded-[35px] animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-16 border border-neutral-100 rounded-full" />
              
              <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 text-neutral-300">
                <ellipse cx="50" cy="50" rx="45" ry="35" fill="none" stroke="currentColor" strokeWidth="0.75" />
                <rect x="36" y="38" width="28" height="24" rx="2" fill="none" stroke="#121212" strokeWidth="0.5" className="opacity-80" />
                <circle cx="50" cy="50" r="4" fill="none" stroke="#121212" strokeWidth="0.5" className="opacity-80" />
              </svg>
              <div className="absolute bottom-6 right-6 font-mono text-[9px] text-neutral-400 uppercase tracking-widest">
                System Loading
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 w-full flex flex-col md:flex-row justify-between items-center text-xs text-neutral-400 gap-4 mt-8">
        <div>
          © 2026 FIFA Copilot. Smart Stadium Operations.
        </div>
        <div className="flex space-x-6">
          <span className="flex items-center"><Shield className="w-3.5 h-3.5 mr-1" /> Secure JWT Channel</span>
          <span className="flex items-center"><Activity className="w-3.5 h-3.5 mr-1" /> Live WebSocket Telemetry</span>
        </div>
      </footer>
    </div>
  );
}
