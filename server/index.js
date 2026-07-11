import { createServer } from 'node:http';
import { validateChatRequest, requestAssistant } from './chatService.js';

const PORT = Number(process.env.PORT || 8787);
const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestWindows = new Map();

function setSecurityHeaders(response) {
  response.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Content-Type-Options', 'nosniff');
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

  if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (request.method !== 'POST' || requestUrl.pathname !== '/api/chat') {
    sendJson(response, 404, { error: 'Not found.' });
    return;
  }

  if (request.headers['content-type']?.split(';')[0] !== 'application/json') {
    sendJson(response, 415, { error: 'Content-Type must be application/json.' });
    return;
  }

  if (!canRequest(getClientAddress(request))) {
    sendJson(response, 429, { error: 'Too many assistant requests. Please wait and try again.' });
    return;
  }

  try {
    const validation = validateChatRequest(await readJson(request));
    if (!validation.valid) {
      sendJson(response, 400, { error: validation.error });
      return;
    }

    const assistantResponse = await requestAssistant(validation.value, { apiKey: process.env.ANTHROPIC_API_KEY });
    if (!assistantResponse.available) {
      sendJson(response, 503, { error: assistantResponse.reason });
      return;
    }

    sendJson(response, 200, assistantResponse);
  } catch {
    sendJson(response, 502, { error: 'The live assistant is unavailable. Try the local demo assistant instead.' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`FIFA Copilot API listening on http://127.0.0.1:${PORT}`);
});
