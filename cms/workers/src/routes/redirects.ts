import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import { getSupabase, type Env } from '../lib/supabase';

const app = new Hono<{ Bindings: Env }>();

// GET / — list all redirects
app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '50');
  const active = c.req.query('active');

  let query = supabase
    .from('redirects')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (active === 'true') query = query.eq('is_active', true);
  if (active === 'false') query = query.eq('is_active', false);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.range(from, from + limit - 1);

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: { items: data, total: count || 0, page, limit } });
});

// POST / — create redirect
app.post('/', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const { source_path, target_path, status_code } = body;

  if (!source_path || !target_path) {
    return c.json({ success: false, error: 'source_path and target_path are required' }, 400);
  }

  const { data, error } = await supabase
    .from('redirects')
    .insert({
      source_path,
      target_path,
      status_code: status_code || 301,
    })
    .select()
    .single();

  if (error) return c.json({ success: false, error: error.message }, 409);
  return c.json({ success: true, data }, 201);
});

// PUT /:id — update redirect
app.put('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const { source_path, target_path, status_code, is_active } = body;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (source_path !== undefined) update.source_path = source_path;
  if (target_path !== undefined) update.target_path = target_path;
  if (status_code !== undefined) update.status_code = status_code;
  if (is_active !== undefined) update.is_active = is_active;

  const { error } = await supabase
    .from('redirects')
    .update(update)
    .eq('id', c.req.param('id'));

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true });
});

// DELETE /:id — delete redirect
app.delete('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { error } = await supabase
    .from('redirects')
    .delete()
    .eq('id', c.req.param('id'));

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: null });
});

export { app as redirectRoutes };
