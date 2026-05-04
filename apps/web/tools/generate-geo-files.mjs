import fs from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://puxijietech.com';
const LOCALES = ['en', 'fr', 'vi'];
const NEWS_ROOT = path.resolve(process.cwd(), 'content', 'news');

// Static pages present on the site (per locale)
const STATIC_PAGES = [
  '/',
  '/products',
  '/b2b',
  '/contact',
  '/lab',
  '/about-us',
  '/faq',
  '/help-center',
  '/catalog-downloads',
  '/puxijie-lab',
  '/sitemap',
  '/news',
  '/terms-of-use',
  '/privacy',
  '/warranty',
  '/do-not-sell-share-my-data',
];

function url(p) {
  return `${SITE}${p.startsWith('/') ? p : `/${p}`}`;
}

async function getProductSlugs() {
  try {
    const generatedPath = path.resolve(
      process.cwd(),
      'src/features/products/data/products.generated.js',
    );
    const raw = await fs.readFile(generatedPath, 'utf8');
    // Extract slug values from the generated file
    const slugs = [];
    const slugRegex = /\bslug:\s*["']([^"']+)["']/g;
    let match;
    while ((match = slugRegex.exec(raw)) !== null) {
      if (!slugs.includes(match[1])) slugs.push(match[1]);
    }
    return slugs;
  } catch {
    // Fallback: hardcoded list for CI environments where generated file may not exist yet
    return [
      'g34', 'g31', 'g23', 'g21', 'g14', 'a5', 'f19', 'g29', 'g06',
      'c-01', 'c-01-cotton', 'me-136', 'me-88p', 'me-636', 'me-176',
    ];
  }
}

async function getNewsSlugs() {
  const slugs = new Map(); // locale -> [slug]
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

function renderSitemapXml(productSlugs, newsByLocale) {
  const now = new Date().toISOString();
  const urls = [];

  for (const l of LOCALES) {
    // Static pages
    for (const page of STATIC_PAGES) {
      urls.push({ loc: url(`/${l}${page}`), lastmod: now });
    }
    // Product model pages
    for (const slug of productSlugs) {
      urls.push({ loc: url(`/${l}/model/${slug}`), lastmod: now });
    }
    // News articles
    const newsSlugs = newsByLocale.get(l) || [];
    for (const slug of newsSlugs) {
      urls.push({ loc: url(`/${l}/news/${slug}`), lastmod: now });
    }
  }

  const body = urls
    .sort((a, b) => a.loc.localeCompare(b.loc))
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function renderLlmsTxt(productSlugs) {
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

  const [productSlugs, newsByLocale] = await Promise.all([
    getProductSlugs(),
    getNewsSlugs(),
  ]);

  const sitemap = renderSitemapXml(productSlugs, newsByLocale);
  await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');

  const llms = renderLlmsTxt(productSlugs);
  await fs.writeFile(path.join(publicDir, 'llms.txt'), llms, 'utf8');

  console.log(`[geo] sitemap.xml — ${(sitemap.split('\n').filter((l) => l.includes('<url>')).length)} URLs across ${LOCALES.length} locales`);
  console.log(`[geo] llms.txt — updated`);
}

await main();
