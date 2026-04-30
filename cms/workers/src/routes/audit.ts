import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { requireAuth } from '../lib/auth';

const app = new Hono<{ Bindings: Env }>();

app.get('/', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '50');

  const from = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: { items: data, total: count || 0, page, limit } });
});

export { app as auditRoutes };
