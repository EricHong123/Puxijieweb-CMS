import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const WEB_SRC = path.join(ROOT, 'apps/web/src');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Helpers ──────────────────────────────────────────────────────────

function readText(relativePath) {
  return readFileSync(path.resolve(ROOT, relativePath), 'utf-8');
}

function categoryToDb(cat) {
  const map = {
    'Bluetooth Earbuds': 'earbuds',
    'Specialty Speaker': 'specialty',
    'Waterproof Bluetooth Speaker': 'waterproof_bt',
    'Normal Bluetooth Speaker': 'normal_bt',
  };
  return map[cat] || 'normal_bt';
}

// Strip all import lines from a JS/JSX file
function stripImports(source) {
  return source.replace(/^import .+$/gm, '');
}

// Parse markdown frontmatter (--- yaml ---)
function parseFrontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: md };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { meta, body: match[2].trim() };
}

// Convert JSX FAQ answer content to plain HTML string
function jsxToHtml(jsxStr) {
  return jsxStr
    .replace(/^<>\s*/g, '')
    .replace(/\s*<\/>$/g, '')
    .replace(/^\s*\(\s*<>/g, '')
    .replace(/<\/>\)\s*$/g, '')
    .trim();
}

// Evaluate a JS expression in a sandbox and return the named variable
function evalJsVar(source, varName, sandbox = {}) {
  let cleaned = stripImports(source);
  // Replace export const/function/var with just const/function/var
  cleaned = cleaned.replace(/\bexport\s+(const|function|var|let)\b/g, '$1');
  // Remove "export { ... }" lines
  cleaned = cleaned.replace(/^export\s*\{[^}]*\};?\s*$/gm, '');
  const fn = new Function(...Object.keys(sandbox), `${cleaned}; return ${varName};`);
  return fn(...Object.values(sandbox));
}

// Extract all image variable names from import statements
function extractImageVarNames(source) {
  const names = [];
  const re = /^import\s+(\w+)\s+from\s+/gm;
  let m;
  while ((m = re.exec(source)) !== null) names.push(m[1]);
  return names;
}

// ── Product seeding ──────────────────────────────────────────────────

async function seedProducts() {
  console.log('── Seeding products ──');
  const source = readText('apps/web/src/features/products/data/products.data.js');

  // Mock all image imports with null
  const imgVars = extractImageVarNames(source);
  const sandbox = {};
  for (const v of imgVars) sandbox[v] = null;

  const rawProducts = evalJsVar(source, 'rawProducts', sandbox);
  const excelProductData = evalJsVar(source, 'excelProductData', sandbox);

  for (const raw of rawProducts) {
    const excel = excelProductData[raw.id] || {};
    const slug = raw.id;
    const category = categoryToDb(raw.category);

    // Check if product already exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      console.log(`  SKIP ${slug} (exists)`);
      continue;
    }

    // 1. Insert product
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .insert({
        slug,
        category,
        sort_order: rawProducts.indexOf(raw),
        is_published: true,
        downloads: raw.downloads || [],
      })
      .select('id')
      .single();

    if (prodErr) {
      console.error(`  FAIL product ${slug}:`, prodErr.message);
      continue;
    }
    const productId = product.id;

    // 2. Insert product_translations (en)
    const { error: transErr } = await supabase
      .from('product_translations')
      .insert({
        product_id: productId,
        locale: 'en',
        name: raw.name,
        subtitle: excel.subtitle || null,
        material: raw.material || excel.material || null,
        weight: raw.weight || excel.weight || null,
        dimensions: raw.dimensions || excel.dimensions || null,
        waterproof_depth: raw.waterproofDepth || excel.waterproofDepth || null,
        frequency_range: raw.frequencyRange || excel.frequencyRange || null,
        features: raw.features || [],
        benefits: raw.benefits || [],
        procurement_notes: excel.sheetVerified
          ? [
              '2026 specification parameters verified',
              excel.moqNote || 'OEM/ODM branding, packaging, and compliance support available',
              'Final quotation is issued after quantity, packaging, branding, certification, and destination market are confirmed',
            ]
          : [
              'Confirm final specification before order',
              excel.moqNote || 'OEM/ODM branding, packaging, and compliance support available',
              'Final quotation is issued after quantity, packaging, branding, certification, and destination market are confirmed',
            ],
        description_html: null,
      });

    if (transErr) {
      console.error(`  FAIL translation ${slug}:`, transErr.message);
    }

    // 3. Insert product_specs
    const { error: specErr } = await supabase
      .from('product_specs')
      .insert({
        product_id: productId,
        ipx_rating: raw.ipxRating || excel.ipxRating || null,
        battery_life: raw.batteryLife || excel.batteryLife || null,
        chipset: excel.chipset || null,
        bluetooth_version: excel.bluetoothVersion || null,
        transmission_distance: excel.transmissionDistance || null,
        speaker_spec: excel.speakerSpec || null,
        battery_spec: excel.batterySpec || null,
        function_set: excel.functionSet || null,
        color_options: excel.colorOptions || null,
        moq: excel.moq || null,
        package_size: excel.packageSize || null,
        carton_size: excel.cartonSize || null,
        carton_quantity: excel.cartonQuantity || null,
        carton_weight: excel.cartonWeight || null,
        accessory_content: excel.accessoryContent || null,
      });

    if (specErr) {
      console.error(`  FAIL specs ${slug}:`, specErr.message);
    }

    console.log(`  OK ${slug} (${raw.name})`);
  }

  console.log(`  Done: ${rawProducts.length} products processed\n`);
}

