import fs from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://puxijietech.com';
const LOCALES = ['en', 'fr', 'vi'];
const NEWS_ROOT = path.resolve(process.cwd(), 'content', 'news');

function url(p) {
  return `${SITE}${p.startsWith('/') ? p : `/${p}`}`;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

async function getProductSlugs() {
  try {
    const generatedPath = path.resolve(
      process.cwd(),
      'src/features/products/data/products.generated.js',
    );
    const raw = await fs.readFile(generatedPath, 'utf8');
    const slugs = [];
    const slugRegex = /\bslug:\s*["']([^"']+)["']/g;
    let match;
    while ((match = slugRegex.exec(raw)) !== null) {
      if (!slugs.includes(match[1])) slugs.push(match[1]);
    }
    return slugs;
  } catch {
    return [
      'g34', 'g31', 'g23', 'g21', 'g14', 'a5', 'f19', 'g29', 'g06',
      'c-01', 'c-01-cotton', 'me-136', 'me-88p', 'me-636', 'me-176',
    ];
  }
}

async function getProductCategories() {
  try {
    const generatedPath = path.resolve(
      process.cwd(),
      'src/features/products/data/products.generated.js',
    );
    const raw = await fs.readFile(generatedPath, 'utf8');
    const categories = new Set();
    const catRegex = /\bcategory:\s*["']([^"']+)["']/g;
    let match;
    while ((match = catRegex.exec(raw)) !== null) {
      categories.add(match[1]);
    }
    return [...categories].sort();
  } catch {
    return [
      'Waterproof Bluetooth Speaker',
      'Normal Bluetooth Speaker',
      'Specialty Speaker',
      'Bluetooth Earbuds',
    ];
  }
}

async function getNewsSlugs() {
  const slugs = new Map();
  try {
    for (const l of LOCALES) {
      const dir = path.join(NEWS_ROOT, l);
      const files = await fs.readdir(dir).catch(() => []);
      const localeSlugs = [];
      for (const f of files) {
        if (!f.toLowerCase().endsWith('.md')) continue;
        localeSlugs.push(f.replace(/\.md$/i, ''));
      }
      slugs.set(l, localeSlugs);
    }
  } catch {
    // ignore
  }
  return slugs;
}

function renderUrlXml(entry) {
  const parts = [`    <loc>${esc(entry.loc)}</loc>`];
  if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  if (entry.priority) parts.push(`    <priority>${entry.priority}</priority>`);
  return `  <url>\n${parts.join('\n')}\n  </url>`;
}

function renderSitemapXml(productSlugs, productCategories, newsByLocale) {
  const now = new Date().toISOString();
  const lines = [];

  for (const l of LOCALES) {
    const section = (title) => lines.push(`  <!-- ${title} [${l}] -->`);

    // ---- Main Pages ----
    section('Main Pages');
    const mainPages = [
      { loc: url(`/${l}/`), priority: '1.0', changefreq: 'weekly' },
      { loc: url(`/${l}/products`), priority: '0.9', changefreq: 'daily' },
      { loc: url(`/${l}/b2b`), priority: '0.8', changefreq: 'monthly' },
      { loc: url(`/${l}/contact`), priority: '0.8', changefreq: 'monthly' },
      { loc: url(`/${l}/about-us`), priority: '0.7', changefreq: 'monthly' },
      { loc: url(`/${l}/lab`), priority: '0.7', changefreq: 'monthly' },
    ];
    for (const p of mainPages) {
      lines.push(renderUrlXml({ ...p, lastmod: now }));
    }

    // ---- Product Category Pages ----
    section('Product Categories');
    for (const cat of productCategories) {
      lines.push(renderUrlXml({
        loc: url(`/${l}/products?category=${encodeURIComponent(cat)}`),
        lastmod: now,
        priority: '0.7',
        changefreq: 'weekly',
      }));
    }

    // ---- Product Detail Pages ----
    section('Product Detail Pages');
    for (const slug of productSlugs) {
      lines.push(renderUrlXml({
        loc: url(`/${l}/model/${slug}`),
        lastmod: now,
        priority: '0.8',
        changefreq: 'monthly',
      }));
    }

    // ---- Resources ----
    section('Resources');
    const resourcePages = [
      { loc: url(`/${l}/news`), priority: '0.7', changefreq: 'daily' },
      { loc: url(`/${l}/faq`), priority: '0.6', changefreq: 'monthly' },
      { loc: url(`/${l}/help-center`), priority: '0.5', changefreq: 'monthly' },
      { loc: url(`/${l}/catalog-downloads`), priority: '0.5', changefreq: 'monthly' },
    ];
    for (const p of resourcePages) {
      lines.push(renderUrlXml({ ...p, lastmod: now }));
    }

    // ---- News Articles ----
    const newsSlugs = newsByLocale.get(l) || [];
    if (newsSlugs.length > 0) {
      section('News Articles');
      for (const slug of newsSlugs) {
        lines.push(renderUrlXml({
          loc: url(`/${l}/news/${slug}`),
          lastmod: now,
          priority: '0.6',
          changefreq: 'monthly',
        }));
      }
    }

    // ---- Legal ----
    section('Legal');
    const legalPages = [
      { loc: url(`/${l}/terms-of-use`), priority: '0.3', changefreq: 'yearly' },
      { loc: url(`/${l}/privacy`), priority: '0.3', changefreq: 'yearly' },
      { loc: url(`/${l}/warranty`), priority: '0.3', changefreq: 'yearly' },
      { loc: url(`/${l}/do-not-sell-share-my-data`), priority: '0.3', changefreq: 'yearly' },
    ];
    for (const p of legalPages) {
      lines.push(renderUrlXml({ ...p, lastmod: now }));
    }

    // ---- Other ----
    section('Other');
    const otherPages = [
      { loc: url(`/${l}/sitemap`), priority: '0.2', changefreq: 'yearly' },
      { loc: url(`/${l}/puxijie-lab`), priority: '0.4', changefreq: 'yearly' },
    ];
    for (const p of otherPages) {
      lines.push(renderUrlXml({ ...p, lastmod: now }));
    }

    lines.push(''); // blank line between locales
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join('\n')}\n</urlset>\n`;
}

function renderLlmsTxt(productSlugs, productCategories) {
  const lines = [];
  lines.push('Puxijie (puxijietech.com) — B2B OEM/ODM audio manufacturer for waterproof Bluetooth speakers, portable wireless speakers, specialty speakers, and Bluetooth earbuds.');
  lines.push('');
  lines.push('Languages: English (en), French (fr), Vietnamese (vi).');
  lines.push('Primary buyer contact: WeChat ID EricH0625.');
  lines.push('');
  lines.push('Buyer intent served: OEM Bluetooth speaker manufacturer, waterproof speaker wholesale supplier, private label portable speaker factory, Bluetooth earbuds wholesale, IPX6/IPX7 outdoor speaker sourcing, RFQ-ready consumer electronics procurement.');
  lines.push('');
  lines.push('Public pricing policy: product pages do not publish unit prices; RFQs are quoted by project after quantity, destination market, packaging, logo, compliance, and timeline are confirmed.');
  lines.push('');
  lines.push('Verified product models:');
  for (const slug of productSlugs) lines.push(`- ${slug.toUpperCase()}: ${url(`/en/model/${slug}`)}`);
  lines.push('');
  lines.push('Product categories:');
  for (const cat of productCategories) {
    lines.push(`- ${cat}: ${url(`/en/products?category=${encodeURIComponent(cat)}`)}`);
  }
  lines.push('');
  lines.push('Product data exposed for crawling: model code, category, IP rating where applicable, chipset, Bluetooth version, battery configuration, transmission distance, MOQ guidance, color options, package size, carton quantity, carton weight, and buyer RFQ notes.');
  lines.push('What we offer: OEM/ODM programs, wholesale supply, private label audio products, brand packaging support, distributor sourcing support, and export-ready product documentation.');
  lines.push('Compliance support: CE / FCC / RoHS and waterproof test reports provided where applicable.');
  lines.push('');
  lines.push('Important pages:');
  lines.push(`- Products: ${url('/en/products')}`);
  lines.push(`- B2B & Wholesale: ${url('/en/b2b')}`);
  lines.push(`- Lab & reports: ${url('/en/lab')}`);
  lines.push(`- Contact: ${url('/en/contact')}`);
  return `${lines.join('\n')}\n`;
}

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public');
  await fs.mkdir(publicDir, { recursive: true });

  const [productSlugs, productCategories, newsByLocale] = await Promise.all([
    getProductSlugs(),
    getProductCategories(),
    getNewsSlugs(),
  ]);

  const sitemap = renderSitemapXml(productSlugs, productCategories, newsByLocale);
  await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');

  const llms = renderLlmsTxt(productSlugs, productCategories);
  await fs.writeFile(path.join(publicDir, 'llms.txt'), llms, 'utf8');

  const urlCount = sitemap.split('\n').filter((l) => l.includes('<url>')).length;
  console.log(`[geo] sitemap.xml — ${urlCount} URLs across ${LOCALES.length} locales (with priority + changefreq)`);
  console.log(`[geo] llms.txt — updated`);
}

await main();
