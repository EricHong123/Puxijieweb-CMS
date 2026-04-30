import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { createPageSchema, updatePageSchema } from '../schemas/page';
import { saveVersion } from '../lib/versioning';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const locale = c.req.query('locale') || 'en';
  const pageType = c.req.query('page_type');

  let query = supabase
    .from('pages')
    .select(`*, page_translations!inner(*)`);

  if (pageType) query = query.eq('page_type', pageType);
  query = query.eq('page_translations.locale', locale).order('updated_at', { ascending: false });

  const { data, error } = await query;
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data });
});

app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from('pages')
    .select(`*, page_translations(*)`)
    .eq('id', c.req.param('id'))
    .single();
  if (error) return c.json({ success: false, error: 'Not found' }, 404);
  return c.json({ success: true, data });
});

app.post('/', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const parsed = createPageSchema.safeParse(body);
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400);

  const { translations, ...page } = parsed.data;
  const { data: created, error } = await supabase
    .from('pages').insert(page).select().single();
  if (error) return c.json({ success: false, error: error.message }, 409);

  await supabase.from('page_translations').insert(
    translations.map((t) => ({ ...t, page_id: created.id }))
  );
  return c.json({ success: true, data: created }, 201);
});

app.put('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const entityId = c.req.param('id');
  const body = await c.req.json();
  const parsed = updatePageSchema.safeParse(body);
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400);

  // Save version snapshot before update
  const { data: prev } = await supabase
    .from('pages')
    .select(`*, page_translations(*)`)
    .eq('id', entityId)
    .single();
  if (prev) {
    const user = c.get('user');
    await saveVersion(c.env, 'page', entityId, prev as Record<string, unknown>, user.id);
  }

  const { translations, ...page } = parsed.data;
  if (Object.keys(page).length > 0) {
    await supabase.from('pages').update({ ...page, updated_at: new Date().toISOString() }).eq('id', entityId);
  }
  if (translations) {
    for (const t of translations) {
      await supabase.from('page_translations').upsert({ ...t, page_id: entityId }, { onConflict: 'page_id,locale' });
    }
  }
  return c.json({ success: true, data: { id: entityId } });
});

app.patch('/:id/publish', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { is_published } = await c.req.json();
  await supabase.from('pages').update({ is_published, updated_at: new Date().toISOString() }).eq('id', c.req.param('id'));
  return c.json({ success: true });
});

app.delete('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  await supabase.from('pages').delete().eq('id', c.req.param('id'));
  return c.json({ success: true, data: null });
});

export { app as pageRoutes };
