import { getUserByEmail, createUser } from '../services/dbService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/secrets.js';

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
      console.error("Login route failed:", err);
      sendJson(response, 500, { error: 'Internal Server Error' });
    }
    return true;
  }

  // POST /api/auth/google
  if (request.method === 'POST' && requestUrl.pathname === '/api/auth/google') {
    try {
      const { email, name } = await readJson(request);
      
      if (!email) {
        sendJson(response, 400, { error: 'Google authentication requires email.' });
        return true;
      }

      // Find or create Google SSO user in database. Never trust client-supplied roles.
      let user = await getUserByEmail(email);
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const fallbackPass = Math.random().toString(36).slice(-8);
        const passHash = await bcrypt.hash(fallbackPass, salt);
        user = await createUser(email, passHash, 'fan', name || email.split('@')[0]);
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
      console.error("Google login failed:", err);
      sendJson(response, 500, { error: 'Internal Server Error' });
    }
    return true;
  }

  return false;
}
