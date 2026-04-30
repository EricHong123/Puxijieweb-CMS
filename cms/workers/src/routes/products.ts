import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { createProductSchema, updateProductSchema } from '../schemas/product';
import { saveVersion } from '../lib/versioning';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const category = c.req.query('category');
  const locale = c.req.query('locale') || 'en';
  const published = c.req.query('published');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');

  let query = supabase
    .from('products')
    .select(`*, product_translations!inner(*), product_images(media_id, sort_order, is_primary, media(*))`, { count: 'exact' });

  if (category) query = query.eq('category', category);
  if (published === 'true') query = query.eq('is_published', true);

  // Filter translations by locale
  query = query.eq('product_translations.locale', locale);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to).order('sort_order', { ascending: true });

  const { data, error, count } = await query;
  if (error) return c.json({ success: false, error: error.message }, 500);

  return c.json({ success: true, data: { items: data, total: count || 0, page, limit } });
});

app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from('products')
    .select(`*, product_translations(*), product_specs(*), product_images(media_id, sort_order, is_primary, media(*))`)
    .eq('id', c.req.param('id'))
    .single();

  if (error) return c.json({ success: false, error: 'Product not found' }, 404);
  return c.json({ success: true, data });
});

app.post('/', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.flatten() }, 400);
  }

  const { translations, specs, downloads, ...product } = parsed.data;

  // Create product
  const { data: created, error } = await supabase
    .from('products')
    .insert({ ...product, downloads: downloads || [] })
    .select()
    .single();

  if (error) return c.json({ success: false, error: error.message }, 409);

  // Create translations
  const { error: trError } = await supabase
    .from('product_translations')
    .insert(translations.map((t) => ({ ...t, product_id: created.id })));

  if (trError) return c.json({ success: false, error: trError.message }, 500);

  // Create specs if provided
  if (specs) {
    await supabase.from('product_specs').insert({ ...specs, product_id: created.id });
  }

  return c.json({ success: true, data: created }, 201);
});

app.put('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const entityId = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.flatten() }, 400);
  }

  // Save version snapshot before update
  const { data: prev } = await supabase
    .from('products')
    .select(`*, product_translations(*), product_specs(*)`)
    .eq('id', entityId)
    .single();
  if (prev) {
    const user = c.get('user');
    await saveVersion(c.env, 'product', entityId, prev as Record<string, unknown>, user.id);
  }

  const { translations, specs, downloads, ...product } = parsed.data;

  const updateData: Record<string, unknown> = { ...product, updated_at: new Date().toISOString() };
  if (downloads !== undefined) updateData.downloads = downloads;

  if (Object.keys(product).length > 0 || downloads !== undefined) {
    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', entityId);
    if (error) return c.json({ success: false, error: error.message }, 500);
  }

  if (translations) {
    for (const t of translations) {
      await supabase
        .from('product_translations')
        .upsert({ ...t, product_id: entityId }, { onConflict: 'product_id,locale' });
    }
  }

  if (specs) {
    await supabase
      .from('product_specs')
      .upsert({ ...specs, product_id: entityId }, { onConflict: 'product_id' });
  }

  return c.json({ success: true, data: { id: entityId } });
});

app.delete('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { error } = await supabase.from('products').delete().eq('id', c.req.param('id'));
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: null });
});

app.patch('/:id/publish', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { is_published } = await c.req.json();
  const { error } = await supabase
    .from('products')
    .update({ is_published, updated_at: new Date().toISOString() })
    .eq('id', c.req.param('id'));
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: { is_published } });
});

// Image associations
app.post('/:id/images', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { media_id, sort_order = 0, is_primary = false } = await c.req.json();
  const { error } = await supabase
    .from('product_images')
    .insert({ product_id: c.req.param('id'), media_id, sort_order, is_primary });
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: null }, 201);
});

app.delete('/:id/images/:imageId', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', c.req.param('imageId'));
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: null });
});

export { app as productRoutes };
