import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import { chatRequestSchema } from '../schemas/ai';
import { createRateLimiter } from '../lib/rate-limit';
import { getSupabase, type Env } from '../lib/supabase';
import { auditLog } from '../lib/audit';
import type { AuthUser } from '../lib/auth';

const app = new Hono<{ Bindings: Env }>();

const chatRateLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 20 });
const writeRateLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });

const MAX_TOOL_LOOP = 12;
const MAX_TOOL_CALLS_PER_TURN = 16;

// ---------------------------------------------------------------------------
// Tool definitions (OpenAI/DeepSeek compatible)
// ---------------------------------------------------------------------------

interface ToolDef {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

const READ_ONLY_TOOLS: ToolDef[] = [
  {
    type: 'function',
    function: {
      name: 'get_cms_stats',
      description: 'Get global CMS statistics: total product count, news count, FAQ count, and per-category product counts.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_products',
      description: 'List products with optional category and locale filters. Returns id, slug, name, category, and is_published status.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Product category: waterproof_bt, normal_bt, specialty, or earbuds' },
          locale: { type: 'string', description: 'Locale: en, fr, or vi. Default: en' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product',
      description: 'Get full details for a single product — translations (all locales), specs, and images. Provide either slug or id.',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Product slug (URL-friendly identifier)' },
          id: { type: 'string', description: 'Product UUID' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_news',
      description: 'List news articles with optional locale filter. Returns id, slug, title, locale, date, is_published.',
      parameters: {
        type: 'object',
        properties: {
          locale: { type: 'string', description: 'Locale: en, fr, or vi. Leave empty for all.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_news',
      description: 'Get full content for a single news article including body_markdown.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'News article UUID' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_faq',
      description: 'List FAQ sections with optional locale filter. Returns section_key, title, item count, locale.',
      parameters: {
        type: 'object',
        properties: {
          locale: { type: 'string', description: 'Locale: en, fr, or vi. Leave empty for all.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_legal',
      description: 'List legal pages (terms, privacy, warranty, do-not-sell) with optional locale filter.',
      parameters: {
        type: 'object',
        properties: {
          locale: { type: 'string', description: 'Locale: en, fr, or vi. Leave empty for all.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_site_settings',
      description: 'Get all site settings — keys like site_name, contact_info, social_links, seo_defaults, theme, google_analytics_id.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_cms',
      description: 'Search across products, news, and pages for a given query string.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keyword or phrase' },
        },
        required: ['query'],
      },
    },
  },
];

const WRITE_TOOLS: ToolDef[] = [
  {
    type: 'function',
    function: {
      name: 'update_product',
      description: 'Update product fields. You can update translations (name, subtitle, features, benefits, description_html, etc. for a specific locale), specs (ipx_rating, battery_life, chipset, etc.), or main fields (category, sort_order, is_published). Pass only the fields you want to change.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Product UUID (required)' },
          locale: { type: 'string', description: 'Locale for translation fields: en, fr, or vi' },
          name: { type: 'string' },
          subtitle: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } },
          benefits: { type: 'array', items: { type: 'string' } },
          description_html: { type: 'string' },
          procurement_notes: { type: 'array', items: { type: 'string' } },
          material: { type: 'string' },
          weight: { type: 'string' },
          dimensions: { type: 'string' },
          waterproof_depth: { type: 'string' },
          frequency_range: { type: 'string' },
          ipx_rating: { type: 'string' },
          battery_life: { type: 'string' },
          chipset: { type: 'string' },
          bluetooth_version: { type: 'string' },
          transmission_distance: { type: 'string' },
          speaker_spec: { type: 'string' },
          battery_spec: { type: 'string' },
          function_set: { type: 'string' },
          color_options: { type: 'string' },
          moq: { type: 'string' },
          package_size: { type: 'string' },
          carton_size: { type: 'string' },
          carton_quantity: { type: 'string' },
          carton_weight: { type: 'string' },
          accessory_content: { type: 'string' },
          category: { type: 'string', description: 'waterproof_bt, normal_bt, specialty, or earbuds' },
          sort_order: { type: 'integer' },
          is_published: { type: 'boolean' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_news',
      description: 'Create a new news article. Slug should be URL-friendly (lowercase, hyphens).',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'URL-friendly unique identifier' },
          locale: { type: 'string', description: 'en, fr, or vi' },
          title: { type: 'string' },
          description: { type: 'string', description: 'Short summary / meta description' },
          body_markdown: { type: 'string', description: 'Full article body in markdown' },
          keywords: { type: 'array', items: { type: 'string' } },
          hero_image_url: { type: 'string' },
          is_published: { type: 'boolean' },
        },
        required: ['slug', 'locale', 'title', 'body_markdown'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_news',
      description: 'Update an existing news article. Pass only the fields you want to change.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'News article UUID (required)' },
          slug: { type: 'string' },
          locale: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          body_markdown: { type: 'string' },
          keywords: { type: 'array', items: { type: 'string' } },
          hero_image_url: { type: 'string' },
          is_published: { type: 'boolean' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_faq',
      description: 'Update an FAQ section. Items is an array of {q, a} objects.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'FAQ section UUID (required)' },
          title: { type: 'string' },
          short_title: { type: 'string' },
          items: { type: 'array', items: { type: 'object', properties: { q: { type: 'string' }, a: { type: 'string' } } } },
          is_published: { type: 'boolean' },
          sort_order: { type: 'integer' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_site_setting',
      description: 'Update a single site setting value.',
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Setting key, e.g. site_name, contact_info, social_links' },
          value: { type: 'string', description: 'JSON value (object, array, or stringified value)' },
        },
        required: ['key', 'value'],
      },
    },
  },
];

const SEO_TOOLS: ToolDef[] = [
  {
    type: 'function',
    function: {
      name: 'write_seo_article',
      description:
        'Prepare context for a complete SEO-optimized news article in markdown. This tool does not save content; after it returns product links, related articles, and SEO requirements, write the article in your final response. Use create_news only if the user explicitly asks you to save the draft.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Article topic/angle, e.g. "How to Choose an IPX7 Waterproof Speaker for Your Retail Channel"' },
          locale: { type: 'string', description: 'en, fr, or vi' },
          primary_keyword: { type: 'string', description: 'Main SEO keyword to target, e.g. "waterproof bluetooth speaker OEM"' },
          secondary_keywords: { type: 'array', items: { type: 'string' }, description: 'Supporting keywords to include in H2 sections and body' },
          buyer_persona: { type: 'string', description: 'Target reader: distributor, brand_owner, importer, procurement_manager, or retailer' },
          suggested_products: { type: 'array', items: { type: 'string' }, description: 'Product slugs to internally link to (optional)' },
        },
        required: ['topic', 'locale', 'primary_keyword'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_seo_topics',
      description:
        'Analyze existing products and news articles to identify content gaps, then suggest high-value SEO article topics with target keywords, search intent, and estimated buyer interest. Useful for planning an editorial calendar for puxijietech.com.',
      parameters: {
        type: 'object',
        properties: {
          locale: { type: 'string', description: 'Locale to analyze: en, fr, or vi. Default: en.' },
          focus_category: { type: 'string', description: 'Product category to focus on: waterproof_bt, normal_bt, specialty, or earbuds. Leave empty for all.' },
          count: { type: 'integer', description: 'Number of topic suggestions. Default: 5.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'audit_seo',
      description:
        'Audit an existing news article for SEO quality. Checks: keyword density, heading structure, meta description quality, internal links, readability, image alt text presence, and schema markup. Returns a score (0-100) and a prioritized list of fixes.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'News article UUID to audit' },
          slug: { type: 'string', description: 'Alternatively, article slug to audit' },
        },
        required: [],
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'generate_schema_markup',
      description:
        'Generate JSON-LD structured data markup for a page. Supports Article, BlogPosting, Product, FAQ, HowTo, LocalBusiness, BreadcrumbList, and Organization schema types. Returns copy-paste-ready JSON-LD <script> blocks that improve rich result eligibility in Google SERPs.',
      parameters: {
        type: 'object',
        properties: {
          schema_type: { type: 'string', description: 'Schema type: Article, Product, FAQ, HowTo, LocalBusiness, BreadcrumbList, or Organization' },
          article_id: { type: 'string', description: 'News article UUID (required for Article/BlogPosting)' },
          product_slug: { type: 'string', description: 'Product slug (required for Product)' },
          faq_id: { type: 'string', description: 'FAQ section UUID (required for FAQ)' },
          locale: { type: 'string', description: 'Locale for URLs: en, fr, or vi. Default: en.' },
        },
        required: ['schema_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_keywords',
      description:
        'Analyze a target keyword or topic for SEO. Determines search intent (informational/commercial/transactional/navigational), suggests LSI keywords, long-tail variations, content angle recommendations, and estimates competitive difficulty. Use before writing a new article to validate keyword choice.',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: 'Target keyword or topic to analyze' },
          locale: { type: 'string', description: 'Target locale: en, fr, or vi. Default: en.' },
        },
        required: ['keyword'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_internal_links',
      description:
        'Find internal linking opportunities from a news article to product pages and other news articles. Returns ranked link suggestions with recommended anchor text and placement context. Use when editing or reviewing an article to strengthen internal link structure.',
      parameters: {
        type: 'object',
        properties: {
          article_id: { type: 'string', description: 'News article UUID to find links for' },
          locale: { type: 'string', description: 'Locale filter: en, fr, or vi. Default matches article locale.' },
          max_suggestions: { type: 'integer', description: 'Max link suggestions. Default: 8.' },
        },
        required: ['article_id'],
      },
    },
  },
];

const ALL_TOOLS: ToolDef[] = [...READ_ONLY_TOOLS, ...WRITE_TOOLS, ...SEO_TOOLS];

// ---------------------------------------------------------------------------
// Tool executors
// ---------------------------------------------------------------------------

type ToolExecutor = (args: Record<string, unknown>, supabase: ReturnType<typeof getSupabase>) => Promise<unknown>;

const toolExecutors: Record<string, ToolExecutor> = {
  // ---- READ ----

  async get_cms_stats(_args, supabase) {
    const [productsRes, newsRes, faqRes, pagesRes] = await Promise.all([
      supabase.from('products').select('id, category, is_published'),
      supabase.from('news_articles').select('id, is_published'),
      supabase.from('faq_sections').select('id, is_published'),
      supabase.from('pages').select('id, is_published'),
    ]);

    const products = (productsRes.data || []) as any[];
    const categories: Record<string, number> = {};
    for (const p of products) {
      categories[p.category] = (categories[p.category] || 0) + 1;
    }

    return {
      total_products: products.length,
      published_products: products.filter((p) => p.is_published).length,
      products_by_category: categories,
      total_news: (newsRes.data || []).length,
      published_news: (newsRes.data || []).filter((n: any) => n.is_published).length,
      total_faq_sections: (faqRes.data || []).length,
      published_faq_sections: (faqRes.data || []).filter((f: any) => f.is_published).length,
      total_pages: (pagesRes.data || []).length,
      published_pages: (pagesRes.data || []).filter((p: any) => p.is_published).length,
    };
  },

  async list_products(args, supabase) {
    const category = args.category as string | undefined;
    const locale = (args.locale as string) || 'en';

    let query = supabase
      .from('products')
      .select('id, slug, category, sort_order, is_published, product_translations!inner(name, locale)')
      .eq('product_translations.locale', locale)
      .order('sort_order', { ascending: true });

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return ((data || []) as any[]).map((p) => ({
      id: p.id,
      slug: p.slug,
      category: p.category,
      name: p.product_translations?.[0]?.name || p.slug,
      is_published: p.is_published,
      sort_order: p.sort_order,
    }));
  },

  async get_product(args, supabase) {
    let query = supabase
      .from('products')
      .select('*, product_translations(*), product_specs(*), product_images(media_id, sort_order, is_primary, media(*))');

    if (args.id) {
      query = query.eq('id', args.id);
    } else if (args.slug) {
      query = query.eq('slug', args.slug);
    } else {
      return { error: 'Provide either product id or slug' };
    }

    const { data, error } = await query.single();
    if (error) return { error: `Product not found: ${args.id || args.slug}` };

    const product = data;

    // Simplify relations for readability
    return {
      id: product.id,
      slug: product.slug,
      category: product.category,
      sort_order: product.sort_order,
      is_published: product.is_published,
      translations: (product.product_translations || []).map((t: any) => ({
        locale: t.locale,
        name: t.name,
        subtitle: t.subtitle,
        features: t.features,
        benefits: t.benefits,
        description_html: t.description_html?.slice(0, 500) + (t.description_html?.length > 500 ? '...' : ''),
        procurement_notes: t.procurement_notes,
        material: t.material,
        weight: t.weight,
        dimensions: t.dimensions,
        waterproof_depth: t.waterproof_depth,
        frequency_range: t.frequency_range,
      })),
      specs: product.product_specs?.[0] || null,
      images: (product.product_images || []).map((pi: any) => ({
        url: pi.media?.url,
        alt: pi.media?.alt,
        is_primary: pi.is_primary,
      })),
    };
  },

  async list_news(args, supabase) {
    const locale = args.locale as string | undefined;
    let query = supabase
      .from('news_articles')
      .select('id, slug, title, locale, date, is_published, description')
      .order('date', { ascending: false });

    if (locale) query = query.eq('locale', locale);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  async get_news(args, supabase) {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', args.id)
      .single();

    if (error) return { error: 'News article not found' };
    return data;
  },

  async list_faq(args, supabase) {
    const locale = args.locale as string | undefined;
    let query = supabase
      .from('faq_sections')
      .select('id, section_key, locale, short_title, title, items, sort_order, is_published')
      .order('sort_order', { ascending: true });

    if (locale) query = query.eq('locale', locale);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return ((data || []) as any[]).map((f) => ({
      id: f.id,
      section_key: f.section_key,
      locale: f.locale,
      title: f.title,
      short_title: f.short_title,
      question_count: Array.isArray(f.items) ? f.items.length : 0,
      is_published: f.is_published,
    }));
  },

  async list_legal(args, supabase) {
    const locale = args.locale as string | undefined;
    let query = supabase
      .from('legal_pages')
      .select('id, page_type, legal_translations!inner(locale, title, description)');

    if (locale) query = query.eq('legal_translations.locale', locale);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return ((data || []) as any[]).map((l: any) => ({
      id: l.id,
      page_type: l.page_type,
      translations: l.legal_translations || [],
    }));
  },

  async get_site_settings(_args, supabase) {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) throw new Error(error.message);
    return data;
  },

  async search_cms(args, supabase) {
    const q = (args.query as string).trim();
    const pattern = `%${q}%`;

    const [productsRes, newsRes, pagesRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, slug, category, is_published, product_translations!inner(name, locale)')
        .ilike('product_translations.name', pattern)
        .limit(10),
      supabase
        .from('news_articles')
        .select('id, slug, title, locale, is_published')
        .ilike('title', pattern)
        .limit(10),
      supabase
        .from('pages')
        .select('id, slug, page_type, page_translations!inner(title, locale)')
        .ilike('page_translations.title', pattern)
        .limit(10),
    ]);

    return {
      products: ((productsRes.data || []) as any[]).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.product_translations?.[0]?.name || p.slug,
        category: p.category,
      })),
      news: ((newsRes.data || []) as any[]).map((n) => ({
        id: n.id,
        slug: n.slug,
        title: n.title,
        locale: n.locale,
      })),
      pages: ((pagesRes.data || []) as any[]).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.page_translations?.[0]?.title || p.slug,
        page_type: p.page_type,
      })),
    };
  },

