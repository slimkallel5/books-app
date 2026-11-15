import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AdminUser, UserRole } from '@maktaba/shared';

export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: UserRole;
  name: string;
}

export function signAccessToken(user: AdminUser): string {
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_TTL });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as unknown as AccessTokenPayload;
}

export function signRefreshToken(user: AdminUser): string {
  return jwt.sign({ sub: user.id, typ: 'refresh' }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
  });
}
