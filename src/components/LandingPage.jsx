import React, { useState, useEffect } from 'react';
import { Shield, Users, ArrowRight, Activity, Cpu, Key, AlertCircle } from 'lucide-react';
import { useStadium } from '../context/StadiumContext';

const steps = [
  "Initializing Neural Core...",
  "Connecting Stadium IoT Grid...",
  "Syncing Crowd Flow Sensors...",
  "FIFA Copilot 2026 Ready."
];

export default function LandingPage() {
  const { login, googleLogin } = useStadium();
  const [loadingStep, setLoadingStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 4500 / steps.length);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError(null);
    setIsAuthenticating(true);

    const result = await login(email, password);
    setIsAuthenticating(false);
    if (!result.success) {
      setAuthError(result.error);
    }
  };

  const handleQuickSelect = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setAuthError(null);
  };

  const triggerGoogleLogin = async () => {
    setAuthError(null);
    setIsAuthenticating(true);
    
    // Simulate standard Google OAuth popup/token verification delay
    setTimeout(async () => {
      // Prompt user or default to fan role with google authentication
      const mockGoogleEmail = 'user.google@gmail.com';
      const mockGoogleName = 'Google Account Holder';
      
      const result = await googleLogin(mockGoogleEmail, mockGoogleName, 'fan');
      setIsAuthenticating(false);
      if (!result.success) {
        setAuthError(result.error);
      }
    }, 1200);
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
          <span>Live Stadium Link</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="z-10 my-auto flex flex-col lg:flex-row items-center justify-between gap-12 max-w-7xl mx-auto w-full py-8">
        
        {/* Left Info Column */}
        <div className="flex-1 text-left space-y-6 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-[#e2ff70] text-[#121212] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Core v1.5 • Ready</span>
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

        {/* Right Authentication Form Panel */}
        <div className="flex-1 flex justify-center items-center z-10 w-full max-w-md">
          {isBooted ? (
            <div className="w-full bg-white border border-neutral-200 rounded-[36px] p-8 shadow-xl flex flex-col space-y-5 transition-all duration-300">
              <div className="text-center">
                <h3 className="text-lg font-black uppercase text-neutral-850">Dashboard Login</h3>
                <p className="text-neutral-400 text-xs mt-1 leading-none font-mono">Role-Based Security Portal</p>
              </div>

              {authError && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl flex items-center space-x-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono ml-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@fifa.com"
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#e2ff70] text-sm"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono ml-2">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#e2ff70] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3.5 bg-[#121212] hover:bg-neutral-900 text-white rounded-2xl font-bold uppercase text-xs tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isAuthenticating ? 'Authorizing Session...' : 'Enter Command Center'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Google login simulator */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-neutral-200"></div>
                <span className="flex-shrink mx-3 text-neutral-400 text-[10px] font-mono uppercase">Or SSO authentication</span>
                <div className="flex-grow border-t border-neutral-200"></div>
              </div>

              <button
                onClick={triggerGoogleLogin}
                disabled={isAuthenticating}
                className="w-full py-3 border border-neutral-250 hover:bg-neutral-50 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.48-1.12 2.73-2.38 3.58v3h3.84c2.25-2.06 3.53-5.1 3.53-8.41Z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.84-3c-1.08.72-2.45 1.16-4.12 1.16-3.18 0-5.86-2.15-6.82-5.04H1.3v3.1A12 12 0 0 0 12 24Z"/>
                  <path fill="#FBBC05" d="M5.18 14.21A7.18 7.18 0 0 1 4.8 12c0-.77.13-1.53.38-2.25V6.65H1.3a11.96 11.96 0 0 0 0 10.66l3.88-3.1Z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.97 1.19 15.24 0 12 0 7.3 0 3.2 2.7 1.3 6.65l3.88 3.1C6.14 6.9 8.82 4.75 12 4.75Z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Quick Login Badge helpers */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <p className="text-[9px] font-mono text-neutral-400 uppercase text-center">Demo Quick-fill Accounts:</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  <button 
                    onClick={() => handleQuickSelect('fan@fifa.com', 'fan123')}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-[#e2ff70] rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center"
                  >
                    <Users className="w-3 h-3 mr-1" /> Fan (Diego)
                  </button>
                  <button 
                    onClick={() => handleQuickSelect('staff@fifa.com', 'staff123')}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-[#e2ff70] rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center"
                  >
                    <Shield className="w-3 h-3 mr-1" /> Staff
                  </button>
                  <button 
                    onClick={() => handleQuickSelect('admin@fifa.com', 'admin123')}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-[#e2ff70] rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center"
                  >
                    <Key className="w-3 h-3 mr-1" /> Admin
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-square border border-neutral-200 rounded-[40px] flex items-center justify-center p-8 bg-white shadow-lg relative">
              {/* Pulsing rings */}
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
          © 2026 FIFA Copilot prototype. Smart Stadium Operations Command Center.
        </div>
        <div className="flex space-x-6">
          <span className="flex items-center"><Shield className="w-3.5 h-3.5 mr-1" /> Secure OAuth SSO</span>
          <span className="flex items-center"><Activity className="w-3.5 h-3.5 mr-1" /> Live WebSocket Telemetry</span>
        </div>
      </footer>
    </div>
  );
}
