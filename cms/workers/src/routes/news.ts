import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { createNewsSchema, updateNewsSchema } from '../schemas/news';
import { saveVersion } from '../lib/versioning';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const locale = c.req.query('locale') || 'en';
  const published = c.req.query('published');
  const category = c.req.query('category');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');

  const select = category
    ? '*, news_article_categories!left(category_id)'
    : '*';

  let query = supabase
    .from('news_articles')
    .select(select, { count: 'exact' })
    .eq('locale', locale)
    .order('date', { ascending: false });

  if (published === 'true') query = query.eq('is_published', true);

  if (category) {
    const { data: catData } = await supabase
      .from('news_categories')
      .select('id')
      .eq('slug', category)
      .single();

    if (catData) {
      query = query.eq('news_article_categories.category_id', catData.id);
    }
  }

  const from = (page - 1) * limit;
  const { data, error, count } = await query.range(from, from + limit - 1);
  if (error) return c.json({ success: false, error: error.message }, 500);

  const items = (data || []).map((a: any) => {
    const { news_article_categories, ...rest } = a;
    return {
      ...rest,
      category_ids: (news_article_categories || []).map((c: any) => c.category_id),
    };
  });

  return c.json({ success: true, data: { items, total: count || 0, page, limit } });
});

app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('id', c.req.param('id'))
    .single();
  if (error) return c.json({ success: false, error: 'Not found' }, 404);

  // Fetch categories separately — safe if table doesn't exist yet
  let category_ids: string[] = [];
  try {
    const { data: cats } = await supabase
      .from('news_article_categories')
      .select('category_id')
      .eq('article_id', c.req.param('id'));
    category_ids = (cats || []).map((c: any) => c.category_id);
  } catch { /* table may not exist yet */ }

  return c.json({ success: true, data: { ...data, category_ids } });
});

app.post('/', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const parsed = createNewsSchema.safeParse(body);
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400);

  const { category_ids, ...articleData } = parsed.data;
  const { data, error } = await supabase.from('news_articles').insert(articleData).select().single();
  if (error) return c.json({ success: false, error: error.message }, 409);

  if (category_ids && category_ids.length > 0) {
    try {
      await supabase.from('news_article_categories').insert(
        category_ids.map((cid: string) => ({ article_id: data.id, category_id: cid }))
      );
    } catch { /* table may not exist yet */ }
  }

  return c.json({ success: true, data: { ...data, category_ids: category_ids || [] } }, 201);
});

app.put('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const entityId = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateNewsSchema.safeParse(body);
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400);

  const { category_ids, ...updateData } = parsed.data;

  // Save version snapshot before update
  const { data: prev } = await supabase
    .from('news_articles')
    .select('*')
    .eq('id', entityId)
    .single();
  if (prev) {
    const user = c.get('user');
    await saveVersion(c.env, 'news', entityId, prev as Record<string, unknown>, user.id);
  }

  const { error } = await supabase
    .from('news_articles')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', entityId);
  if (error) return c.json({ success: false, error: error.message }, 500);

  // Sync categories: delete existing, re-insert
  if (category_ids !== undefined) {
    try {
      await supabase.from('news_article_categories').delete().eq('article_id', entityId);
      if (category_ids.length > 0) {
        await supabase.from('news_article_categories').insert(
          category_ids.map((cid: string) => ({ article_id: entityId, category_id: cid }))
        );
      }
    } catch { /* table may not exist yet */ }
  }

  return c.json({ success: true, data: { id: entityId } });
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