  // ---- WRITE ----

  async update_product(args, supabase) {
    const { id, locale, ...rest } = args as Record<string, unknown>;
    const now = new Date().toISOString();

    // Separate translation fields, spec fields, and main product fields
    const transFields = ['name', 'subtitle', 'features', 'benefits', 'description_html',
      'procurement_notes', 'material', 'weight', 'dimensions', 'waterproof_depth', 'frequency_range'];
    const specFields = ['ipx_rating', 'battery_life', 'chipset', 'bluetooth_version',
      'transmission_distance', 'speaker_spec', 'battery_spec', 'function_set',
      'color_options', 'moq', 'package_size', 'carton_size', 'carton_quantity',
      'carton_weight', 'accessory_content'];
    const mainFields = ['category', 'sort_order', 'is_published'];

    const transData: Record<string, unknown> = {};
    const specData: Record<string, unknown> = {};
    const mainData: Record<string, unknown> = {};

    for (const [k, v] of Object.entries(rest)) {
      if (v === undefined) continue;
      if (transFields.includes(k)) transData[k] = v;
      else if (specFields.includes(k)) specData[k] = v;
      else if (mainFields.includes(k)) mainData[k] = v;
    }

    const results: string[] = [];

    if (Object.keys(mainData).length > 0) {
      mainData.updated_at = now;
      const { error } = await supabase.from('products').update(mainData).eq('id', id);
      if (error) throw new Error(`Failed to update product: ${error.message}`);
      results.push(`Updated main fields for product ${id}`);
    }

    if (Object.keys(transData).length > 0) {
      if (!locale) throw new Error('locale is required when updating translation fields');
      transData.updated_at = now;
      const { error } = await supabase
        .from('product_translations')
        .update(transData)
        .eq('product_id', id)
        .eq('locale', locale);
      if (error) throw new Error(`Failed to update translation: ${error.message}`);
      results.push(`Updated ${locale} translation for product ${id}: ${Object.keys(transData).join(', ')}`);
    }

    if (Object.keys(specData).length > 0) {
      specData.updated_at = now;
      const { error } = await supabase.from('product_specs').update(specData).eq('product_id', id);
      if (error) throw new Error(`Failed to update specs: ${error.message}`);
      results.push(`Updated specs for product ${id}: ${Object.keys(specData).join(', ')}`);
    }

    return { success: true, changes: results };
  },

