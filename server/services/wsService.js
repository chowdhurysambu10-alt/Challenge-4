import { WebSocketServer } from 'ws';

const wsClients = new Set();
let wss = null;

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    
    if (pathname === '/api/telemetry/ws' || pathname === '/api/telemetry/stream') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    wsClients.add(ws);
    console.log(` WebSocket connected: Active client count = ${wsClients.size}`);

    // Send immediate ping/pong check or welcome message
    ws.send(JSON.stringify({ type: 'info', message: 'Connected to FIFA Copilot Live Telemetry Engine' }));

    ws.on('close', () => {
      wsClients.delete(ws);
      console.log(` WebSocket disconnected: Active client count = ${wsClients.size}`);
    });

    ws.on('error', (err) => {
      console.error('WebSocket client socket error:', err);
      wsClients.delete(ws);
    });
  });
}

export function broadcastTelemetry(data) {
  if (wsClients.size === 0) return;
  const payload = JSON.stringify({ type: 'telemetry', data });
  
  for (const client of wsClients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(payload);
      } catch (err) {
        console.error('Failed to send payload to WebSocket client, removing...', err);
        wsClients.delete(client);
      }
    } else {
      wsClients.delete(client);
    }
  }
}

export function getActiveClientsCount() {
  return wsClients.size;
}
