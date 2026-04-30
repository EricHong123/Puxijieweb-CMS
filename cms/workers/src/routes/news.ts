import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { createNewsSchema, updateNewsSchema } from '../schemas/news';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const locale = c.req.query('locale') || 'en';
  const published = c.req.query('published');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');

  let query = supabase
    .from('news_articles')
    .select('*', { count: 'exact' })
    .eq('locale', locale)
    .order('date', { ascending: false });

  if (published === 'true') query = query.eq('is_published', true);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.range(from, from + limit - 1);
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: { items: data, total: count || 0, page, limit } });
});

app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from('news_articles').select('*').eq('id', c.req.param('id')).single();
  if (error) return c.json({ success: false, error: 'Not found' }, 404);
  return c.json({ success: true, data });
});

app.post('/', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const parsed = createNewsSchema.safeParse(body);
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400);

  const { data, error } = await supabase.from('news_articles').insert(parsed.data).select().single();
  if (error) return c.json({ success: false, error: error.message }, 409);
  return c.json({ success: true, data }, 201);
});

app.put('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const parsed = updateNewsSchema.safeParse(body);
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400);

  const { error } = await supabase
    .from('news_articles')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', c.req.param('id'));
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: { id: c.req.param('id') } });
});

app.patch('/:id/publish', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { is_published } = await c.req.json();
  await supabase.from('news_articles').update({ is_published, updated_at: new Date().toISOString() }).eq('id', c.req.param('id'));
  return c.json({ success: true });
});

app.delete('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { error } = await supabase.from('news_articles').delete().eq('id', c.req.param('id'));
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: null });
});

export { app as newsRoutes };