  async create_news(args, supabase) {
    const now = new Date().toISOString();
    const row = {
      slug: args.slug,
      locale: args.locale || 'en',
      title: args.title,
      description: args.description || '',
      body_markdown: args.body_markdown,
      keywords: args.keywords || [],
      hero_image_url: args.hero_image_url || null,
      is_published: args.is_published ?? false,
      date: now,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase.from('news_articles').insert(row).select('id').single();
    if (error) throw new Error(`Failed to create news: ${error.message}`);
    return { success: true, id: data.id, slug: row.slug, title: row.title };
  },

  async update_news(args, supabase) {
    const { id, ...rest } = args as Record<string, unknown>;
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) updateData[k] = v;
    }

    const { error } = await supabase.from('news_articles').update(updateData).eq('id', id);
    if (error) throw new Error(`Failed to update news: ${error.message}`);
    return { success: true, updated_fields: Object.keys(rest).filter((k) => rest[k] !== undefined) };
  },

  async update_faq(args, supabase) {
    const { id, ...rest } = args as Record<string, unknown>;
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) updateData[k] = v;
    }

    const { error } = await supabase.from('faq_sections').update(updateData).eq('id', id);
    if (error) throw new Error(`Failed to update FAQ: ${error.message}`);
    return { success: true, updated_fields: Object.keys(rest).filter((k) => rest[k] !== undefined) };
  },

  async update_site_setting(args, supabase) {
    const { key, value } = args;
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) throw new Error(`Failed to update site setting: ${error.message}`);
    return { success: true, key, value };
  },

  // ---- SEO TOOLS ----

  async write_seo_article(args, supabase) {
    const { topic, locale, primary_keyword, secondary_keywords, buyer_persona, suggested_products } = args as Record<string, unknown>;
    const kw = (secondary_keywords as string[]) || [];
    const products = (suggested_products as string[]) || [];
    const persona = (buyer_persona as string) || 'distributor';

    // Fetch suggested products for internal linking info
    let productLinks = '';
    if (products.length > 0) {
      const { data: prodData } = await supabase
        .from('products')
        .select('slug, product_translations(name, locale)')
        .in('slug', products)
        .eq('product_translations.locale', locale);
      if (prodData && prodData.length > 0) {
        productLinks = (prodData as any[]).map((p) => {
          const name = p.product_translations?.[0]?.name || p.slug;
          return `- [${name}](/${locale}/model/${p.slug})`;
        }).join('\n');
      }
    }

    // Fetch 3 recent related articles for internal linking
    const { data: relatedNews } = await supabase
      .from('news_articles')
      .select('slug, title')
      .eq('locale', locale)
      .eq('is_published', true)
      .order('date', { ascending: false })
      .limit(3);

    let internalLinks = '';
    if (relatedNews && relatedNews.length > 0) {
      internalLinks = (relatedNews as any[]).map((n) =>
        `- [${n.title}](/${locale}/news/${n.slug})`
      ).join('\n');
    }

    // Build the article generation prompt for the AI.
    // The AI (DeepSeek) will generate the actual article in its response,
    // but this executor precomputes context (product links, related articles)
    // and returns it as structured context for the assistant to use.
    return {
      _action: 'generate_article',
      topic,
      locale,
      primary_keyword,
      secondary_keywords: kw,
      buyer_persona: persona,
      context: {
        product_links: productLinks || 'No specific products linked.',
        related_articles: internalLinks || 'No related articles.',
        seo_requirements: {
          slug_format: `${(topic as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)}`,
          meta_description_guideline: `150-160 characters including "${primary_keyword}" and a CTA.`,
          heading_structure: 'H1 (primary keyword), 4-6 H2 sections (secondary keywords), H3 for sub-points',
          keyword_placement: `"${primary_keyword}" in: title, H1, first paragraph, meta description, one H2. Secondary keywords distributed across H2s.`,
          internal_linking: 'Link to 2-3 product pages and 1-2 related news articles naturally within the body.',
          image_alt_format: `"${primary_keyword} — Puxijie [context]"`,
        },
      },
    };
  },

  async suggest_seo_topics(args, supabase) {
    const locale = (args.locale as string) || 'en';
    const count = (args.count as number) || 5;
    const focusCategory = args.focus_category as string | undefined;

    // Gather existing content inventory
    let productQuery = supabase.from('products').select('slug, category, product_translations!inner(name, locale)').eq('product_translations.locale', locale);
    if (focusCategory) productQuery = productQuery.eq('category', focusCategory);
    const [productsRes, newsRes] = await Promise.all([
      productQuery.order('sort_order'),
      supabase.from('news_articles').select('slug, title, keywords, locale').eq('locale', locale).eq('is_published', true).order('date', { ascending: false }),
    ]);

    const products = (productsRes.data || []) as any[];
    const newsArticles = (newsRes.data || []) as any[];

    // Collect existing keywords to identify gaps
    const coveredKeywords = new Set<string>();
    for (const n of newsArticles) {
      for (const k of (n.keywords || [])) coveredKeywords.add((k as string).toLowerCase());
    }

    const productNames = products.map((p: any) => p.product_translations?.[0]?.name || p.slug);
    const categories = [...new Set(products.map((p: any) => p.category))];

    return {
      locale,
      focus_category: focusCategory || 'all',
      content_inventory: {
        total_products: products.length,
        total_news: newsArticles.length,
        categories,
      },
      topic_suggestions_count: count,
      existing_keywords: [...coveredKeywords].slice(0, 50),
      // The AI will use this context to generate specific topic ideas
      _guidance: `Based on the product catalog (${productNames.slice(0, 10).join(', ')}) and existing news coverage, suggest ${count} high-value SEO article topics for ${locale} locale. For each topic, provide: title idea, target primary keyword, 3 secondary keywords, search intent, and estimated buyer interest (high/medium/low). Focus on B2B buyer journey: awareness → consideration → decision. Prioritize topics NOT yet covered by existing keywords.`,
    };
  },

  async audit_seo(args, supabase) {
    let article: any = null;
    if (args.id) {
      const { data } = await supabase.from('news_articles').select('*').eq('id', args.id).single();
      article = data;
    } else if (args.slug) {
      const { data } = await supabase.from('news_articles').select('*').eq('slug', args.slug).single();
      article = data;
    }
    if (!article) return { error: 'Article not found. Provide a valid id or slug.' };

    // Compute SEO audit metrics
    const body = (article.body_markdown || '') as string;
    const title = (article.title || '') as string;
    const description = (article.description || '') as string;
    const keywords = (article.keywords || []) as string[];

    const wordCount = body.split(/\s+/).filter(Boolean).length;
    const headings = body.match(/^#{1,3}\s+.+$/gm) || [];
    const h1Count = headings.filter((h) => h.startsWith('# ')).length;
    const h2Count = headings.filter((h) => h.startsWith('## ')).length;
    const hasInternalLinks = /\]\(\/(en|fr|vi)\/(model|news|products)\//.test(body);
    const hasImageAlt = /!\[.+\]\(.+\)/.test(body);
    const descriptionLength = description.length;
    const titleLength = title.length;

    const issues: string[] = [];
    if (titleLength < 30 || titleLength > 70) issues.push(`Title length (${titleLength} chars) — ideal is 40-65 chars for SERP display`);
    if (descriptionLength < 120 || descriptionLength > 170) issues.push(`Meta description length (${descriptionLength} chars) — ideal is 140-160 chars`);
    if (h1Count !== 1) issues.push(`H1 count: ${h1Count} — should have exactly 1 H1`);
    if (h2Count < 2) issues.push(`H2 count: ${h2Count} — should have at least 2-3 H2 sections`);
    if (!hasInternalLinks) issues.push('No internal links to product pages or other news articles found');
    if (!hasImageAlt) issues.push('No images with alt text found in article body');
    if (wordCount < 500) issues.push(`Word count (${wordCount}) — articles under 500 words typically rank poorly`);
    if (keywords.length < 3) issues.push(`Only ${keywords.length} keywords — aim for 5-10 keywords per article`);

    // Keyword density check
    const primaryKw = keywords[0];
    let kwDensity = 0;
    if (primaryKw && wordCount > 0) {
      const regex = new RegExp(primaryKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = body.match(regex);
      kwDensity = matches ? (matches.length / wordCount) * 100 : 0;
    }
    if (primaryKw && (kwDensity < 0.5 || kwDensity > 3)) {
      issues.push(`Primary keyword "${primaryKw}" density: ${kwDensity.toFixed(1)}% — ideal is 0.8-2.5%`);
    }

    // Score (simple heuristic)
    let score = 100;
    score -= issues.length * 8;
    if (h2Count < 2) score -= 10;
    if (!hasInternalLinks) score -= 10;
    if (wordCount < 500) score -= 15;
    if (keywords.length < 3) score -= 10;
    score = Math.max(0, Math.min(100, score));

    return {
      article: { id: article.id, slug: article.slug, title, locale: article.locale, is_published: article.is_published },
      audit: {
        score,
        grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
        word_count: wordCount,
        heading_structure: { h1: h1Count, h2: h2Count, total_headings: headings.length },
        title_length: titleLength,
        description_length: descriptionLength,
        keyword_count: keywords.length,
        primary_keyword_density: primaryKw ? `${kwDensity.toFixed(1)}%` : 'N/A',
        has_internal_links: hasInternalLinks,
        has_image_alt: hasImageAlt,
        issues,
        priority_fixes: issues.slice(0, 3),
      },
    };
  },

  // ---- NEW SEO TOOLS (from seo-1.0.3 skill package) ----

  async generate_schema_markup(args, supabase) {
    const schemaType = args.schema_type as string;
    const locale = (args.locale as string) || 'en';

    const buildArticleSchema = async () => {
      let article: any = null;
      if (args.article_id) {
        const { data } = await supabase.from('news_articles').select('*').eq('id', args.article_id).single();
        article = data;
      }
      if (!article) return { error: 'Article not found. Provide article_id.' };

      const jsonld = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description || '',
        datePublished: article.date || article.created_at,
        dateModified: article.updated_at,
        author: { '@type': 'Organization', name: 'Puxijie', url: 'https://puxijietech.com' },
        publisher: { '@type': 'Organization', name: 'Puxijie', url: 'https://puxijietech.com' },
        image: article.hero_image_url || undefined,
        url: `https://puxijietech.com/${locale}/news/${article.slug}`,
      };

      return {
        schema_type: 'Article',
        jsonld,
        script_tag: `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n</script>`,
      };
    };

    const buildProductSchema = async () => {
      if (!args.product_slug) return { error: 'product_slug is required for Product schema' };
      const { data: product } = await supabase
        .from('products')
        .select('*, product_translations(*), product_specs(*)')
        .eq('slug', args.product_slug)
        .single();
      if (!product) return { error: `Product "${args.product_slug}" not found` };

      const translation = product.product_translations?.find((t: any) => t.locale === locale) || product.product_translations?.[0] || {};
      const specs = product.product_specs?.[0] || {};

      const jsonld: any = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: translation.name || product.slug,
        description: translation.subtitle || translation.description_html?.slice(0, 200) || '',
        category: product.category,
        url: `https://puxijietech.com/${locale}/model/${product.slug}`,
        offers: { '@type': 'Offer', availability: 'https://schema.org/InStock' },
      };
      if (specs.ipx_rating) jsonld.waterproofRating = specs.ipx_rating;

      return {
        schema_type: 'Product',
        jsonld,
        script_tag: `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n</script>`,
      };
    };

    const buildFAQSchema = async () => {
      if (!args.faq_id) return { error: 'faq_id is required for FAQ schema' };
      const { data: faq } = await supabase.from('faq_sections').select('*').eq('id', args.faq_id).single();
      if (!faq) return { error: 'FAQ section not found' };

      const items = (faq.items || []) as any[];
      const mainEntity = items.map((item: any) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a?.slice(0, 500) },
      }));

      const jsonld = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity,
      };

      return {
        schema_type: 'FAQPage',
        question_count: items.length,
        jsonld,
        script_tag: `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n</script>`,
      };
    };

    const buildOrgSchema = () => {
      const jsonld = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Puxijie',
        url: 'https://puxijietech.com',
        description: 'OEM/ODM manufacturer of outdoor portable wireless waterproof Bluetooth speakers',
        contactPoint: { '@type': 'ContactPoint', contactType: 'sales', url: `https://puxijietech.com/${locale}/contact` },
        sameAs: ['https://www.linkedin.com/company/puxijie'],
      };
      return {
        schema_type: 'Organization',
        jsonld,
        script_tag: `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n</script>`,
      };
    };

    const buildBreadcrumbSchema = () => ({
      schema_type: 'BreadcrumbList',
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `https://puxijietech.com/${locale}` },
          { '@type': 'ListItem', position: 2, name: 'Products', item: `https://puxijietech.com/${locale}/products` },
        ],
      },
    });

    switch (schemaType) {
      case 'Article':
      case 'BlogPosting': return await buildArticleSchema();
      case 'Product': return await buildProductSchema();
      case 'FAQ':
      case 'FAQPage': return await buildFAQSchema();
      case 'Organization': return buildOrgSchema();
      case 'BreadcrumbList': return buildBreadcrumbSchema();
      default: return { error: `Unsupported schema type: ${schemaType}. Supported: Article, Product, FAQ, Organization, BreadcrumbList` };
    }
  },

  async analyze_keywords(args, _supabase) {
    const keyword = (args.keyword as string).trim();
    const locale = (args.locale as string) || 'en';

    const kw = keyword.toLowerCase();
    const intentPatterns: Record<string, string[]> = {
      informational: ['how to', 'what is', 'what are', 'why', 'guide', 'tutorial', 'tips', 'learn', 'understanding', 'explained'],
      commercial: ['best', 'top', 'vs', 'versus', 'comparison', 'compare', 'review', 'alternative', 'alternatives'],
      transactional: ['buy', 'price', 'pricing', 'cost', 'quote', 'order', 'oem', 'odm', 'manufacturer', 'supplier', 'wholesale', 'moq', 'private label'],
      navigational: ['puxijie'],
    };

    let intent = 'informational';
    for (const [intentType, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some((p) => kw.includes(p))) {
        intent = intentType;
        break;
      }
    }

    const speakerLSI = ['bluetooth speaker', 'wireless speaker', 'portable speaker', 'outdoor audio', 'waterproof speaker', 'bluetooth 5.3', 'ipx rating', 'battery life', 'speaker driver', 'tws pairing'];
    const b2bLSI = ['oem manufacturer', 'wholesale supplier', 'private label', 'bulk order', 'sourcing', 'import', 'factory direct', 'product catalog', 'minimum order', 'custom branding'];
    const techLSI = ['bluetooth codec', 'frequency response', 'decibel', 'bluetooth profile', 'a2dp', 'speaker wattage', 'lithium battery'];

    const allLSI = [...speakerLSI, ...b2bLSI, ...techLSI];
    const words = new Set(kw.split(/\s+/));
    const relevant = allLSI.filter((term) => {
      const termWords = term.split(/\s+/);
      return !kw.includes(term) && termWords.some((tw) => tw.length > 3 && words.has(tw));
    });

    const longTailTemplates = [
      `${keyword} for distributors`,
      `${keyword} wholesale supplier`,
      `how to choose ${keyword}`,
      `${keyword} OEM manufacturer China`,
      `${keyword} vs traditional`,
      `${keyword} buying guide`,
      `${keyword} factory direct pricing`,
      `${keyword} private label options`,
    ];

    const angleMap: Record<string, string[]> = {
      informational: ['Comprehensive guide with step-by-step sections', 'FAQ-rich article capturing question queries', 'Educational deep-dive with comparison tables'],
      commercial: ['Head-to-head comparison with scoring rubric', 'Buyer checklist with evaluation criteria', 'Case study showing selection process and ROI'],
      transactional: ['Product showcase with full specs and pricing tiers', 'Sourcing guide with MOQ and lead time details', 'Landing page with quote request CTA'],
    };

    return {
      keyword,
      locale,
      search_intent: intent,
      intent_explanation: intent === 'informational' ? 'User wants to learn/understand — use guides, explainers, tutorials'
        : intent === 'commercial' ? 'User is comparing/evaluating — use comparisons, reviews, buying guides'
        : intent === 'transactional' ? 'User wants to source/buy — use product pages, pricing guides, quote forms'
        : 'User is looking for a specific brand/site — optimize homepage and product pages',
      lsi_keywords: relevant.length > 0 ? relevant.slice(0, 10) : speakerLSI.slice(0, 8),
      long_tail_variations: longTailTemplates,
      content_angles: angleMap[intent] || angleMap.informational,
      competitive_note: intent === 'transactional'
        ? 'Transactional B2B keywords are high-value. Ensure page has fast LCP (<2.5s), trust signals (certifications), and clear CTA.'
        : 'Match the content format that currently ranks on page 1. Wrong format = no ranking regardless of quality.',
    };
  },

  async suggest_internal_links(args, supabase) {
    const maxSuggestions = (args.max_suggestions as number) || 8;
    const locale = args.locale as string | undefined;

    const { data: article } = await supabase.from('news_articles').select('*').eq('id', args.article_id).single();
    if (!article) return { error: 'Article not found. Provide a valid article_id.' };

    const articleLocale = locale || (article.locale as string);
    const articleBody = (article.body_markdown || '') as string;
    const articleKeywords = (article.keywords || []) as string[];

    const { data: products } = await supabase
      .from('products')
      .select('slug, product_translations!inner(name, locale)')
      .eq('product_translations.locale', articleLocale)
      .eq('is_published', true)
      .limit(20);

    const { data: otherNews } = await supabase
      .from('news_articles')
      .select('id, slug, title, keywords')
      .eq('locale', articleLocale)
      .eq('is_published', true)
      .neq('id', args.article_id)
      .order('date', { ascending: false })
      .limit(20);

    const suggestions: Array<{ url: string; anchor_text: string; type: string; score: number; context: string }> = [];

    for (const product of (products || []) as any[]) {
      const name = product.product_translations?.[0]?.name || product.slug;
      const slug = product.slug as string;
      if (articleBody.includes(`/${articleLocale}/model/${slug}`)) continue;

      let score = 0;
      for (const kw of articleKeywords) {
        if (name.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(name.toLowerCase().split(' ')[0])) {
          score += 3;
        }
      }
      const nameWords = new Set(name.toLowerCase().split(/\s+/));
      for (const kw of articleKeywords) {
        for (const w of kw.toLowerCase().split(/\s+/)) {
          if (w.length > 3 && nameWords.has(w)) score += 2;
        }
      }

      if (score > 0 || suggestions.length < maxSuggestions / 2) {
        suggestions.push({
          url: `/${articleLocale}/model/${slug}`,
          anchor_text: name,
          type: 'product',
          score: Math.max(score, 1),
          context: `Link when discussing features/capabilities matching ${name}`,
        });
      }
    }

    for (const news of (otherNews || []) as any[]) {
      if (articleBody.includes(`/${articleLocale}/news/${news.slug}`)) continue;

      let score = 0;
      const newsKeywords: string[] = news.keywords || [];
      for (const ak of articleKeywords) {
        for (const nk of newsKeywords) {
          if (ak.toLowerCase() === nk.toLowerCase()) score += 5;
          else if (ak.toLowerCase().includes(nk.toLowerCase()) || nk.toLowerCase().includes(ak.toLowerCase())) score += 2;
        }
      }

      if (score >= 2 || suggestions.length < maxSuggestions) {
        suggestions.push({
          url: `/${articleLocale}/news/${news.slug}`,
          anchor_text: news.title as string,
          type: 'news',
          score,
          context: score >= 4 ? 'Strong topical match — link in a contextual sentence' : 'Related topic — link as "see also" reference',
        });
      }
    }

    suggestions.sort((a, b) => b.score - a.score);
    const top = suggestions.slice(0, maxSuggestions);

    return {
      article: { id: article.id, slug: article.slug, title: article.title, locale: articleLocale },
      total_opportunities: suggestions.length,
      suggestions: top,
      linking_guide: {
        anchor_text_rule: 'Use descriptive partial-match anchor text (e.g. "IPX7 waterproof G34 speaker"), never "click here" or naked URLs.',
        placement_rule: 'Links in the first 30% of body content carry more weight than footer/nav links.',
        density_guideline: 'Aim for 3-6 internal contextual links per 1000 words. Over-linking dilutes value.',
      },
    };
  },
};