// ── FAQ seeding ──────────────────────────────────────────────────────

function extractFaqSections(source, varName) {
  // Find the const declaration and extract all Q&A items
  const regex = new RegExp(`${varName}\\s*=\\s*\\[([\\s\\S]*?)\\n\\];`, 'm');
  const match = source.match(regex);
  if (!match) throw new Error(`Cannot find ${varName}`);

  const block = match[1];
  const sections = [];

  // Parse each section
  const sectionRe = /\{\s*\n\s*id:\s*'([^']+)',\s*\n\s*shortTitle:\s*'([^']+)',\s*\n\s*title:\s*'([^']+)',\s*\n\s*items:\s*\[([\s\S]*?)\],\s*\n\s*\}/g;
  let secMatch;
  while ((secMatch = sectionRe.exec(block)) !== null) {
    const [, id, shortTitle, title, itemsBlock] = secMatch;
    const items = [];
    // Parse each Q&A item
    const itemRe = /\{\s*\n\s*q:\s*'((?:[^'\\]|\\.)*)',\s*\n\s*a:\s*\(([\s\S]*?)\),?\s*\n\s*\}/g;
    let itemMatch;
    while ((itemMatch = itemRe.exec(itemsBlock)) !== null) {
      const [, q, aRaw] = itemMatch;
      items.push({ q, a: jsxToHtml(aRaw) });
    }
    sections.push({ id, shortTitle, title, items });
  }

  return sections;
}

async function seedFaq() {
  console.log('── Seeding FAQ ──');
  const source = readText('apps/web/src/features/faq/data/faqExtendedSections.jsx');

  const sectionsEn = extractFaqSections(source, 'SECTIONS_EN');
  const sectionsFr = extractFaqSections(source, 'SECTIONS_FR');
  const sectionsVi = extractFaqSections(source, 'SECTIONS_VI');

  const localeMap = { en: sectionsEn, fr: sectionsFr, vi: sectionsVi };
  let total = 0;

  for (const [locale, sections] of Object.entries(localeMap)) {
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const sectionKey = s.id;

      const { data: existing } = await supabase
        .from('faq_sections')
        .select('id')
        .eq('section_key', sectionKey)
        .eq('locale', locale)
        .single();

      if (existing) {
        console.log(`  SKIP ${sectionKey}/${locale} (exists)`);
        continue;
      }

      const { error } = await supabase.from('faq_sections').insert({
        section_key: sectionKey,
        locale,
        short_title: s.shortTitle,
        title: s.title,
        items: s.items,
        sort_order: i,
        is_published: true,
      });

      if (error) {
        console.error(`  FAIL ${sectionKey}/${locale}:`, error.message);
      } else {
        total++;
        console.log(`  OK ${sectionKey}/${locale}`);
      }
    }
  }

  console.log(`  Done: ${total} FAQ sections inserted\n`);
}

