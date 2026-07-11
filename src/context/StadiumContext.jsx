/* eslint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialMockData } from '../data/mockData';

const StadiumContext = createContext();

export function StadiumProvider({ children }) {
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('fan');
  const [stadiumData, setStadiumData] = useState(initialMockData);
  const [currentLanguage, setLanguage] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', text: 'FIFA Copilot IoT telemetry engine started.', time: '14:41' }
  ]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Accessibility State Properties
  const [highContrast, setHighContrast] = useState(false);
  const [voiceGuidance, setVoiceGuidance] = useState(false);
  const [textScale, setTextScale] = useState(1); // 1 = 100%, 1.2 = 120%, 1.45 = 145%
  const [colorBlindFilter, setColorBlindFilter] = useState('none'); // 'none', 'deuteranopia', 'protanopia', 'tritanopia'

  // Connect to the backend Server-Sent Events (SSE) telemetry stream when dashboard is active
  useEffect(() => {
    if (currentView !== 'dashboard') return;

    console.log("EventSource: Connecting to live operations telemetry stream...");
    const eventSource = new EventSource('/api/telemetry/stream');

    eventSource.onmessage = (event) => {
      try {
        const liveData = JSON.parse(event.data);
        setStadiumData(liveData);
      } catch (err) {
        console.error("EventSource: Failed to parse telemetry event data: ", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource connection issue. Retrying connection...", err);
    };

    return () => {
      eventSource.close();
      console.log("EventSource: Connection closed.");
    };
  }, [currentView]);

  const addNotification = (type, text) => {
    const time = new Date();
    const timeString = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    setNotifications(prev => [
      { id: Date.now(), type, text, time: timeString },
      ...prev.slice(0, 9)
    ]);
  };

  // Sync safety alarm triggers directly to Node API server
  const handleSetEmergencyState = async (newState) => {
    // Optimistic local UI update
    setStadiumData(prev => ({
      ...prev,
      emergencyState: newState,
      stadiumStats: {
        ...prev.stadiumStats,
        activeAlerts: newState.active ? 1 : 0
      }
    }));

    try {
      const response = await fetch('/api/telemetry/emergency', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(newState)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      addNotification("info", newState.active ? `Safety alert logged: ${newState.type}` : "Nominal safety checks restored.");
    } catch (err) {
      console.error("API error updating safety overrides: ", err);
    }
  };

  // Sync volunteer steward dispatch to Node API server
  const handleDispatchStaff = async () => {
    addNotification("system-alert", "Steward dispatch orders transmitted to supervisor channels.");
    
    // Optimistic UI updates
    setStadiumData(prev => ({
      ...prev,
      stadiumStats: {
        ...prev.stadiumStats,
        activeStaff: Math.min(prev.stadiumStats.activeStaff + 10, 500)
      }
    }));

    try {
      const response = await fetch('/api/telemetry/dispatch', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      console.error("API error syncing staff dispatches: ", err);
    }
  };

  // Sync AI-prompted reroutes and audio announcements to Node API server
  const handleTriggerBroadcastRedirect = async () => {
    addNotification("ai-suggestion", "Rerouting prompt transmitted to stand PA channels.");
    
    try {
      const response = await fetch('/api/telemetry/broadcast', { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      console.error("API error syncing audio broadcasts: ", err);
    }
  };

  const handleSelectDestinationForNav = (destinationName) => {
    setActiveTab('fan');
    addNotification("info", `Wayfinding path mapped for: ${destinationName}`);
  };

  const enterDashboard = (mode) => {
    setCurrentView('dashboard');
    setActiveTab(mode === 'ops' ? 'ops' : 'fan');
    addNotification('info', `Authorized session: ${mode === 'ops' ? 'Operations Dispatcher' : 'Fan Support'}.`);
  };

  const exitSession = () => {
    setCurrentView('landing');
  };

  return (
    <StadiumContext.Provider value={{
      currentView,
      setCurrentView,
      activeTab,
      setActiveTab,
      stadiumData,
      setStadiumData,
      currentLanguage,
      setLanguage,
      mobileMenuOpen,
      setMobileMenuOpen,
      notifications,
      setNotifications,
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

      // Accessibility values
      highContrast,
      setHighContrast,
      voiceGuidance,
      setVoiceGuidance,
      textScale,
      setTextScale,
      colorBlindFilter,
      setColorBlindFilter
    }}>
      {children}
    </StadiumContext.Provider>
  );
}

export function useStadium() {
  const context = useContext(StadiumContext);
  if (!context) {
    throw new Error('useStadium must be used within a StadiumProvider');
  }
  return context;
}