// ---------------------------------------------------------------------------
// DeepSeek API helpers
// ---------------------------------------------------------------------------

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string;
  reasoning_content?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

function buildSystemPrompt(context?: { page?: string; entityType?: string; entityId?: string }): string {
  let prompt = `You are an AI assistant for the Puxijie CMS (puxijietech.com), a B2B Bluetooth audio products company. You have access to real-time data from the CMS database and can help users view, search, edit content, and write SEO-optimized articles.

## Capabilities
- **Read**: Query products (with full specs/translations), news articles, FAQ sections, legal pages, site settings, and CMS-wide statistics.
- **Write**: Update product fields (translations + specs), create/edit news articles, update FAQ sections, and modify site settings.
- **SEO**: Write complete B2B SEO articles, audit existing articles, analyze keywords, generate JSON-LD schema markup, suggest internal linking opportunities, and recommend content topics based on gap analysis.

## Content Structure
- **Products**: slug, category (waterproof_bt/normal_bt/specialty/earbuds), translations (en/fr/vi) with name/subtitle/features[ ]/benefits[ ]/description_html/procurement_notes[ ], specs (ipx_rating, battery_life, chipset, bluetooth_version, etc.), images
- **News**: slug, locale, title, description, body_markdown, keywords[ ], hero_image_url, is_published
- **FAQ**: section_key, locale, title, items[ ] (q/a pairs)
- **Legal**: page_type (terms/privacy/warranty/do-not-sell), translations with title/sections[ ]
- **Site Settings**: key-value pairs (site_name, contact_info, social_links, seo_defaults, theme, google_analytics_id)

## SEO Playbook (v1.0.3)

### Core SEO Rules
1. **Search Intent First**: Match content format to query intent. Informational → guides/tutorials. Commercial investigation → comparisons/reviews. Transactional → product/sourcing pages. Wrong format = no ranking — check what's ranking on page 1 before writing.
2. **Audit Before Action**: Run complete checks before recommending changes — indexing status, headings, keywords, internal links, Core Web Vitals. No guessing.
3. **Content That Ranks**: Answer the query in the first 100 words. Cover the topic comprehensively (include subtopics competitors cover). Add FAQ section at bottom for "People Also Ask" queries. Use bullet points and numbered lists for featured snippet potential.
4. **Technical Foundation**: Core Web Vitals must pass — LCP < 2.5s, INP < 200ms, CLS < 0.1. Mobile-first indexing. HTTPS everywhere. Clean canonical URLs. XML sitemap submitted. No blocked CSS/JS in robots.txt.
5. **E-E-A-T Signals**: Experience, Expertise, Authoritativeness, Trustworthiness. Include author bios with credentials. Cite external authoritative sources (CE, FCC, RoHS, Bluetooth SIG). Always show updated date on content. Especially important for B2B sourcing content — buyers evaluate supplier credibility.
6. **Link Strategy**: Internal links build topical authority. Use descriptive anchor text — "IPX7 waterproof G34 speaker" not "click here". Every page reachable within 3 clicks from homepage. External links to authoritative sources help. Never buy links or participate in link schemes.
7. **Measure Everything**: Track rankings, organic traffic, CTR. Use Search Console data. Iterate based on results, not assumptions.

### Buyer Personas (B2B)
- **Distributor/Importer**: Wants MOQ, logistics, compliance, regional exclusivity
- **Brand Owner / Private Label**: Wants customization, packaging, branding options, OEM flexibility
- **Procurement Manager**: Wants specs, certifications, pricing tiers, lead time, payment terms
- **Retailer**: Wants shelf-ready packaging, warranty, drop-shipping, margin

### Article Quality Standards
1. **Title (50-60 chars)**: Primary keyword in first 30 chars + value proposition. Use pipe | or dash - as separator. Brand name at END. Never repeat keyword twice.
   - Good: "How to Source IPX7 Waterproof Bluetooth Speakers: A Distributor's Guide (2026)"
   - Bad: "About Waterproof Speakers"
2. **Meta Description (150-160 chars)**: Primary keyword + pain point + CTA. Google rewrites ~30% of descriptions — a well-written one still wins. Include keyword (gets bolded in SERP). Never duplicate across pages.
   - Template: "[Topic] — [Key insight for buyer]. Learn [benefit]. Read more → | Puxijie B2B Audio"
3. **URL Slug (3-6 words)**: Hyphens between words, lowercase, include primary keyword, no stop words, no dates (keeps content evergreen). Never change URLs without 301 redirect.
4. **H1 (exactly ONE per page)**: Match or closely mirror the title, include primary keyword. H1 ≠ Title tag — related but different wording doubles keyword opportunity.
5. **H2/H3 Hierarchy**: H2s for main sections (each targets a secondary keyword). H3s for subsections. Proper hierarchy matters for featured snippets.
6. **Introduction (120-180 words)**: Hook (problem/stat/question) → pain point → what reader will gain. Answer the primary query in first 100 words.
7. **Body H2 sections (4-6)**: Each 150-300 words targeting a secondary keyword. Short paragraphs (2-4 sentences max). Bullet points for specs/comparisons. Bold key statistics.
8. **Internal Linking**: 2-3 contextual links to /model/{slug} product pages, 1-2 links to related news articles. Use descriptive partial-match anchor text. Links in-content > sidebar/footer links. Example: "The [G31 IPX6 speaker](/en/model/g31) offers..."
9. **External Authority Links**: Reference CE/FCC/RoHS standards, ISO certifications, Bluetooth SIG specifications. Links to .gov/.edu/.org domains carry more weight.
10. **Image Alt Text**: Descriptive, keyword only if natural. "{primary_keyword} — Puxijie [specific context]". File names with hyphens: waterproof-bluetooth-speaker.jpg not IMG_4532.jpg. Compress under 100KB, use WebP format.
11. **Call-to-Action**: End every article with a relevant CTA — request quote, explore products, download catalog, contact sales.

### Keyword Strategy
- **Primary keyword**: Main target phrase, used in title, H1, first paragraph, meta description, one H2
- **Secondary keywords (3-5)**: Each used in one H2 heading + its section body
- **LSI keywords**: Naturally woven into body (synonyms, related terms, technical equivalents)
- **Keyword density**: 0.8-2.5% for primary; under 3% for any keyword — Google detects stuffing patterns
- **Long-tail priority**: "waterproof bluetooth speaker OEM manufacturer China" over "bluetooth speaker" — lower competition, higher conversion intent
- **Keyword mapping**: One primary per page. Use analyze_keywords tool to validate keyword choice before writing

### Content Types for Puxijie
| Type | Purpose | Example |
|------|---------|---------|
| Sourcing Guide | Educate buyers on selection criteria | "How to Choose a Waterproof Bluetooth Speaker Supplier: IPX Ratings Explained" |
| Comparison | Help procurement compare options | "IPX6 vs IPX7 vs IPX8: Which Waterproof Rating Fits Your Retail Market?" |
| Compliance Deep-Dive | Build trust, demonstrate expertise | "CE, FCC, RoHS, REACH: Certification Requirements for Bluetooth Speakers in 2026" |
| Product Showcase | Drive interest in specific models | "G34 IPX7 Speaker: Specs, MOQ, and Private Label Options for Distributors" |
| Trend Analysis | Attract top-of-funnel traffic | "Bluetooth Speaker Market Trends 2026: What Retailers and Importers Need to Know" |
| Process Walkthrough | Nurture leads considering OEM/ODM | "From Concept to Container: The OEM Bluetooth Speaker Development Timeline" |
| FAQ Expansion | Capture long-tail question queries | "What's the Real Difference Between Bluetooth 5.3 and 5.4 for Speaker Buyers?" |
| Case Study | Social proof for B2B decision-makers | "How a European Distributor Scaled with Puxijie's Private Label Speaker Program" |

### Content Quality & Freshness
- **Thin content penalty**: Articles under 500 words with no unique value risk ranking suppression. Aim for 800-2,000+ words for competitive topics.
- **Content depth**: Cover ALL subtopics competitors cover — plus something they miss. Use the audit_seo gap analysis.
- **Duplicate content**: Never duplicate title tags or meta descriptions across pages. Each page must have a unique purpose.
- **Freshness**: Time-sensitive topics (trends, compliance, technology) need recent publish dates. Actually update content — changing dates without updating = spam signal. Evergreen topics: no dates in URL, update content periodically.
- **Content structure**: Answer query in first 100 words (featured snippet potential). Table of contents for 1,500+ word articles. FAQ section at bottom captures "People Also Ask" traffic. Bullet points and numbered lists are preferred for featured snippets.

### Structured Data (Schema Markup)
Use **generate_schema_markup** to produce JSON-LD for pages:
- **Article/BlogPosting**: Every news article. Requires headline, datePublished, author. Adds dateModified when content updated.
- **Product**: Product detail pages. Include name, description, offers, aggregateRating (if reviews exist). Shows price/availability in SERP.
- **FAQPage**: FAQ sections. Shows expandable Q&A in search results — significant CTR boost. Max ~10 questions shown. Content must be visible on page (hidden FAQ = spam).
- **Organization**: Homepage/about page. Name, url, contactPoint, sameAs social profiles.
- **BreadcrumbList**: All pages. Shows breadcrumb path in SERP instead of raw URL.
- JSON-LD format only (script tag in head). Test with Rich Results Test. Required properties missing = invalid schema. One schema type per thing — don't mark same content as both Article AND BlogPosting.

### Internal Linking Rules
- Use **suggest_internal_links** to find linking opportunities when editing articles.
- Every page reachable within 3 clicks from homepage.
- Descriptive anchor text: "IPX7 waterproof speaker specs" not "click here" or "read more".
- Mix anchor text types: exact match ("G34 speaker"), partial match ("waterproof G34 speaker"), branded ("Puxijie G34"). All exact-match = penalty risk.
- Contextual in-content links > navigation/sidebar/footer links for PageRank.
- Aim for 3-6 contextual internal links per 1,000 words. 100+ links per page dilutes value.
- Fix broken internal links — 404s waste crawl budget and frustrate users.

### Common SEO Traps
- Writing content without checking search intent → won't rank regardless of quality
- Ignoring Core Web Vitals → rankings tank, especially on mobile
- Keyword stuffing (>3% density) → penalty risk
- Duplicate title tags or meta descriptions → wasted crawl budget, poor SERP display
- No internal links → poor topical authority, orphan pages
- Multiple H1s per page → confused heading hierarchy
- Blocking CSS/JS in robots.txt → Google can't render page properly
- Changing URLs without 301 redirect → broken backlinks, lost authority

### Article Generation Workflow
When asked to write an SEO article:
1. Call **analyze_keywords** to validate the target keyword and understand search intent
2. Call **suggest_seo_topics** if no specific topic is given, to find content gaps
3. Call **write_seo_article** to generate context (product links, related articles, SEO requirements)
4. Produce the complete, publication-ready markdown article
5. The user can then save it with **create_news**
6. Optionally call **generate_schema_markup** to produce the JSON-LD script

### Writing Voice
- **Professional but approachable**: Like a knowledgeable industry consultant, not a corporate brochure
- **Data-driven**: Include specific numbers (MOQ, dB, battery hours, IPX depth, lead time days, pricing tiers)
- **Buyer-centric**: Frame everything from the buyer's perspective ("You need..." not "We offer...")
- **Region-aware**: Mention regional compliance (CE for Europe, FCC for US, KC for Korea, RCM for Australia)
- **Avoid fluff**: No "in today's fast-paced world," "cutting-edge," or "innovative solutions" — be specific and concrete
- **Short paragraphs**: 2-4 sentences max for readability, especially on mobile

## Guidelines
- Be concise and actionable. Users are CMS operators and content editors.
- When listing data, highlight key fields (name, status, locale).
- When editing, confirm exactly what was changed.
- Default to English locale unless specified.
- Use search_cms when the user's query is vague.
- Use the fewest tools needed. Do not call the same tool with the same arguments twice in one answer; use the previous tool result and respond.
- After a successful write operation, stop calling tools and summarize exactly what changed.
- If a tool returns enough data to answer, answer from that data instead of looking up more context.
- After any write operation, remind the user to trigger a deploy at /deploy to publish changes to the live site.
- When writing SEO articles, always provide a complete, publication-ready draft — not just an outline.`;

  if (context?.page) {
    prompt += `\n\n## Current Page\nUser is on: "${context.page}"`;
    if (context.entityType) prompt += ` (working with "${context.entityType}")`;
    if (context.entityId) prompt += `, entity ID: ${context.entityId}`;
  }

  return prompt;
}