// ── News seeding ─────────────────────────────────────────────────────

async function seedNews() {
  console.log('── Seeding news ──');

  // Parse news.js for metadata
  const newsJsSource = readText('apps/web/src/features/news/data/news.js');
  const newsItems = evalJsVar(newsJsSource, 'newsItems');

  // Use README's approach: read MD files from content/news/{locale}/
  const contentNewsDir = path.join(ROOT, 'apps/web/content/news');
  const locales = ['en', 'fr', 'vi'];

  let total = 0;

  for (const item of newsItems) {
    const slug = item.id;

    for (const locale of locales) {
      const { data: existing } = await supabase
        .from('news_articles')
        .select('id')
        .eq('slug', slug)
        .eq('locale', locale)
        .single();

      if (existing) {
        console.log(`  SKIP ${slug}/${locale} (exists)`);
        continue;
      }

      const mdPath = path.join(contentNewsDir, locale, `${slug}.md`);
      let bodyMd = '';
      let keywords = [];
      let date = null;

      try {
        const mdContent = readFileSync(mdPath, 'utf-8');
        const { meta, body } = parseFrontmatter(mdContent);
        bodyMd = body;
        if (meta.keywords) {
          keywords = meta.keywords.split(',').map(k => k.trim());
        }
        if (meta.date) date = meta.date;
      } catch {
        // Use English markdown as fallback for other locales
        if (locale !== 'en') {
          try {
            const enPath = path.join(contentNewsDir, 'en', `${slug}.md`);
            const mdContent = readFileSync(enPath, 'utf-8');
            const { meta, body } = parseFrontmatter(mdContent);
            bodyMd = body;
            if (meta.keywords) {
              keywords = meta.keywords.split(',').map(k => k.trim());
            }
            if (meta.date) date = meta.date;
          } catch {
            bodyMd = `# ${item.title}\n\n${item.excerpt}`;
          }
        } else {
          bodyMd = `# ${item.title}\n\n${item.excerpt}`;
        }
      }

      const { error } = await supabase.from('news_articles').insert({
        slug,
        locale,
        title: item.title,
        description: item.excerpt,
        body_markdown: bodyMd,
        date: date || '2026-04-26',
        keywords,
        hero_image_url: item.image || null,
        is_published: true,
      });

      if (error) {
        console.error(`  FAIL ${slug}/${locale}:`, error.message);
      } else {
        total++;
        console.log(`  OK ${slug}/${locale}`);
      }
    }
  }

  console.log(`  Done: ${total} news articles inserted\n`);
}

// ── Legal pages seeding ──────────────────────────────────────────────

async function seedLegalPages() {
  console.log('── Seeding legal pages ──');
  const source = readText('apps/web/src/features/legal/data/legalPageCopy.js');
  const legalData = evalJsVar(source, 'LEGAL_PAGE_COPY');

  let total = 0;

  for (const [pageType, localeMap] of Object.entries(legalData)) {
    for (const [locale, data] of Object.entries(localeMap)) {
      const { data: existing } = await supabase
        .from('legal_page_translations')
        .select('id')
        .eq('page_type', pageType)
        .eq('locale', locale)
        .single();

      if (existing) {
        console.log(`  SKIP ${pageType}/${locale} (exists)`);
        continue;
      }

      // Map legacy data keys to DB enum values
      const dbPageType = pageType === 'privacyChoices' ? 'do-not-sell' : pageType;

      const { error } = await supabase.from('legal_page_translations').insert({
        page_type: dbPageType,
        locale,
        title: data.title,
        description: data.description,
        eyebrow: data.eyebrow,
        h1: data.h1,
        lead: data.lead,
        intro: data.intro || [],
        sections: data.sections || [],
      });

      if (error) {
        console.error(`  FAIL ${pageType}/${locale}:`, error.message);
      } else {
        total++;
        console.log(`  OK ${pageType}/${locale}`);
      }
    }
  }

  console.log(`  Done: ${total} legal pages inserted\n`);
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Seed Supabase from existing website data ===\n');

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    process.exit(1);
  }

  await seedProducts();
  await seedFaq();
  await seedNews();
  await seedLegalPages();

  console.log('=== Done! All existing content seeded to Supabase ===');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
