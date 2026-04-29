import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { createFaqSchema } from '../schemas/faq';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const locale = c.req.query('locale') || 'en';

  const { data, error } = await supabase
    .from('faq_sections')
    .select('*')
    .eq('locale', locale)
    .order('sort_order', { ascending: true });

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data });
});

app.put('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const { error } = await supabase
    .from('faq_sections')
    .update(body)
    .eq('id', c.req.param('id'));
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: null });
});

app.post('/', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const parsed = createFaqSchema.safeParse(body);
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400);

  const { data, error } = await supabase.from('faq_sections').insert(parsed.data).select().single();
  if (error) return c.json({ success: false, error: error.message }, 409);
  return c.json({ success: true, data }, 201);
});

app.delete('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  await supabase.from('faq_sections').delete().eq('id', c.req.param('id'));
  return c.json({ success: true, data: null });
});

export { app as faqRoutes };
