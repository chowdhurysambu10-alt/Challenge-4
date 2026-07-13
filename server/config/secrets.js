import crypto from 'node:crypto';

export const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
