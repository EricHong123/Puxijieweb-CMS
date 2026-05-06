import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';
import { runGAReport, buildOverviewReport, buildPageviewReport, buildTopPagesReport, buildCountryReport, buildDeviceReport, buildTrafficSourceReport } from '../lib/google-analytics';

const app = new Hono<{ Bindings: Env }>();

function gaEnabled(env: any): boolean {
  return !!(env.GA_CLIENT_ID && env.GA_CLIENT_SECRET && env.GA_REFRESH_TOKEN && env.GA_PROPERTY_ID);
}

function gaPropertyId(env: any): string {
  return env.GA_PROPERTY_ID || '';
}

// GET /api/v1/analytics/overview — summary for dashboard
app.get('/overview', async (c) => {
  // Try Google Analytics first
  if (gaEnabled(c.env)) {
    try {
      const report = await runGAReport(
        c.env as unknown as Record<string, unknown>,
        gaPropertyId(c.env),
        buildOverviewReport(),
      );

      // GA4 returns either totals or rows depending on request
      const row = report.totals?.[0] || report.rows?.[0];
      const m = row?.metricValues || [];
      const getMetric = (i: number) => parseInt(m[i]?.value || '0') || parseFloat(m[i]?.value || '0') || 0;

      const totalVisitors = Math.round(getMetric(0));
      const totalPageviews = Math.round(getMetric(1));
      const avgTimeOnSite = Math.round(getMetric(2));
      const bounceRate = Math.round(getMetric(3) * 100);

      return c.json({
        success: true,
        data: {
          total_visitors: totalVisitors,
          total_pageviews: totalPageviews,
          avg_time_on_site: avgTimeOnSite,
          bounce_rate: bounceRate,
          period: 'last_30_days',
          source: 'google-analytics',
        },
      });
    } catch (err: any) {
      console.error('GA overview error:', err.message);
      // Fall through to self-hosted
    }
  }

  // Fallback: self-hosted tracking
  const supabase = getSupabase(c.env);
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
  // Try Google Analytics first
  if (gaEnabled(c.env)) {
    try {
      const report = await runGAReport(
        c.env as unknown as Record<string, unknown>,
        gaPropertyId(c.env),
        buildPageviewReport(),
      );

      const points = (report.rows || []).map((row) => {
        const dims = row.dimensionValues || [];
        const mets = row.metricValues || [];
        // GA returns date as YYYYMMDD, convert to YYYY-MM-DD
        const rawDate = dims[0]?.value || '';
        const date = rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;
        return {
          date,
          count: parseInt(mets[0]?.value || '0'),
        };
      });

      return c.json({ success: true, data: points });
    } catch (err: any) {
      console.error('GA pageviews error:', err.message);
    }
  }

  // Fallback: self-hosted
  const supabase = getSupabase(c.env);
  const days = c.req.query('days') || '30';
  const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('analytics_pageviews')
    .select('created_at')
    .gte('created_at', startDate)
    .order('created_at');

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
  const limit = parseInt(c.req.query('limit') || '10');

  // Try Google Analytics first
  if (gaEnabled(c.env)) {
    try {
      const report = await runGAReport(
        c.env as unknown as Record<string, unknown>,
        gaPropertyId(c.env),
        buildTopPagesReport(limit),
      );

      const items = (report.rows || []).map((row) => {
        const dims = row.dimensionValues || [];
        const mets = row.metricValues || [];
        return {
          path: dims[0]?.value || '/',
          views: parseInt(mets[0]?.value || '0'),
        };
      });

      return c.json({ success: true, data: items });
    } catch (err: any) {
      console.error('GA top-pages error:', err.message);
    }
  }

  // Fallback: self-hosted
  const supabase = getSupabase(c.env);
  const days = c.req.query('days') || '30';
  const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('analytics_pageviews')
    .select('path')
    .gte('created_at', startDate);

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

// GET /api/v1/analytics/dashboard — CMS content stats for dashboard
app.get('/dashboard', async (c) => {
  const supabase = getSupabase(c.env);

  const [
    { count: productCount },
    { count: productPublished },
    { count: pageCount },
    { count: newsCount },
    { count: newsPublished },
    { count: mediaCount },
    { count: faqCount },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('pages').select('*', { count: 'exact', head: true }),
    supabase.from('news_articles').select('*', { count: 'exact', head: true }),
    supabase.from('news_articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('media').select('*', { count: 'exact', head: true }),
    supabase.from('faq_sections').select('*', { count: 'exact', head: true }),
  ]);

  // News this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const { count: newsThisMonth } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthStart.toISOString());

  // Published page count
  const { count: pagePublished } = await supabase
    .from('pages')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  // Locale coverage for pages
  const { data: pageTrs } = await supabase.from('page_translations').select('locale, page_id');
  const pageLocaleSet = new Map<string, Set<string>>();
  for (const t of pageTrs || []) {
    if (!pageLocaleSet.has(t.page_id)) pageLocaleSet.set(t.page_id, new Set());
    pageLocaleSet.get(t.page_id)!.add(t.locale);
  }
  const pageTotal = pageLocaleSet.size;
  const pageEn = [...pageLocaleSet.values()].filter((s) => s.has('en')).length;
  const pageFr = [...pageLocaleSet.values()].filter((s) => s.has('fr')).length;
  const pageVi = [...pageLocaleSet.values()].filter((s) => s.has('vi')).length;

  // Locale coverage for news
  const { data: newsLocales } = await supabase.from('news_articles').select('locale');
  const newsLocaleCounts: Record<string, number> = {};
  for (const n of newsLocales || []) {
    newsLocaleCounts[n.locale] = (newsLocaleCounts[n.locale] || 0) + 1;
  }

  // Scheduled publishes (not yet published, scheduled in future)
  const now = new Date().toISOString();
  const { data: scheduledNews } = await supabase
    .from('news_articles')
    .select('id, title, slug, scheduled_publish_at')
    .not('scheduled_publish_at', 'is', null)
    .gte('scheduled_publish_at', now)
    .order('scheduled_publish_at', { ascending: true })
    .limit(5);

  const { data: scheduledPages } = await supabase
    .from('pages')
    .select('id, slug, scheduled_publish_at')
    .not('scheduled_publish_at', 'is', null)
    .gte('scheduled_publish_at', now)
    .order('scheduled_publish_at', { ascending: true })
    .limit(5);

  // Recent activity from audit_logs
  const { data: recentActivity } = await supabase
    .from('audit_logs')
    .select('user_email, action, entity_type, entity_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  // Content type distribution
  const { data: pageTypes } = await supabase.from('pages').select('page_type');

  const contentTypes: Record<string, number> = {
    products: productCount || 0,
    news: newsCount || 0,
    faq: faqCount || 0,
  };
  for (const p of pageTypes || []) {
    const key = p.page_type === 'home' ? '首页' : p.page_type === 'standard' ? '标准页' : p.page_type === 'contact' ? '联系我们' : p.page_type;
    contentTypes[key] = (contentTypes[key] || 0) + 1;
  }

  // GA4 additional data (country, device, traffic) — non-blocking
  let countryData: { country: string; users: number }[] = [];
  let deviceData: { device: string; users: number }[] = [];
  let trafficSources: { source: string; users: number }[] = [];

  if (gaEnabled(c.env)) {
    try {
      const [countryRes, deviceRes, trafficRes] = await Promise.all([
        runGAReport(
          c.env as unknown as Record<string, unknown>,
          gaPropertyId(c.env),
          buildCountryReport(),
        ),
        runGAReport(
          c.env as unknown as Record<string, unknown>,
          gaPropertyId(c.env),
          buildDeviceReport(),
        ),
        runGAReport(
          c.env as unknown as Record<string, unknown>,
          gaPropertyId(c.env),
          buildTrafficSourceReport(),
        ),
      ]);

      countryData = (countryRes.rows || []).map((row) => ({
        country: row.dimensionValues?.[0]?.value || 'Unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
      }));

      deviceData = (deviceRes.rows || []).map((row) => ({
        device: row.dimensionValues?.[0]?.value || 'Unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
      }));

      trafficSources = (trafficRes.rows || []).map((row) => ({
        source: row.dimensionValues?.[0]?.value || 'Unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
      }));
    } catch (err: any) {
      console.error('GA dashboard extra data error:', err.message);
    }
  }

  return c.json({
    success: true,
    data: {
      content: {
        products: { total: productCount || 0, published: productPublished || 0 },
        pages: { total: pageCount || 0, published: pagePublished || 0 },
        news: { total: newsCount || 0, published: newsPublished || 0, thisMonth: newsThisMonth || 0 },
        media: { total: mediaCount || 0 },
        faq: { total: faqCount || 0 },
      },
      locale_coverage: {
        pages: { total: pageTotal, en: pageEn, fr: pageFr, vi: pageVi },
        news: { en: newsLocaleCounts['en'] || 0, fr: newsLocaleCounts['fr'] || 0, vi: newsLocaleCounts['vi'] || 0 },
      },
      scheduled: {
        news: (scheduledNews || []).map((n: any) => ({
          id: n.id, title: n.title, slug: n.slug, scheduled_publish_at: n.scheduled_publish_at, type: 'news',
        })),
        pages: (scheduledPages || []).map((p: any) => ({
          id: p.id, slug: p.slug, scheduled_publish_at: p.scheduled_publish_at, type: 'page',
        })),
      },
      recent_activity: recentActivity || [],
      content_types: Object.entries(contentTypes).map(([name, value]) => ({ name, value })),
      country_data: countryData,
      device_data: deviceData,
      traffic_sources: trafficSources,
    },
  });
});

export { app as analyticsRoutes };
