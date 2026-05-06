import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../lib/auth';
import { createUserSchema, updateUserSchema } from '../schemas/user';
import { getSupabase, type Env } from '../lib/supabase';

const app = new Hono<{ Bindings: Env }>();

// All routes require auth + admin
app.use('*', requireAuth(), requireAdmin());

// GET / — list all users
app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from('users')
    .select('id, email, display_name, role, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({ success: true, data });
});

// GET /:id — single user
app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from('users')
    .select('id, email, display_name, role, is_active, created_at')
    .eq('id', c.req.param('id'))
    .single();

  if (error || !data) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  return c.json({ success: true, data });
});

// POST / — create user
app.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.flatten() }, 400);
  }

  const supabase = getSupabase(c.env);

  // Check if email already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', parsed.data.email)
    .single();

  if (existing) {
    return c.json({ success: false, error: 'Email already exists' }, 409);
  }

  // Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true, // auto-confirm email
  });

  if (authError) {
    return c.json({ success: false, error: `Auth creation failed: ${authError.message}` }, 500);
  }

  // Insert into our users table
  const { data: userRow, error: insertError } = await supabase
    .from('users')
    .insert({
      id: authData.user!.id,
      email: parsed.data.email,
      display_name: parsed.data.display_name,
      role: parsed.data.role,
      is_active: true,
    })
    .select('id, email, display_name, role, is_active, created_at')
    .single();

  if (insertError) {
    // Rollback: delete the Supabase Auth user
    await supabase.auth.admin.deleteUser(authData.user!.id);
    return c.json({ success: false, error: insertError.message }, 500);
  }

  return c.json({ success: true, data: userRow }, 201);
});

// PUT /:id — update user
app.put('/:id', async (c) => {
  const body = await c.req.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.flatten() }, 400);
  }

  const supabase = getSupabase(c.env);
  const now = new Date().toISOString();
  const updateData: Record<string, unknown> = { updated_at: now };

  if (parsed.data.email !== undefined) updateData.email = parsed.data.email;
  if (parsed.data.display_name !== undefined) updateData.display_name = parsed.data.display_name;
  if (parsed.data.role !== undefined) updateData.role = parsed.data.role;
  if (parsed.data.is_active !== undefined) updateData.is_active = parsed.data.is_active;

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', c.req.param('id'))
    .select('id, email, display_name, role, is_active, created_at')
    .single();

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({ success: true, data });
});

// DELETE /:id — soft-delete (deactivate)
app.delete('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const userId = c.req.param('id');

  const { error } = await supabase
    .from('users')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }

  return c.json({ success: true, data: { id: userId, deactivated: true } });
});

export { app as userRoutes };
