import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import { getSupabase, type Env } from '../lib/supabase';

const app = new Hono<{ Bindings: Env }>();

// GET / — list all menus
app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('name');

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data });
});

// GET /:id — get menu with items tree
app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const locale = c.req.query('locale') || 'en';

  const { data: menu, error } = await supabase
    .from('menus')
    .select('*')
    .eq('id', c.req.param('id'))
    .single();

  if (error) return c.json({ success: false, error: 'Not found' }, 404);

  const { data: items, error: itemsError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('menu_id', menu.id)
    .eq('locale', locale)
    .order('sort_order');

  if (itemsError) return c.json({ success: false, error: itemsError.message }, 500);

  // Build tree structure from flat list
  const itemMap = new Map<string, any>();
  const roots: any[] = [];

  for (const item of items || []) {
    itemMap.set(item.id, { ...item, children: [] });
  }

  for (const item of items || []) {
    const node = itemMap.get(item.id);
    if (item.parent_id && itemMap.has(item.parent_id)) {
      itemMap.get(item.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  }

  return c.json({
    success: true,
    data: { ...menu, items: roots },
  });
});

// POST / — create menu
app.post('/', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const { slug, name } = body;

  if (!slug || !name) {
    return c.json({ success: false, error: 'slug and name are required' }, 400);
  }

  const { data, error } = await supabase
    .from('menus')
    .insert({ slug, name })
    .select()
    .single();

  if (error) return c.json({ success: false, error: error.message }, 409);
  return c.json({ success: true, data }, 201);
});

// PUT /:id — update menu
app.put('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();

  const { data, error } = await supabase
    .from('menus')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', c.req.param('id'))
    .select()
    .single();

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data });
});

// DELETE /:id — delete menu
app.delete('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { error } = await supabase
    .from('menus')
    .delete()
    .eq('id', c.req.param('id'));

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: null });
});

// POST /:id/items — add menu item
app.post('/:id/items', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const { label, url, locale, parent_id } = body;

  if (!label || !url || !locale) {
    return c.json({ success: false, error: 'label, url, and locale are required' }, 400);
  }

  // Get next sort_order
  const { data: last } = await supabase
    .from('menu_items')
    .select('sort_order')
    .eq('menu_id', c.req.param('id'))
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (last?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      menu_id: c.req.param('id'),
      parent_id: parent_id || null,
      locale,
      label,
      url,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data }, 201);
});

// PUT /items/:itemId — update menu item
app.put('/items/:itemId', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const allowed = ['label', 'url', 'parent_id', 'sort_order'];
  const update: Record<string, unknown> = {};
  for (const k of allowed) {
    if (body[k] !== undefined) update[k] = body[k];
  }

  const { error } = await supabase
    .from('menu_items')
    .update(update)
    .eq('id', c.req.param('itemId'));

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true });
});

// DELETE /items/:itemId — delete menu item
app.delete('/items/:itemId', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', c.req.param('itemId'));

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: null });
});

// PUT /:id/reorder — batch reorder items
app.put('/:id/reorder', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { items } = await c.req.json();

  if (!Array.isArray(items)) {
    return c.json({ success: false, error: 'items array required' }, 400);
  }

  for (const item of items) {
    await supabase
      .from('menu_items')
      .update({ sort_order: item.sort_order, parent_id: item.parent_id || null })
      .eq('id', item.id);
  }

  return c.json({ success: true });
});

export { app as menuRoutes };
