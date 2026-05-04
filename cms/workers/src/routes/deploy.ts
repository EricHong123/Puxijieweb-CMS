import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { requireAuth, requireAdmin } from '../lib/auth';

const app = new Hono<{ Bindings: Env }>();

app.post('/trigger', requireAuth(), requireAdmin(), async (c) => {
  const supabase = getSupabase(c.env);

  // Create deploy log
  const { data: log, error } = await supabase
    .from('deploy_logs')
    .insert({
      status: 'pending',
      triggered_by: c.get('user').id,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return c.json({ success: false, error: error.message }, 500);

  // Trigger GitHub Actions workflow via GitHub API
  const repo = c.env.GITHUB_REPO;
  const token = c.env.GITHUB_TOKEN;

  if (!token) {
    await supabase
      .from('deploy_logs')
      .update({ status: 'failed', error_message: 'GITHUB_TOKEN not configured' })
      .eq('id', log.id);
    return c.json({ success: false, error: 'GITHUB_TOKEN not configured' }, 500);
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/cms-deploy.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'User-Agent': 'puxijie-cms',
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'main' }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error('GitHub API error:', response.status, errBody.slice(0, 500));
      await supabase
        .from('deploy_logs')
        .update({ status: 'failed', error_message: `GitHub API ${response.status}: ${errBody.slice(0, 300)}` })
        .eq('id', log.id);
      return c.json({ success: false, error: 'Failed to trigger deploy' }, 500);
    }
  } catch (err) {
    await supabase
      .from('deploy_logs')
      .update({ status: 'failed', error_message: (err as Error).message })
      .eq('id', log.id);
    return c.json({ success: false, error: 'Failed to trigger deploy' }, 500);
  }

  return c.json({ success: true, data: { id: log.id, status: 'pending' } });
});

app.get('/status', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from('deploy_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return c.json({ success: true, data: null });
  return c.json({ success: true, data });
});

app.get('/history', async (c) => {
  const supabase = getSupabase(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const from = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('deploy_logs')
    .select('*', { count: 'exact' })
    .order('started_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) return c.json({ success: false, error: error.message }, 500);
  return c.json({ success: true, data: { items: data, total: count || 0, page, limit } });
});

app.get('/:id', async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from('deploy_logs')
    .select('*')
    .eq('id', c.req.param('id'))
    .single();

  if (error) return c.json({ success: false, error: 'Not found' }, 404);
  return c.json({ success: true, data });
});

export { app as deployRoutes };
