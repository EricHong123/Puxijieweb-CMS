import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';

const app = new Hono<{ Bindings: Env }>();

// GET /api/v1/analytics/overview — summary for dashboard
app.get('/overview', async (c) => {
  const supabase = getSupabase(c.env);

  // Get pageview counts from our tracking table
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: pageviews, error } = await supabase
    .from('analytics_pageviews')
    .select('*')
    .gte('created_at', thirtyDaysAgo);

  if (error) {
    return c.json({
      success: true,
      data: {
        total_visitors: 0,
        total_pageviews: 0,
        avg_time_on_site: 0,
        bounce_rate: 0,
        period: 'last_30_days',
        source: 'none',
      },
    });
  }

  const rows = pageviews || [];
  const totalPageviews = rows.length;

  // Group by session_id
  const sessions: Record<string, { count: number; first: number; last: number }> = {};
  for (const pv of rows) {
    const sid = pv.session_id || 'no-session';
    const ts = new Date(pv.created_at).getTime();
    if (!sessions[sid]) {
      sessions[sid] = { count: 0, first: ts, last: ts };
    }
    sessions[sid].count++;
    if (ts < sessions[sid].first) sessions[sid].first = ts;
    if (ts > sessions[sid].last) sessions[sid].last = ts;
  }

  const sessionList = Object.values(sessions);
  const uniqueSessions = sessionList.length;
  const bouncedSessions = sessionList.filter((s) => s.count === 1).length;
  const bounceRate = uniqueSessions > 0 ? Math.round((bouncedSessions / uniqueSessions) * 100) : 0;

  // Avg time on site: mean of (last - first) for sessions with 2+ pageviews
  const multiPageSessions = sessionList.filter((s) => s.count >= 2);
  const totalSpanMs = multiPageSessions.reduce((sum, s) => sum + (s.last - s.first), 0);
  const avgTimeSeconds = multiPageSessions.length > 0
    ? Math.round(totalSpanMs / multiPageSessions.length / 1000)
    : 0;

  return c.json({
    success: true,
    data: {
      total_visitors: uniqueSessions,
      total_pageviews: totalPageviews,
      avg_time_on_site: avgTimeSeconds,
      bounce_rate: bounceRate,
      period: 'last_30_days',
      source: 'self-hosted',
    },
  });
});

// GET /api/v1/analytics/pageviews — time series data
app.get('/pageviews', async (c) => {
  const supabase = getSupabase(c.env);
  const start = c.req.query('start') || '30daysAgo';
  const end = c.req.query('end') || 'today';
  const days = c.req.query('days') || '30';

  const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('analytics_pageviews')
    .select('created_at')
    .gte('created_at', startDate)
    .order('created_at');

  // Group by day
  const byDay: Record<string, number> = {};
  const now = new Date();
  for (let i = parseInt(days) - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    byDay[d.toISOString().split('T')[0]] = 0;
  }

  for (const pv of data || []) {
    const day = pv.created_at?.split('T')[0];
    if (day && byDay[day] !== undefined) byDay[day]++;
  }

  const points = Object.entries(byDay).map(([date, count]) => ({ date, count }));

  return c.json({ success: true, data: points });
});

// GET /api/v1/analytics/top-pages
app.get('/top-pages', async (c) => {
  const supabase = getSupabase(c.env);
  const limit = parseInt(c.req.query('limit') || '20');
  const days = c.req.query('days') || '30';

  const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('analytics_pageviews')
    .select('path')
    .gte('created_at', startDate);

  // Count by path
  const counts: Record<string, number> = {};
  for (const pv of data || []) {
    counts[pv.path] = (counts[pv.path] || 0) + 1;
  }

  const items = Object.entries(counts)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);

  return c.json({ success: true, data: items });
});

// GET /api/v1/analytics/referrers
app.get('/referrers', async (c) => {
  const supabase = getSupabase(c.env);
  const limit = parseInt(c.req.query('limit') || '20');
  const days = c.req.query('days') || '30';

  const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('analytics_pageviews')
    .select('referrer')
    .gte('created_at', startDate);

  const counts: Record<string, number> = {};
  for (const pv of data || []) {
    const ref = pv.referrer || 'direct';
    counts[ref] = (counts[ref] || 0) + 1;
  }

  const items = Object.entries(counts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return c.json({ success: true, data: items });
});

// POST /api/v1/analytics/track — record a pageview
app.post('/track', async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const { path, referrer = '', session_id = '', user_agent = '' } = body;

  if (!path) {
    return c.json({ success: false, error: 'path is required' }, 400);
  }

  await supabase.from('analytics_pageviews').insert({
    path,
    referrer,
    session_id,
    user_agent,
  });

  return c.json({ success: true });
});

export { app as analyticsRoutes };
