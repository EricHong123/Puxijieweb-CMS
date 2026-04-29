import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { requireAuth } from '../lib/auth';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data });
});

app.get('/:key', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', c.req.param('key'))
    .single();
  if (error) return c.json({ success: false, error: 'Not found' }, 404);
  return c.json({ success: true, data });
});

app.put('/:key', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { value } = await c.req.json();
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: c.req.param('key'), value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: null });
});

export { app as siteSettingsRoutes };