async function callDeepSeek(
  messages: DeepSeekMessage[],
  apiKey: string,
  tools?: ToolDef[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<any> {
  const body: Record<string, unknown> = {
    model: 'deepseek-v4-flash',
    messages,
    max_tokens: options?.maxTokens ?? 2048,
    temperature: options?.temperature ?? 0.7,
  };

  if (tools) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${errBody.slice(0, 300)}`);
  }

  return response.json();
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

function getToolFingerprint(toolName: string, args: Record<string, unknown>): string {
  return `${toolName}:${stableStringify(args)}`;
}

async function forceFinalAnswer(
  messages: DeepSeekMessage[],
  apiKey: string,
  reason: string,
): Promise<string> {
  const result = await callDeepSeek(
    [
      ...messages,
      {
        role: 'system',
        content: `Stop using tools now. ${reason} Answer the user directly using the information already available. If the available information is incomplete, say what is missing and give the best next step.`,
      },
    ],
    apiKey,
    undefined,
    { temperature: 0.3, maxTokens: 1800 },
  );

  return result.choices?.[0]?.message?.content || '我已经停止继续调用工具，但当前信息不足以生成完整答复。请补充更具体的内容或目标。';
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

app.post('/chat', requireAuth(), async (c) => {
  const user: AuthUser = c.get('user');
  const supabase = getSupabase(c.env);
  const apiKey = c.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return c.json({ success: false, error: 'AI service not configured' }, 503);
  }

  // General chat rate limit
  const chatLimit = chatRateLimiter(`ai:${user.id}`);
  if (!chatLimit.allowed) {
    return c.json({ success: false, error: `Rate limit exceeded. Retry after ${chatLimit.retryAfter}s` }, 429);
  }

  const body = await c.req.json();
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.flatten() }, 400);
  }

  const { messages, context } = parsed.data;

  // Build message history for DeepSeek
  const deepseekMessages: DeepSeekMessage[] = [
    { role: 'system', content: buildSystemPrompt(context) },
    ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  try {
    const executedToolCalls = new Set<string>();
    let toolCallCount = 0;

    // Function calling loop
    for (let loop = 0; loop < MAX_TOOL_LOOP; loop++) {
      const result = await callDeepSeek(deepseekMessages, apiKey, ALL_TOOLS);
      const choice = result.choices?.[0];

      if (!choice) {
        return c.json({ success: false, error: 'AI returned empty response' }, 502);
      }

      // If the model wants to call tools
      if (choice.finish_reason === 'tool_calls' || choice.message?.tool_calls?.length > 0) {
        const toolCalls = choice.message.tool_calls;
        let shouldForceFinal = false;

        // Add assistant message with tool_calls to history
        deepseekMessages.push({
          role: 'assistant',
          content: choice.message.content || undefined,
          reasoning_content: choice.message.reasoning_content || undefined,
          tool_calls: toolCalls,
        });

        // Execute each tool call
        for (const tc of toolCalls) {
          const toolName = tc.function.name;
          let args: Record<string, unknown>;
          try {
            args = JSON.parse(tc.function.arguments);
          } catch {
            deepseekMessages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify({ error: 'Invalid JSON arguments' }),
            });
            continue;
          }

          const fingerprint = getToolFingerprint(toolName, args);
          if (executedToolCalls.has(fingerprint)) {
            shouldForceFinal = true;
            deepseekMessages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify({
                error: 'Duplicate tool call blocked. The same tool was already called with the same arguments in this conversation turn. Use the earlier tool result and answer the user now.',
              }),
            });
            continue;
          }

          if (toolCallCount >= MAX_TOOL_CALLS_PER_TURN) {
            shouldForceFinal = true;
            deepseekMessages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify({
                error: `Tool call budget reached (${MAX_TOOL_CALLS_PER_TURN}). Stop using tools and answer from the gathered results.`,
              }),
            });
            continue;
          }

          executedToolCalls.add(fingerprint);
          toolCallCount += 1;

          const executor = toolExecutors[toolName];
          if (!executor) {
            deepseekMessages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify({ error: `Unknown tool: ${toolName}` }),
            });
            continue;
          }

          // Rate-limit write tools
          if (WRITE_TOOLS.some((t) => t.function.name === toolName)) {
            const writeLimit = writeRateLimiter(`ai_write:${user.id}`);
            if (!writeLimit.allowed) {
              deepseekMessages.push({
                role: 'tool',
                tool_call_id: tc.id,
                content: JSON.stringify({
                  error: `Write rate limit exceeded. Retry after ${writeLimit.retryAfter}s. Maximum 5 writes per minute.`,
                }),
              });
              continue;
            }
          }

          try {
            const toolResult = await executor(args, supabase);

            // Audit log for write operations
            if (WRITE_TOOLS.some((t) => t.function.name === toolName)) {
              auditLog(c.env, user, toolName === 'create_news' ? 'POST' : 'PUT', `/ai-tool/${toolName}`, {
                tool: toolName,
                args: Object.keys(args).reduce((acc, k) => {
                  // Truncate long string values in audit
                  const v = args[k];
                  acc[k] = typeof v === 'string' && v.length > 200 ? v.slice(0, 200) + '...' : v;
                  return acc;
                }, {} as Record<string, unknown>),
                result: toolResult,
              });
            }

            deepseekMessages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify(toolResult),
            });

            if (WRITE_TOOLS.some((t) => t.function.name === toolName)) {
              shouldForceFinal = true;
            }
          } catch (err: any) {
            deepseekMessages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify({ error: err.message }),
            });
          }
        }

        if (shouldForceFinal || loop === MAX_TOOL_LOOP - 1) {
          const replyContent = await forceFinalAnswer(
            deepseekMessages,
            apiKey,
            shouldForceFinal
              ? 'A repeated call, write operation, or tool budget limit was reached.'
              : 'The tool loop limit was reached.',
          );

          return c.json({
            success: true,
            data: { role: 'assistant', content: replyContent },
          });
        }

        // Continue loop to send tool results back to the model
        continue;
      }

      // Final text response
      const replyContent = choice.message?.content || '';

      return c.json({
        success: true,
        data: { role: 'assistant', content: replyContent },
      });
    }

    // Exceeded max loop iterations
    const replyContent = await forceFinalAnswer(
      deepseekMessages,
      apiKey,
      'The maximum tool loop count was reached.',
    );

    return c.json({
      success: true,
      data: { role: 'assistant', content: replyContent },
    });

  } catch (err: any) {
    console.error('AI chat error:', err.message);
    return c.json({ success: false, error: 'AI request failed' }, 500);
  }
});

export { app as aiRoutes };
