import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { mediaRoutes } from './routes/media';
import { pageRoutes } from './routes/pages';
import { newsRoutes } from './routes/news';
import { faqRoutes } from './routes/faq';
import { legalRoutes } from './routes/legal';
import { siteSettingsRoutes } from './routes/site-settings';
import { analyticsRoutes } from './routes/analytics';
import { deployRoutes } from './routes/deploy';
import { searchRoutes } from './routes/search';
import { auditRoutes } from './routes/audit';
import { versionRoutes } from './routes/versions';
import { aiRoutes } from './routes/ai';
import { userRoutes } from './routes/users';
import { newsCategoryRoutes } from './routes/news-categories';
import { menuRoutes } from './routes/menus';
import { redirectRoutes } from './routes/redirects';
import { auditMiddleware } from './lib/audit';
import type { Env } from './lib/supabase';
import { handleScheduledPublish } from './cron/publish-scheduled';

const app = new Hono();

app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://admin.puxijietech.com', 'https://puxijietech.com', 'https://puxijie-cms-admin.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use('*', logger());

const api = new Hono();
api.use('*', auditMiddleware());
api.route('/auth', authRoutes);
api.route('/products', productRoutes);
api.route('/media', mediaRoutes);
api.route('/pages', pageRoutes);
api.route('/news', newsRoutes);
api.route('/faq', faqRoutes);
api.route('/legal', legalRoutes);
api.route('/site-settings', siteSettingsRoutes);
api.route('/analytics', analyticsRoutes);
api.route('/deploy', deployRoutes);
api.route('/search', searchRoutes);
api.route('/audit-logs', auditRoutes);
api.route('/versions', versionRoutes);
api.route('/ai', aiRoutes);
api.route('/users', userRoutes);
api.route('/news-categories', newsCategoryRoutes);
api.route('/menus', menuRoutes);
api.route('/redirects', redirectRoutes);

// Cron endpoint for manual trigger or HTTP-based cron
api.get('/cron/publish-scheduled', async (c) => {
  try {
    const result = await handleScheduledPublish(c.env as unknown as Env);
    return c.json({ success: true, data: { result } });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.route('/api/v1', api);

app.get('/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }));

export default {
  fetch: app.fetch,
  scheduled: async (event: ScheduledEvent, env: Env) => {
    await handleScheduledPublish(env);
  },
};
