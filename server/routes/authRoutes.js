import { getUserByEmail, createUser } from '../services/dbService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fifa-copilot-jwt-super-secret-key-2026';

export async function handleAuthRoutes(request, response, requestUrl, readJson, sendJson) {
  // POST /api/auth/login
  if (request.method === 'POST' && requestUrl.pathname === '/api/auth/login') {
    try {
      const { email, password } = await readJson(request);
      if (!email || !password) {
        sendJson(response, 400, { error: 'Email and password are required.' });
        return true;
      }

      const user = await getUserByEmail(email);
      if (!user) {
        sendJson(response, 401, { error: 'Invalid email or password.' });
        return true;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        sendJson(response, 401, { error: 'Invalid email or password.' });
        return true;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      sendJson(response, 200, {
        token,
        user: { email: user.email, role: user.role, name: user.name }
      });
    } catch (err) {
      sendJson(response, 500, { error: 'Login service failed: ' + err.message });
    }
    return true;
  }

  // POST /api/auth/google
  if (request.method === 'POST' && requestUrl.pathname === '/api/auth/google') {
    try {
      const { email, name, role } = await readJson(request);
      
      if (!email) {
        sendJson(response, 400, { error: 'Google authentication requires email.' });
        return true;
      }

      // Find or create Google SSO user in database
      let user = await getUserByEmail(email);
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const fallbackPass = Math.random().toString(36).slice(-8);
        const passHash = await bcrypt.hash(fallbackPass, salt);
        user = await createUser(email, passHash, role || 'fan', name || email.split('@')[0]);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      sendJson(response, 200, {
        token,
        user: { email: user.email, role: user.role, name: user.name }
      });
    } catch (err) {
      sendJson(response, 500, { error: 'Google login failed: ' + err.message });
    }
    return true;
  }

  return false;
}
