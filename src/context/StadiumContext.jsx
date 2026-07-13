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
  const [textScale, setTextScale] = useState(1);
  const [colorBlindFilter, setColorBlindFilter] = useState('none');

  // Relational User Auth state
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('fifa-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('fifa-token') || null);

  // Connect to the backend WebSocket telemetry stream when dashboard is active
  useEffect(() => {
    if (currentView !== 'dashboard') return;

    console.log("WebSocket: Connecting to live telemetry stream...");
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}/api/telemetry/ws`;
    const ws = new WebSocket(socketUrl);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'telemetry') {
          setStadiumData(payload.data);
        }
      } catch (err) {
        console.error("WebSocket message parsing error: ", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error, waiting to reconnect: ", err);
    };

    return () => {
      ws.close();
      console.log("WebSocket: Connection closed.");
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

  // Auth Operations
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed.');
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('fifa-token', data.token);
      localStorage.setItem('fifa-user', JSON.stringify(data.user));

      setCurrentView('dashboard');
      if (data.user.role === 'admin' || data.user.role === 'staff') {
        setActiveTab('ops');
      } else {
        setActiveTab('fan');
      }
      addNotification('info', `Log-in authorized: ${data.user.name} (${data.user.role.toUpperCase()})`);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const googleLogin = async (email, name, role) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, name, role })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Google login failed.');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('fifa-token', data.token);
      localStorage.setItem('fifa-user', JSON.stringify(data.user));

      setCurrentView('dashboard');
      if (data.user.role === 'admin' || data.user.role === 'staff') {
        setActiveTab('ops');
      } else {
        setActiveTab('fan');
      }
      addNotification('info', `Google Sign-in: Welcome ${data.user.name}!`);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fifa-token');
    localStorage.removeItem('fifa-user');
    setCurrentView('landing');
    addNotification('info', 'Session ended successfully.');
  };

  // Sync safety overrides (Admin only)
  const handleSetEmergencyState = async (newState) => {
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
        headers: { 
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newState)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      addNotification("info", newState.active ? `Safety alert logged: ${newState.type}` : "Nominal safety checks restored.");
    } catch (err) {
      console.error("API error updating safety overrides: ", err);
    }
  };

  // Sync volunteer steward dispatch (Staff/Admin only)
  const handleDispatchStaff = async () => {
    addNotification("system-alert", "Steward dispatch orders transmitted to supervisor channels.");
    
    setStadiumData(prev => ({
      ...prev,
      stadiumStats: {
        ...prev.stadiumStats,
        activeStaff: Math.min(prev.stadiumStats.activeStaff + 10, 500)
      }
    }));

    try {
      const response = await fetch('/api/telemetry/dispatch', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      console.error("API error syncing staff dispatches: ", err);
    }
  };

  // Sync AI-prompted reroutes (Staff/Admin only)
  const handleTriggerBroadcastRedirect = async () => {
    addNotification("ai-suggestion", "Rerouting prompt transmitted to stand PA channels.");
    
    try {
      const response = await fetch('/api/telemetry/broadcast', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      console.error("API error syncing audio broadcasts: ", err);
    }
  };

  const handleSelectDestinationForNav = (destinationName) => {
    setActiveTab('fan');
    addNotification("info", `Wayfinding path mapped for: ${destinationName}`);
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
      logout,
      
      // Relational Auth states
      user,
      token,
      login,
      googleLogin,

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
