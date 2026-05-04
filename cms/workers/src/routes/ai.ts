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

const MAX_TOOL_LOOP = 5;

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

const ALL_TOOLS: ToolDef[] = [...READ_ONLY_TOOLS, ...WRITE_TOOLS];

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
  let prompt = `You are an AI assistant for the Puxijie CMS (puxijietech.com), a B2B Bluetooth audio products company. You have access to real-time data from the CMS database and can help users view, search, and edit content.

## Capabilities
- **Read**: Query products (with full specs/translations), news articles, FAQ sections, legal pages, site settings, and CMS-wide statistics.
- **Write**: Update product fields (translations + specs), create/edit news articles, update FAQ sections, and modify site settings.

## Content Structure
- **Products**: slug, category (waterproof_bt/normal_bt/specialty/earbuds), translations (en/fr/vi) with name/subtitle/features[ ]/benefits[ ]/description_html/procurement_notes[ ], specs (ipx_rating, battery_life, chipset, bluetooth_version, etc.), images
- **News**: slug, locale, title, description, body_markdown, keywords[ ], hero_image_url, is_published
- **FAQ**: section_key, locale, title, items[ ] (q/a pairs)
- **Legal**: page_type (terms/privacy/warranty/do-not-sell), translations with title/sections[ ]
- **Site Settings**: key-value pairs (site_name, contact_info, social_links, seo_defaults, theme, google_analytics_id)

## Guidelines
- Be concise and actionable. Users are CMS operators.
- When listing data, highlight key fields (name, status, locale).
- When editing, confirm exactly what was changed.
- Default to English locale unless specified.
- Use search_cms when the user's query is vague.
- After any write operation, remind the user to trigger a deploy at /deploy to publish changes to the live site.`;

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
): Promise<any> {
  const body: Record<string, unknown> = {
    model: 'deepseek-v4-flash',
    messages,
    max_tokens: 2048,
    temperature: 0.7,
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
          } catch (err: any) {
            deepseekMessages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify({ error: err.message }),
            });
          }
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
    return c.json({
      success: true,
      data: { role: 'assistant', content: 'I ran into a loop while processing your request. Please try rephrasing.' },
    });

  } catch (err: any) {
    console.error('AI chat error:', err.message);
    return c.json({ success: false, error: 'AI request failed' }, 500);
  }
});

export { app as aiRoutes };
