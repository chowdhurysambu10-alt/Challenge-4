import { checkRole } from '../middleware/authMiddleware.js';
import { getSchedules, getConcessions, getIncidents, logIncident, getAiUsageStats } from '../services/dbService.js';

export async function handleTelemetryRoutes(
  request,
  response,
  requestUrl,
  readJson,
  sendJson,
  masterStadiumData,
  broadcastTelemetry,
  canRequest,
  getClientAddress
) {
  // GET /api/schedules
  if (request.method === 'GET' && requestUrl.pathname === '/api/schedules') {
    // Open to all roles (Fan, Staff, Admin)
    try {
      const schedules = await getSchedules();
      sendJson(response, 200, schedules);
    } catch (err) {
      sendJson(response, 500, { error: 'Failed to fetch schedules: ' + err.message });
    }
    return true;
  }

  // GET /api/concessions
  if (request.method === 'GET' && requestUrl.pathname === '/api/concessions') {
    // Open to all roles
    try {
      const concessions = await getConcessions();
      sendJson(response, 200, concessions);
    } catch (err) {
      sendJson(response, 500, { error: 'Failed to fetch concessions: ' + err.message });
    }
    return true;
  }

  // GET /api/incidents
  if (request.method === 'GET' && requestUrl.pathname === '/api/incidents') {
    const auth = checkRole(request, ['staff', 'admin']);
    if (!auth.valid) {
      sendJson(response, auth.status, { error: auth.error });
      return true;
    }
    try {
      const incidents = await getIncidents();
      sendJson(response, 200, incidents);
    } catch (err) {
      sendJson(response, 500, { error: 'Failed to fetch incidents: ' + err.message });
    }
    return true;
  }

  // GET /api/analytics
  if (request.method === 'GET' && requestUrl.pathname === '/api/analytics') {
    const auth = checkRole(request, ['staff', 'admin']);
    if (!auth.valid) {
      sendJson(response, auth.status, { error: auth.error });
      return true;
    }
    try {
      const incidents = await getIncidents();
      const aiUsage = await getAiUsageStats();
      
      // Calculate responsive summary stats for the Recharts dashboard
      const stats = {
        gatesWaitAvg: masterStadiumData.stadiumStats.avgWaitTime,
        activeAlerts: masterStadiumData.stadiumStats.activeAlerts,
        activeStaff: masterStadiumData.stadiumStats.activeStaff,
        checkedIn: masterStadiumData.stadiumStats.totalCheckedIn,
        incidentsCount: incidents.length,
        aiUsage: aiUsage.map(log => ({
          time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: log.intent,
          tokens: log.tokens
        }))
      };
      sendJson(response, 200, stats);
    } catch (err) {
      sendJson(response, 500, { error: 'Failed to build analytics dashboard: ' + err.message });
    }
    return true;
  }

  // POST /api/telemetry/emergency
  if (request.method === 'POST' && requestUrl.pathname === '/api/telemetry/emergency') {
    // Evac overrides restricted to ADMIN role only
    const auth = checkRole(request, ['admin']);
    if (!auth.valid) {
      sendJson(response, auth.status, { error: auth.error });
      return true;
    }
    if (!canRequest(getClientAddress(request))) {
      sendJson(response, 429, { error: 'Too many requests. Please wait.' });
      return true;
    }

    try {
      const emergency = await readJson(request);
      masterStadiumData.emergencyState = {
        active: emergency.active === true,
        type: emergency.type || null,
        location: emergency.location || null,
        message: emergency.message || '',
        evacRoute: Array.isArray(emergency.evacRoute) ? emergency.evacRoute : []
      };
      
      masterStadiumData.stadiumStats.activeAlerts = emergency.active ? 1 : 0;

      // Log to database
      if (emergency.active) {
        await logIncident(emergency.type, emergency.location, emergency.message);
      }

      // Add operation log
      const time = new Date();
      const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
      masterStadiumData.operationalInsights.unshift({
        id: Date.now(),
        timestamp: timeStr,
        type: emergency.active ? "system-alert" : "ai-suggestion",
        badge: emergency.active ? "Emergency Alarm" : "All Clear",
        message: emergency.active ? `Active incident: ${emergency.type.toUpperCase()} at ${emergency.location}` : "Emergency state cleared.",
        reason: emergency.active ? emergency.message : "Dispatcher verified safety standards restablised."
      });

      broadcastTelemetry(masterStadiumData);
      sendJson(response, 200, { success: true });
    } catch (err) {
      sendJson(response, 400, { error: err.message });
    }
    return true;
  }

  // POST /api/telemetry/dispatch
  if (request.method === 'POST' && requestUrl.pathname === '/api/telemetry/dispatch') {
    // Staff and Admin can dispatch stewards
    const auth = checkRole(request, ['staff', 'admin']);
    if (!auth.valid) {
      sendJson(response, auth.status, { error: auth.error });
      return true;
    }
    if (!canRequest(getClientAddress(request))) {
      sendJson(response, 429, { error: 'Too many requests. Please wait.' });
      return true;
    }

    try {
      const time = new Date();
      const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
      
      masterStadiumData.stadiumStats.activeStaff = Math.min(masterStadiumData.stadiumStats.activeStaff + 10, 500);
      masterStadiumData.operationalInsights.unshift({
        id: Date.now(),
        timestamp: timeStr,
        type: "system-alert",
        badge: "Steward Squads",
        message: "Steward dispatch ordered for Zone B Stand congestion.",
        reason: "Steward Squads #4 and #6 deployed to manage exits."
      });

      // Log dispatch incident
      await logIncident('dispatch', 'Zone B Concourse', 'Deployed 10 steward units.');

      broadcastTelemetry(masterStadiumData);
      sendJson(response, 200, { success: true });
    } catch (err) {
      sendJson(response, 400, { error: err.message });
    }
    return true;
  }

  // POST /api/telemetry/broadcast
  if (request.method === 'POST' && requestUrl.pathname === '/api/telemetry/broadcast') {
    // Staff and Admin can broadcast reroutes
    const auth = checkRole(request, ['staff', 'admin']);
    if (!auth.valid) {
      sendJson(response, auth.status, { error: auth.error });
      return true;
    }
    if (!canRequest(getClientAddress(request))) {
      sendJson(response, 429, { error: 'Too many requests. Please wait.' });
      return true;
    }

    try {
      const time = new Date();
      const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
      
      masterStadiumData.operationalInsights.unshift({
        id: Date.now(),
        timestamp: timeStr,
        type: "ai-suggestion",
        badge: "PA Broadcast",
        message: "Rerouting announcements broadcasted to Zone B East stand speakers.",
        reason: "Directed 15% of Zone B arrivals to auxiliary south-west exits."
      });

      broadcastTelemetry(masterStadiumData);
      sendJson(response, 200, { success: true });
    } catch (err) {
      sendJson(response, 400, { error: err.message });
    }
    return true;
  }

  return false;
}
