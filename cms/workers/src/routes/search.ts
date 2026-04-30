import { Hono } from 'hono';
import { getSupabase, type Env } from '../lib/supabase';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  const supabase = getSupabase(c.env);
  const q = c.req.query('q');
  if (!q || q.trim().length < 1) {
    return c.json({ success: true, data: { products: [], news: [], pages: [] } });
  }

  const locale = c.req.query('locale') || 'en';
  const pattern = `%${q.trim()}%`;

  const [productsRes, newsRes, pagesRes] = await Promise.all([
    supabase
      .from('products')
      .select('id, slug, category, is_published, product_translations!inner(name, locale)')
      .eq('product_translations.locale', locale)
      .ilike('product_translations.name', pattern)
      .limit(5),
    supabase
      .from('news_articles')
      .select('id, slug, title, locale, is_published')
      .eq('locale', locale)
      .ilike('title', pattern)
      .limit(5),
    supabase
      .from('pages')
      .select('id, slug, page_type, page_translations!inner(title, locale)')
      .eq('page_translations.locale', locale)
      .ilike('page_translations.title', pattern)
      .limit(5),
  ]);

  const mapProducts = (rows: any[] | null) =>
    (rows || []).map((p: any) => ({
      id: p.id,
      slug: p.slug,
      category: p.category,
      name: p.product_translations?.[0]?.name || p.slug,
      type: 'product' as const,
    }));

  const mapNews = (rows: any[] | null) =>
    (rows || []).map((n: any) => ({
      id: n.id,
      slug: n.slug,
      title: n.title,
      locale: n.locale,
      type: 'news' as const,
    }));

  const mapPages = (rows: any[] | null) =>
    (rows || []).map((p: any) => ({
      id: p.id,
      slug: p.slug,
      title: p.page_translations?.[0]?.title || p.slug,
      type: 'page' as const,
    }));

  return c.json({
    success: true,
    data: {
      products: mapProducts(productsRes.data),
      news: mapNews(newsRes.data),
      pages: mapPages(pagesRes.data),
    },
  });
});

export { app as searchRoutes };
