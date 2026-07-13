import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import { join, extname, dirname, resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { initDb } from './services/dbService.js';
import { initWebSocketServer, broadcastTelemetry, getActiveClientsCount } from './services/wsService.js';
import { handleAuthRoutes } from './routes/authRoutes.js';
import { handleTelemetryRoutes } from './routes/telemetryRoutes.js';
import { handleChatRequest } from './services/geminiService.js';
import { initialMockData, updateMockData } from '../src/data/mockData.js';

dotenv.config();

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
const RATE_LIMIT_MAX_REQUESTS = 100;
const requestWindows = new Map();

// Master telemetry state stored in server memory
let masterStadiumData = { ...initialMockData };

// Start backend simulation loop updating telemetry every 3 seconds if WebSockets are active
setInterval(() => {
  const wsCount = getActiveClientsCount();
  if (wsCount === 0) return;
  masterStadiumData = updateMockData(masterStadiumData);
  broadcastTelemetry(masterStadiumData);
}, 3000);

// Prune expired rate-limit windows every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [ip, window] of requestWindows.entries()) {
    if (now - window.startedAt >= RATE_LIMIT_WINDOW_MS) {
      requestWindows.delete(ip);
    }
  }
}, 30000);

function setSecurityHeaders(response) {
  response.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' ws: wss: http: https:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
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
  return request.headers['x-forwarded-for'] || request.socket.remoteAddress || 'unknown';
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

  // 1. Route Auth requests
  if (requestUrl.pathname.startsWith('/api/auth')) {
    const handled = await handleAuthRoutes(request, response, requestUrl, readJson, sendJson);
    if (handled) return;
  }

  // 2. Route AI Chat requests
  if (request.method === 'POST' && requestUrl.pathname === '/api/chat') {
    if (request.headers['content-type']?.split(';')[0] !== 'application/json') {
      sendJson(response, 415, { error: 'Content-Type must be application/json.' });
      return;
    }
    await handleChatRequest(request, response, readJson, sendJson, canRequest, getClientAddress);
    return;
  }

  // 3. Route Telemetry endpoints
  if (requestUrl.pathname.startsWith('/api')) {
    // Health status check
    if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
      sendJson(response, 200, { status: 'ok', activeClients: getActiveClientsCount() });
      return;
    }

    const handled = await handleTelemetryRoutes(
      request,
      response,
      requestUrl,
      readJson,
      sendJson,
      masterStadiumData,
      broadcastTelemetry,
      canRequest,
      getClientAddress
    );
    if (handled) return;
  }

  // 4. Handle static files serving (SPA fallback)
  let filePath = join(DIST_DIR, requestUrl.pathname);
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
  } catch {
    try {
      const indexPath = join(DIST_DIR, 'index.html');
      const content = await fs.readFile(indexPath);
      setSecurityHeaders(response);
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(content);
    } catch {
      sendJson(response, 404, { error: 'Not found.' });
    }
  }
});

// Initialize WebSocket integration
initWebSocketServer(server);

// Boot DB seeds and start server
initDb().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(` FIFA Copilot 2026 enterprise backend running on http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error("Database seed failure, shutting down.", err);
  process.exit(1);
});
