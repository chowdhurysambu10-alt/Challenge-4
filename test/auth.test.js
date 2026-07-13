import test from 'node:test';
import assert from 'node:assert/strict';
import { handleAuthRoutes } from '../server/routes/authRoutes.js';
import { handleTelemetryRoutes } from '../server/routes/telemetryRoutes.js';
import { initDb } from '../server/services/dbService.js';
import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../server/config/secrets.js';

function mockReadJson(data) {
  return () => Promise.resolve(data);
}

function mockSendJson(store) {
  return (res, code, payload) => {
    store.code = code;
    store.payload = payload;
  };
}

test('Auth Service integration tests', async (t) => {
  await initDb();

  await t.test('POST /api/auth/login invalid credentials should reject', async () => {
    const store = {};
    const req = { method: 'POST' };
    const res = {};
    const url = new URL('http://localhost/api/auth/login');
    const read = mockReadJson({ email: 'fan@fifa.com', password: 'wrongpassword' });
    const send = mockSendJson(store);

    await handleAuthRoutes(req, res, url, read, send);

    assert.equal(store.code, 401);
    assert.match(store.payload.error, /Invalid email or password/);
  });

  await t.test('POST /api/auth/login correct credentials should authorize and return JWT', async () => {
    const store = {};
    const req = { method: 'POST' };
    const res = {};
    const url = new URL('http://localhost/api/auth/login');
    const read = mockReadJson({ email: 'fan@fifa.com', password: 'fan123' });
    const send = mockSendJson(store);

    await handleAuthRoutes(req, res, url, read, send);

    assert.equal(store.code, 200);
    assert.ok(store.payload.token);
    assert.equal(store.payload.user.role, 'fan');

    // Verify token validity
    const decoded = jwt.verify(store.payload.token, JWT_SECRET);
    assert.equal(decoded.email, 'fan@fifa.com');
    assert.equal(decoded.role, 'fan');
  });

  await t.test('POST /api/auth/google should register SSO and login', async () => {
    const store = {};
    const req = { method: 'POST' };
    const res = {};
    const url = new URL('http://localhost/api/auth/google');
    const read = mockReadJson({ email: 'new.user@gmail.com', name: 'Google SSO Account', role: 'fan' });
    const send = mockSendJson(store);

    await handleAuthRoutes(req, res, url, read, send);

    assert.equal(store.code, 200);
    assert.ok(store.payload.token);
    assert.equal(store.payload.user.name, 'Google SSO Account');
  });
});

test('Role-Based Access Control integration tests', async (t) => {
  await t.test('POST /api/telemetry/emergency with FAN token should block (403 Forbidden)', async () => {
    const fanToken = jwt.sign({ email: 'fan@fifa.com', role: 'fan' }, JWT_SECRET);
    const store = {};
    const req = {
      method: 'POST',
      headers: { 'authorization': `Bearer ${fanToken}` }
    };
    const res = {
      setHeader() {},
      writeHead() {},
      end() {}
    };
    const url = new URL('http://localhost/api/telemetry/emergency');
    const read = mockReadJson({ active: true, location: 'Zone A', type: 'fire', message: 'Evacuate' });
    const send = mockSendJson(store);

    const masterStadiumData = {
      emergencyState: { active: false },
      operationalInsights: [],
      stadiumStats: { activeAlerts: 0 }
    };

    await handleTelemetryRoutes(req, res, url, read, send, masterStadiumData, () => {}, () => true, () => '127.0.0.1');

    assert.equal(store.code, 403);
    assert.match(store.payload.error, /Forbidden: You do not have permissions/);
  });

  await t.test('POST /api/telemetry/emergency with ADMIN token should pass (200 OK)', async () => {
    const adminToken = jwt.sign({ email: 'admin@fifa.com', role: 'admin' }, JWT_SECRET);
    const store = {};
    const req = {
      method: 'POST',
      headers: { 'authorization': `Bearer ${adminToken}` }
    };
    const res = {
      setHeader() {},
      writeHead() {},
      end() {}
    };
    const url = new URL('http://localhost/api/telemetry/emergency');
    const read = mockReadJson({ active: true, location: 'Zone B Stand', type: 'fire', message: 'Evacuate immediately' });
    const send = mockSendJson(store);

    const masterStadiumData = {
      emergencyState: { active: false },
      operationalInsights: [],
      stadiumStats: { activeAlerts: 0 }
    };

    await handleTelemetryRoutes(req, res, url, read, send, masterStadiumData, () => {}, () => true, () => '127.0.0.1');

    assert.equal(store.code, 200);
    assert.equal(masterStadiumData.emergencyState.active, true);
    assert.equal(masterStadiumData.emergencyState.location, 'Zone B Stand');
  });
});
