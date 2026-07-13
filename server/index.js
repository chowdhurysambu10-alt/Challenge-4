import { createServer } from 'node:http';
import { validateChatRequest, requestAssistant } from './chatService.js';
import { initialMockData, updateMockData } from '../src/data/mockData.js';
import { promises as fs } from 'node:fs';
import { join, extname, dirname, resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DIST_DIR = pathResolve(__dirname, '../dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

const PORT = Number(process.env.PORT || 8787);
const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 50; // Increased capacity for presentations
const requestWindows = new Map();

// Active SSE client connections
const clients = new Set();

// Master telemetry state stored in server memory
let masterStadiumData = { ...initialMockData };

// Start backend simulation loop updating sensor data every 6 seconds if clients are connected
setInterval(() => {
  if (clients.size === 0) return;
  masterStadiumData = updateMockData(masterStadiumData);
  broadcastTelemetry(masterStadiumData);
}, 6000);

// Prune stale rate limit windows and dead SSE clients every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [ip, window] of requestWindows.entries()) {
    if (now - window.startedAt >= RATE_LIMIT_WINDOW_MS) {
      requestWindows.delete(ip);
    }
  }
  for (const client of clients) {
    if (client.destroyed || (client.socket && client.socket.destroyed)) {
      clients.delete(client);
    }
  }
}, 30000);

function broadcastTelemetry(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}

function setSecurityHeaders(response) {
  // Enhanced production-grade security headers
  response.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' ws: wss:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

function sendJson(response, statusCode, payload) {
  setSecurityHeaders(response);
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(payload));
}

function getClientAddress(request) {
  return request.socket.remoteAddress || 'unknown';
}

function canRequest(clientAddress) {
  const now = Date.now();
  const existingWindow = requestWindows.get(clientAddress);
  const currentWindow = existingWindow && now - existingWindow.startedAt < RATE_LIMIT_WINDOW_MS
    ? existingWindow
    : { startedAt: now, count: 0 };

  currentWindow.count += 1;
  requestWindows.set(clientAddress, currentWindow);
  return currentWindow.count <= RATE_LIMIT_MAX_REQUESTS;
}

const OPS_TOKEN = 'fifa-ops-token-2026-secure';

function isAuthorized(request) {
  const authHeader = request.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  return token === OPS_TOKEN;
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytesRead = 0;

    request.on('data', (chunk) => {
      bytesRead += chunk.length;
      if (bytesRead > MAX_BODY_BYTES) {
        reject(new Error('Request body too large.'));
        request.destroy();
        return;
      }
      body += chunk;
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Invalid JSON.'));
      }
    });
    request.on('error', reject);
  });
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  // Handle static file serving for non-API requests (e.g. in production)
  if (!requestUrl.pathname.startsWith('/api')) {
    let filePath = join(DIST_DIR, requestUrl.pathname);
    
    // Safety check: prevent directory traversal
    if (!filePath.startsWith(DIST_DIR)) {
      sendJson(response, 403, { error: 'Forbidden' });
      return;
    }

    try {
      let stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        filePath = join(filePath, 'index.html');
        stats = await fs.stat(filePath);
      }

      const ext = extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = await fs.readFile(filePath);

      setSecurityHeaders(response);
      const isHtml = ext === '.html';
      response.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': isHtml ? 'no-store, no-cache, must-revalidate' : 'public, max-age=31536000, immutable' 
      });
      response.end(content);
      return;
    } catch {
      // Fallback to index.html for Single Page Application routing (SPA)
      try {
        const indexPath = join(DIST_DIR, 'index.html');
        const content = await fs.readFile(indexPath);
        setSecurityHeaders(response);
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(content);
        return;
      } catch {
        sendJson(response, 404, { error: 'Not found.' });
        return;
      }
    }
  }

  // Endpoint: Health status
  if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
    sendJson(response, 200, { status: 'ok', activeClients: clients.size });
    return;
  }

  // Endpoint: Real-time Server-Sent Events stream
  if (request.method === 'GET' && requestUrl.pathname === '/api/telemetry/stream') {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    });
    
    // Send immediate initial state
    response.write(`data: ${JSON.stringify(masterStadiumData)}\n\n`);
    clients.add(response);

    request.on('close', () => {
      clients.delete(response);
    });
    return;
  }

  // Endpoint: Emergency updates from dispatcher client
  if (request.method === 'POST' && requestUrl.pathname === '/api/telemetry/emergency') {
    if (!isAuthorized(request)) {
      sendJson(response, 401, { error: 'Unauthorized: Operations session check failed.' });
      return;
    }
    if (!canRequest(getClientAddress(request))) {
      sendJson(response, 429, { error: 'Too many requests. Please wait.' });
      return;
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

      // Add a log alert to operations stream
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
    return;
  }

  // Endpoint: Volunteer Dispatch order updates
  if (request.method === 'POST' && requestUrl.pathname === '/api/telemetry/dispatch') {
    if (!isAuthorized(request)) {
      sendJson(response, 401, { error: 'Unauthorized: Operations session check failed.' });
      return;
    }
    if (!canRequest(getClientAddress(request))) {
      sendJson(response, 429, { error: 'Too many requests. Please wait.' });
      return;
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

      broadcastTelemetry(masterStadiumData);
      sendJson(response, 200, { success: true });
    } catch (err) {
      sendJson(response, 400, { error: err.message });
    }
    return;
  }

  // Endpoint: AI Broadcast Rerouting order updates
  if (request.method === 'POST' && requestUrl.pathname === '/api/telemetry/broadcast') {
    if (!isAuthorized(request)) {
      sendJson(response, 401, { error: 'Unauthorized: Operations session check failed.' });
      return;
    }
    if (!canRequest(getClientAddress(request))) {
      sendJson(response, 429, { error: 'Too many requests. Please wait.' });
      return;
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
    return;
  }

  // Endpoint: Chat Assistant
  if (request.method === 'POST' && requestUrl.pathname === '/api/chat') {
    if (request.headers['content-type']?.split(';')[0] !== 'application/json') {
      sendJson(response, 415, { error: 'Content-Type must be application/json.' });
      return;
    }

    if (!canRequest(getClientAddress(request))) {
      sendJson(response, 429, { error: 'Too many assistant requests. Please wait and try again.' });
      return;
    }

    try {
      const json = await readJson(request);
      const validation = validateChatRequest(json);
      if (!validation.valid) {
        sendJson(response, 400, { error: validation.error });
        return;
      }

      const assistantResponse = await requestAssistant(validation.value, { apiKey: process.env.GEMINI_API_KEY });
      if (!assistantResponse.available) {
        sendJson(response, 503, { error: assistantResponse.reason });
        return;
      }

      sendJson(response, 200, assistantResponse);
    } catch (err) {
      console.error("Chat routing error:", err);
      sendJson(response, 502, { error: 'The live assistant is unavailable. Try the local demo assistant instead.' });
    }
    return;
  }

  sendJson(response, 404, { error: 'Not found.' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`FIFA Copilot API listening on http://127.0.0.1:${PORT}`);
});
