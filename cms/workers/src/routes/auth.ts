import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { createToken, type AuthUser } from '../lib/auth';
import { createRateLimiter } from '../lib/rate-limit';

const loginLimiter = createRateLimiter({ windowMs: 15_000, maxRequests: 5 });

const app = new Hono<{ Bindings: Env }>();

app.post('/login', async (c) => {
  const clientIp = c.req.header('CF-Connecting-IP') || 'unknown';
  const { allowed, retryAfter } = loginLimiter(clientIp);
  if (!allowed) {
    return c.json({ success: false, error: `请求过于频繁，请 ${retryAfter} 秒后重试` }, 429);
  }

  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ success: false, error: 'Email and password required' }, 400);
  }

  const supabase = getSupabase(c.env);
  const { data: userRow, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single();

  if (error || !userRow) {
    return c.json({ success: false, error: 'Invalid email or password' }, 401);
  }

  // Verify password using Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return c.json({ success: false, error: 'Invalid email or password' }, 401);
  }

  const authUser: AuthUser = {
    id: userRow.id,
    email: userRow.email,
    role: userRow.role,
  };

  const token = await createToken(c.env, authUser);

  return c.json({
    success: true,
    data: { token, user: authUser },
  });
});

app.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Missing authorization header' }, 401);
  }
  const { verifyToken } = await import('../lib/auth');
  const user = await verifyToken(c.env, authHeader.slice(7));
  if (!user) {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
  return c.json({ success: true, data: user });
});

export { app as authRoutes };
