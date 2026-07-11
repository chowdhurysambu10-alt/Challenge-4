/* eslint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialMockData, updateMockData } from '../data/mockData';

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

  // Live IoT telemetry refresh loop
  useEffect(() => {
    if (currentView !== 'dashboard') return;
    const timer = setInterval(() => {
      setStadiumData(prev => updateMockData(prev));
    }, 6000);
    return () => clearInterval(timer);
  }, [currentView]);

  const addNotification = (type, text) => {
    const time = new Date();
    const timeString = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    setNotifications(prev => [
      { id: Date.now(), type, text, time: timeString },
      ...prev.slice(0, 9)
    ]);
  };

  const handleSetEmergencyState = (newState) => {
    setStadiumData(prev => ({
      ...prev,
      emergencyState: newState,
      stadiumStats: {
        ...prev.stadiumStats,
        activeAlerts: newState.active ? 1 : 0
      }
    }));
  };

  const handleDispatchStaff = () => {
    addNotification("system-alert", "Demo dispatch recorded for congestion-management review. No staff were contacted.");
  };

  const handleTriggerBroadcastRedirect = () => {
    addNotification("ai-suggestion", "Demo rerouting broadcast recorded. No stadium channels were contacted.");
  };

  const handleSelectDestinationForNav = (destinationName) => {
    setActiveTab('fan');
    addNotification("info", `Wayfinding path loaded for: ${destinationName}`);
  };

  const enterDashboard = (mode) => {
    setCurrentView('dashboard');
    setActiveTab(mode === 'ops' ? 'ops' : 'fan');
    addNotification('info', `Demo session: ${mode === 'ops' ? 'Operations view' : 'Fan support view'}.`);
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
      exitSession
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
