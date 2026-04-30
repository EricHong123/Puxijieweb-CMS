import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { getVersions, getVersionSnapshot } from '../lib/versioning';

const app = new Hono<{ Bindings: Env }>();

// List versions for an entity
app.get('/:entityType/:entityId', requireAuth(), async (c) => {
  const { entityType, entityId } = c.req.param();
  if (!['product', 'news', 'page'].includes(entityType)) {
    return c.json({ success: false, error: 'Invalid entity type' }, 400);
  }
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const result = await getVersions(c.env, entityType, entityId, page, limit);
  if (!result.success) return c.json(result, 500);
  return c.json(result);
});

// Get a specific version snapshot
app.get('/:versionId/detail', requireAuth(), async (c) => {
  const result = await getVersionSnapshot(c.env, c.req.param('versionId'));
  if (!result.success) return c.json(result, 404);
  return c.json(result);
});

// Rollback: fetch version snapshot and apply it back
app.post('/:versionId/rollback', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const versionId = c.req.param('versionId');

  const snapshot = await getVersionSnapshot(c.env, versionId);
  if (!snapshot.success) return c.json(snapshot, 404);

  const { entity_type, entity_id, snapshot: data } = snapshot.data;

  // Apply snapshot based on entity type
  if (entity_type === 'product') {
    // Save current state as version first
    const { data: current } = await supabase
      .from('products')
      .select(`*, product_translations(*), product_specs(*)`)
      .eq('id', entity_id)
      .single();
    if (current) {
      const user = c.get('user');
      const { saveVersion } = await import('../lib/versioning');
      await saveVersion(c.env, 'product', entity_id, current as Record<string, unknown>, user.id);
    }

    // Restore product
    const { product_translations, product_specs, ...productFields } = data;
    const productRestore = { ...productFields };
    delete productRestore.id;
    await supabase.from('products').update(productRestore).eq('id', entity_id);

    // Restore translations
    if (product_translations) {
      for (const t of product_translations) {
        const { product_id, id: _tid, ...tdata } = t;
        await supabase.from('product_translations').upsert(
          { ...tdata, product_id: entity_id },
          { onConflict: 'product_id,locale' },
        );
      }
    }

    // Restore specs
    if (product_specs) {
      const { product_id, id: _sid, ...sdata } = product_specs;
      await supabase.from('product_specs').upsert(
        { ...sdata, product_id: entity_id },
        { onConflict: 'product_id' },
      );
    }
  } else if (entity_type === 'news') {
    const { data: current } = await supabase
      .from('news_articles').select('*').eq('id', entity_id).single();
    if (current) {
      const user = c.get('user');
      const { saveVersion } = await import('../lib/versioning');
      await saveVersion(c.env, 'news', entity_id, current as Record<string, unknown>, user.id);
    }
    const { id: _id, ...restore } = data;
    await supabase.from('news_articles').update(restore).eq('id', entity_id);
  } else if (entity_type === 'page') {
    const { data: current } = await supabase
      .from('pages').select(`*, page_translations(*)`).eq('id', entity_id).single();
    if (current) {
      const user = c.get('user');
      const { saveVersion } = await import('../lib/versioning');
      await saveVersion(c.env, 'page', entity_id, current as Record<string, unknown>, user.id);
    }
    const { page_translations, ...pageFields } = data;
    const pageRestore = { ...pageFields };
    delete pageRestore.id;
    await supabase.from('pages').update(pageRestore).eq('id', entity_id);
    if (page_translations) {
      for (const t of page_translations) {
        const { page_id, id: _tid, ...tdata } = t;
        await supabase.from('page_translations').upsert(
          { ...tdata, page_id: entity_id },
          { onConflict: 'page_id,locale' },
        );
      }
    }
  }

  return c.json({ success: true, data: { entity_type, entity_id } });
});

export { app as versionRoutes };
