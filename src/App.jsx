import React, { Suspense, lazy } from 'react';
import { 
  MessageSquare, 
  Map, 
  BarChart3, 
  Bus, 
  AlertTriangle, 
  LayoutDashboard, 
  Menu, 
  X, 
  Bell, 
  Globe, 
  LogOut, 
  ShieldAlert,
  ChevronRight,
  Sun,
  Moon,
  Accessibility
} from 'lucide-react';

import { useStadium } from './context/StadiumContext';
import LandingPage from './components/LandingPage';

// Lazy load components for performance optimization & code splitting (Lighthouse score improvement)
const FanAssistant = lazy(() => import('./components/FanAssistant'));
const StadiumMap = lazy(() => import('./components/StadiumMap'));
const CrowdDashboard = lazy(() => import('./components/CrowdDashboard'));
const TransportLogistics = lazy(() => import('./components/TransportLogistics'));
const EmergencyAccessibility = lazy(() => import('./components/EmergencyAccessibility'));
const OperationsPanel = lazy(() => import('./components/OperationsPanel'));

export default function App() {
  const {
    currentView,
    activeTab,
    setActiveTab,
    stadiumData,
    currentLanguage,
    setLanguage,
    mobileMenuOpen,
    setMobileMenuOpen,
    notifications,
    showNotificationsDropdown,
    setShowNotificationsDropdown,
    darkMode,
    setDarkMode,
    addNotification,
    handleSetEmergencyState,
    handleDispatchStaff,
    handleTriggerBroadcastRedirect,
    handleSelectDestinationForNav,
    enterDashboard,
    exitSession,

    // Accessibility contexts
    highContrast,
    setHighContrast,
    textScale,
    setTextScale,
    colorBlindFilter,
    setColorBlindFilter
  } = useStadium();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'fan':
        return (
          <FanAssistant 
            currentLanguage={currentLanguage} 
            setLanguage={setLanguage}
            addAlertNotification={() => 
              handleSetEmergencyState({
                active: true,
                type: 'general',
                location: 'Stadium Wide',
                message: 'Emergency evacuation triggered via chatbot override.',
                evacRoute: ['Exit corridors A, B, C, D']
              })
            }
          />
        );
      case 'map':
        return (
          <StadiumMap 
            gates={stadiumData.gates} 
            zones={stadiumData.zones}
            emergencyState={stadiumData.emergencyState}
            selectDestinationForNav={handleSelectDestinationForNav}
          />
        );
      case 'crowd':
        return (
          <CrowdDashboard 
            gates={stadiumData.gates} 
            zones={stadiumData.zones}
            operationalInsights={stadiumData.operationalInsights}
            triggerBroadcastRedirect={handleTriggerBroadcastRedirect}
          />
        );
      case 'transit':
        return (
          <TransportLogistics 
            parking={stadiumData.parking} 
            transit={stadiumData.transit} 
            weather={stadiumData.weather}
          />
        );
      case 'emergency':
        return (
          <EmergencyAccessibility 
            emergencyState={stadiumData.emergencyState}
            setEmergencyState={handleSetEmergencyState}
            addNotification={addNotification}
          />
        );
      case 'ops':
        return (
          <OperationsPanel 
            stadiumStats={stadiumData.stadiumStats}
            operationalInsights={stadiumData.operationalInsights}
            dispatchStaff={handleDispatchStaff}
          />
        );
      default:
        return <div className="text-neutral-500 font-mono">Module not found.</div>;
    }
  };

  const menuItems = [
    { id: 'fan', label: 'Fan AI Chat', icon: MessageSquare, description: 'Stadium Assistant' },
    { id: 'map', label: 'Stadium Map', icon: Map, description: 'Wayfinding Layout' },
    { id: 'crowd', label: 'Crowd Intel', icon: BarChart3, description: 'Queue heatmaps' },
    { id: 'transit', label: 'Logistics', icon: Bus, description: 'Transit & Parking' },
    { id: 'emergency', label: 'Safety & Access', icon: AlertTriangle, description: 'ADA & Evacuation' },
    { id: 'ops', label: 'Ops Feed', icon: LayoutDashboard, description: 'Telemetry logs' }
  ];

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onEnter={enterDashboard} 
      />
    );
  }

  const activeItem = menuItems.find(m => m.id === activeTab);

  // Apply CSS contrast & accessibility filters dynamically
  const getColorBlindFilterStyle = () => {
    if (colorBlindFilter === 'deuteranopia') return { filter: 'hue-rotate(20deg) saturate(90%)' };
    if (colorBlindFilter === 'protanopia') return { filter: 'hue-rotate(-20deg) saturate(85%)' };
    if (colorBlindFilter === 'tritanopia') return { filter: 'hue-rotate(180deg) saturate(95%)' };
    return {};
  };

  return (
    <div 
      className={`${darkMode ? "dark text-white" : "text-black"} ${highContrast ? "high-contrast" : ""}`}
      style={{ ...getColorBlindFilterStyle(), fontSize: `${textScale * 100}%` }}
    >
      <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#0a0a0a] text-[#121212] dark:text-white flex flex-col font-sans relative transition-colors duration-300">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black">Skip to main content</a>
      
      {/* Top Banner Override for Emergencies */}
      {stadiumData.emergencyState.active && (
        <div role="alert" className="z-50 bg-[#121212] text-[#e2ff70] px-4 md:px-8 py-3 border-b border-neutral-900 flex items-center justify-between text-xs md:text-sm font-bold shadow-md">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
            <span>
              SIMULATED SAFETY EVENT: Incident in {stadiumData.emergencyState.location}. Review the illustrative exit pathways on the map.
            </span>
          </div>
          <button 
            onClick={() => handleSetEmergencyState({ active: false, type: null, location: null, message: '', evacRoute: [] })}
            className="bg-[#e2ff70] text-[#121212] px-3 py-1 rounded-full text-[10px] uppercase font-mono font-bold cursor-pointer transition-all ml-4"
          >
            Clear Simulation
          </button>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row min-h-screen">
        
        {/* Floating Left Sidebar matching screenshot */}
        <aside id="primary-navigation" className={`w-72 md:w-20 lg:w-64 bg-[#121212] text-white flex-shrink-0 z-40 transition-transform duration-300 md:translate-x-0 m-4 rounded-[32px] flex flex-col justify-between p-5 shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0 absolute top-0 bottom-0 left-0 border border-neutral-850' : '-translate-x-full absolute md:relative'
        }`}>
          <div className="flex flex-col space-y-6">
            {/* Sidebar Logo */}
            <div className="flex items-center space-x-3.5 px-2">
              <div className="w-10 h-10 bg-[#e2ff70] text-[#121212] flex items-center justify-center font-black text-lg rounded-2xl tracking-tighter">
                F
              </div>
              <div className="md:hidden lg:block">
                <h1 className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase leading-none">FIFA Stadium</h1>
                <h2 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">COPILOT</h2>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="space-y-2" aria-label="Stadium modules">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center space-x-3.5 p-3 rounded-2xl transition-all text-left cursor-pointer group ${
                      isActive 
                        ? 'bg-white text-black font-bold' 
                        : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className={`p-2 rounded-xl flex items-center justify-center ${isActive ? 'bg-[#e2ff70] text-black' : 'bg-neutral-900 text-neutral-400'}`}>
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <div className="md:hidden lg:block col-span-2">
                      <h4 className="font-bold text-xs uppercase tracking-wide leading-none">{item.label}</h4>
                      <p className={`text-[9px] mt-0.5 font-light ${isActive ? 'text-neutral-500' : 'text-neutral-450'}`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Interactive Accessibility settings panel inside the float navigation */}
          <div className="md:hidden lg:block border-t border-neutral-900 pt-4 mt-4 space-y-3 px-1">
            <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono font-bold flex items-center">
              <Accessibility className="w-3.5 h-3.5 mr-1" /> a11y cockpit
            </span>
            
            {/* Contrast toggle */}
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className={`w-full py-1.5 px-3 rounded-xl text-[10px] font-mono font-bold flex justify-between items-center transition-all cursor-pointer ${
                highContrast ? 'bg-[#e2ff70] text-black' : 'bg-neutral-900 text-neutral-450 hover:text-white'
              }`}
            >
              <span>Contrast Plus</span>
              <span className="text-[8px] border px-1 py-0.5 rounded uppercase leading-none border-neutral-700">
                {highContrast ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Text Scale slider buttons */}
            <div className="flex justify-between items-center bg-neutral-900 rounded-xl p-1 text-[10px] font-mono text-neutral-450">
              <button 
                onClick={() => setTextScale(Math.max(1, textScale - 0.15))}
                className="px-2 py-1 hover:text-white cursor-pointer"
                title="Decrease Text Size"
              >
                A-
              </button>
              <span className="text-white font-bold">{Math.round(textScale * 100)}%</span>
              <button 
                onClick={() => setTextScale(Math.min(1.45, textScale + 0.15))}
                className="px-2 py-1 hover:text-white cursor-pointer"
                title="Increase Text Size"
              >
                A+
              </button>
            </div>

            {/* Color blind selector menu */}
            <select
              value={colorBlindFilter}
              onChange={(e) => setColorBlindFilter(e.target.value)}
              className="w-full bg-neutral-900 text-neutral-400 text-[10px] font-mono p-1.5 rounded-xl border border-neutral-850 focus:outline-none cursor-pointer"
            >
              <option value="none">Normal Colorblind</option>
              <option value="deuteranopia">Deuteranopia (Red-Green)</option>
              <option value="protanopia">Protanopia (Red-Green)</option>
              <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
            </select>
          </div>

          {/* Sidebar Footer details */}
          <div className="space-y-4 border-t border-neutral-900 pt-4">
            <button 
              onClick={exitSession}
              className="w-full flex items-center space-x-3 p-3 rounded-2xl text-neutral-450 hover:text-white hover:bg-neutral-900/60 transition-all cursor-pointer text-left text-xs uppercase font-mono font-bold"
            >
              <div className="p-2 bg-neutral-900 rounded-xl">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="md:hidden lg:inline">Exit Session</span>
            </button>

            <div className="md:hidden lg:block font-mono text-[9px] text-neutral-500 leading-normal">
              <div className="flex justify-between">
                <span>Core sync</span>
                <span className="text-[#e2ff70]">OK</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Workspace on the Right */}
        <main id="main-content" tabIndex="-1" className="flex-1 p-6 md:p-10 flex flex-col justify-between overflow-y-auto max-w-7xl mx-auto w-full">
          
          <div className="space-y-8">
            {/* Header: matches screenshot layout */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-250 dark:border-neutral-800 pb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* Mobile navigation trigger */}
                  <button 
                    onClick={() => setMobileMenuOpen(prev => !prev)}
                    aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="primary-navigation"
                    className="md:hidden p-1.5 rounded-xl border border-neutral-300 dark:border-neutral-750 text-neutral-650 hover:text-black dark:hover:text-white cursor-pointer bg-white dark:bg-neutral-900"
                  >
                    {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  </button>

                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-mono flex items-center">
                    FIFA Telemetry Core
                  </span>
                  <ChevronRight className="w-3 h-3 text-neutral-400 dark:text-neutral-600" />
                  
                  {/* Dashed setting badge like the screenshot */}
                  <div className="text-[9px] tracking-wider uppercase font-mono font-bold px-2 py-0.5 bg-[#e2ff70] border border-dashed border-neutral-400 dark:border-neutral-700 text-black rounded-full flex items-center space-x-1.5">
                    <span>{activeItem ? activeItem.label : 'Dashboard'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-neutral-800 dark:text-white uppercase font-display">
                    Smart Arena Dashboard
                  </h1>
                </div>
              </div>

              {/* Utility Header Actions */}
              <div className="flex items-center space-x-3.5">
                
                {/* Language Indicator */}
                <div className="flex items-center space-x-2 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 shadow-sm px-3.5 py-2 rounded-2xl">
                  <Globe className="w-4 h-4 text-neutral-500" />
                  <select
                    value={currentLanguage}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent text-neutral-850 dark:text-neutral-200 text-xs font-mono font-bold border-none outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="en">EN</option>
                    <option value="es">ES</option>
                    <option value="fr">FR</option>
                    <option value="ar">AR</option>
                    <option value="hi">HI</option>
                    <option value="bn">BN</option>
                  </select>
                </div>

                {/* Alerts Telemetry Bell */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotificationsDropdown(prev => !prev)}
                    className="p-2 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-2xl text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all cursor-pointer relative"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#121212] dark:bg-[#e2ff70] border-2 border-white dark:border-[#121212] rounded-full animate-ping" />
                    )}
                  </button>

                  {showNotificationsDropdown && (
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-2xl z-50 space-y-3 font-mono text-[#121212] dark:text-white">
                      <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-850 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">IoT Logs</span>
                        <span className="w-2 h-2 rounded-full bg-[#e2ff70]" />
                      </div>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {notifications.map((n) => (
                          <div key={n.id} className="text-[10px] leading-relaxed border-b border-neutral-50 dark:border-neutral-850 pb-2 last:border-0 last:pb-0 flex items-start space-x-2">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                              n.type === 'system-alert' ? 'bg-[#121212] dark:bg-white' : 'bg-[#e2ff70]'
                            }`} />
                            <div className="flex-1">
                              <p className="text-neutral-700 dark:text-neutral-300">{n.text}</p>
                              <span className="text-[9px] text-neutral-400 dark:text-neutral-500">{n.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dark Mode Button */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2.5 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-2xl text-neutral-600 dark:text-neutral-450 hover:text-black dark:hover:text-white transition-all cursor-pointer flex items-center justify-center"
                  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

              </div>
            </div>

            {/* Dashboard Sub-Modules Wrapped in Suspense Boundary */}
            <div className="relative">
              <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-neutral-500">Connecting to telemetry core...</div>}>
                {renderTabContent()}
              </Suspense>
            </div>
          </div>

          {/* Footer stats matching FIDS dashboard layout */}
          <footer className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-500 gap-4 font-mono">
            <div className="flex items-center space-x-2.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#121212] dark:bg-[#e2ff70]" />
              <span>Telemetry sync: Active (0.4s latency)</span>
            </div>
            <div>
              Match: <strong className="text-black dark:text-white">{stadiumData.stadiumStats.matchInfo.match} ({stadiumData.stadiumStats.matchInfo.timeText})</strong>
            </div>
          </footer>

        </main>
      </div>
      
    </div>
  </div>
  );
}
