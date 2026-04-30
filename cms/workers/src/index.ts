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

const app = new Hono();

app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://admin.puxijietech.com', 'https://puxijietech.com', 'https://puxijie-cms-admin.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use('*', logger());

const api = new Hono();
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

app.route('/api/v1', api);

app.get('/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }));

export default app;
