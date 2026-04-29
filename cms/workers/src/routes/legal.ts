import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { updateLegalSchema } from '../schemas/legal';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const locale = c.req.query('locale') || 'en';

  const { data, error } = await supabase
    .from('legal_page_translations')
    .select('*')
    .eq('locale', locale);

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data });
});

app.get('/:pageType', async (c) => {
  const supabase = getSupabase(c.env);
  const locale = c.req.query('locale') || 'en';

  const { data, error } = await supabase
    .from('legal_page_translations')
    .select('*')
    .eq('page_type', c.req.param('pageType'))
    .eq('locale', locale)
    .single();

  if (error) return c.json({ success: false, error: 'Not found' }, 404);
  return c.json({ success: true, data });
});

app.put('/:pageType', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const parsed = updateLegalSchema.safeParse(body);
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400);

  for (const t of parsed.data.translations) {
    await supabase
      .from('legal_page_translations')
      .upsert({ ...t, page_type: c.req.param('pageType') }, { onConflict: 'page_type,locale' });
  }
  return c.json({ success: true, data: null });
});

export { app as legalRoutes };
