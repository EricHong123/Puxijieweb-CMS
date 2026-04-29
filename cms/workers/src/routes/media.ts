import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { requireAuth } from '../lib/auth';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const mimeType = c.req.query('type');

  let query = supabase
    .from('media')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (mimeType) query = query.ilike('mime_type', `${mimeType}%`);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: { items: data, total: count || 0, page, limit } });
});

app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', c.req.param('id'))
    .single();
  if (error) return c.json({ success: false, error: 'Not found' }, 404);
  return c.json({ success: true, data });
});

app.post('/upload', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const formData = await c.req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return c.json({ success: false, error: 'File required' }, 400);
  }
  const fileObj = file as unknown as { name: string; type: string; arrayBuffer(): Promise<ArrayBuffer> };

  const originalFilename = fileObj.name;
  const mimeType = fileObj.type;
  const buffer = await fileObj.arrayBuffer();
  const fileSize = buffer.byteLength;

  const timestamp = Date.now();
  const safeFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '-');
  const storagePath = `products/${timestamp}-${safeFilename}`;

  // Upload original to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(storagePath, buffer, { contentType: mimeType, upsert: false });

  if (uploadError) return c.json({ success: false, error: uploadError.message }, 500);

  // Get public URL
  const { data: urlData } = supabase.storage.from('media').getPublicUrl(storagePath);

  // Record in media table
  const { data: mediaRecord, error: dbError } = await supabase
    .from('media')
    .insert({
      original_filename: originalFilename,
      storage_path: storagePath,
      mime_type: mimeType,
      file_size_bytes: fileSize,
      variants: { publicUrl: urlData.publicUrl },
    })
    .select()
    .single();

  if (dbError) return c.json({ success: false, error: dbError.message }, 500);

  return c.json({ success: true, data: mediaRecord }, 201);
});

app.delete('/:id', requireAuth(), async (c) => {
  const supabase = getSupabase(c.env);
  const { data: media } = await supabase
    .from('media')
    .select('storage_path')
    .eq('id', c.req.param('id'))
    .single();

  if (media) {
    await supabase.storage.from('media').remove([media.storage_path]);
  }

  const { error } = await supabase.from('media').delete().eq('id', c.req.param('id'));
  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: null });
});

export { app as mediaRoutes };
