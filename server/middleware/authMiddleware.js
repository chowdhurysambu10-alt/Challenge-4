import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/secrets.js';

export function getAuthUser(request) {
  const authHeader = request.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function checkRole(request, allowedRoles) {
  const user = getAuthUser(request);
  if (!user) {
    return { valid: false, status: 401, error: 'Unauthorized: Authentication token is missing or invalid.' };
  }
  if (!allowedRoles.includes(user.role)) {
    return { valid: false, status: 403, error: 'Forbidden: You do not have permissions to perform this action.' };
  }
  return { valid: true, user };
}
