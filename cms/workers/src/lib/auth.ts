import { createMiddleware } from 'hono/factory';
import { jwtVerify, SignJWT } from 'jose';
import type { Env } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'editor';
}

export async function createToken(env: Env, user: AuthUser): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  return new SignJWT({ sub: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(env: Env, token: string): Promise<AuthUser | null> {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'editor',
    };
  } catch {
    return null;
  }
}

export function requireAuth() {
  return createMiddleware<{ Bindings: Env; Variables: { user: AuthUser } }>(async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Missing authorization header' }, 401);
    }
    const token = authHeader.slice(7);
    const user = await verifyToken(c.env, token);
    if (!user) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 401);
    }
    c.set('user', user);
    await next();
  });
}

export function requireAdmin() {
  return createMiddleware<{ Variables: { user: AuthUser } }>(async (c, next) => {
    const user = c.get('user');
    if (user.role !== 'admin') {
      return c.json({ success: false, error: 'Admin access required' }, 403);
    }
    await next();
  });
}
