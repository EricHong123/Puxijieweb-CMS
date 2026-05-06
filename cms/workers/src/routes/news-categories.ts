import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import { getSupabase, type Env } from '../lib/supabase';

const app = new Hono<{ Bindings: Env }>();

// GET / — list categories with translations for a locale
app.get('/', async (c) => {
  const locale = c.req.query('locale') || 'en';
  const supabase = getSupabase(c.env);

  const { data, error } = await supabase
    .from('news_categories')
    .select('id, slug, news_category_translations!inner(name, locale)')
    .eq('news_category_translations.locale', locale)
    .order('slug');

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({
    success: true,
    data: (data || []).map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: c.news_category_translations?.[0]?.name || c.slug,
    })),
  });
});

// POST / — create category (auth required)
app.post('/', requireAuth(), async (c) => {
  const body = await c.req.json();
  const { slug, translations } = body; // translations: { en: string, fr?: string, vi?: string }

  if (!slug || !translations?.en) {
    return c.json({ success: false, error: 'slug and translations.en are required' }, 400);
  }

  const supabase = getSupabase(c.env);

  // Create category
  const { data: cat, error: catError } = await supabase
    .from('news_categories')
    .insert({ slug })
    .select('id')
    .single();

  if (catError) {
    return c.json({ success: false, error: catError.message }, 500);
  }

  // Insert translations
  const transRows = Object.entries(translations as Record<string, string>).map(([locale, name]) => ({
    category_id: cat.id,
    locale,
    name,
  }));

  const { error: transError } = await supabase
    .from('news_category_translations')
    .insert(transRows);

  if (transError) {
    // Rollback
    await supabase.from('news_categories').delete().eq('id', cat.id);
    return c.json({ success: false, error: transError.message }, 500);
  }

  return c.json({ success: true, data: { id: cat.id, slug } }, 201);
});

// PUT /:id — update category
app.put('/:id', requireAuth(), async (c) => {
  const body = await c.req.json();
  const supabase = getSupabase(c.env);

  if (body.slug) {
    await supabase.from('news_categories').update({ slug: body.slug }).eq('id', c.req.param('id'));
  }

  if (body.translations && typeof body.translations === 'object') {
    for (const [locale, name] of Object.entries(body.translations as Record<string, string>)) {
      await supabase
        .from('news_category_translations')
        .upsert({ category_id: c.req.param('id'), locale, name }, { onConflict: 'category_id,locale' });
    }
  }

  return c.json({ success: true });
});

// DELETE /:id — delete category
app.delete('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { error } = await supabase
    .from('news_categories')
    .delete()
    .eq('id', c.req.param('id'));

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({ success: true, data: { deleted: true } });
});

export { app as newsCategoryRoutes };
