import fs from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://puxijietech.com';
const LOCALES = ['en', 'fr', 'vi'];
const NEWS_ROOT = path.resolve(process.cwd(), 'content', 'news');
const MODELS = [
  { slug: 'g34', name: 'G34' },
  { slug: 'g31', name: 'G31' },
  { slug: 'g23', name: 'G23' },
  { slug: 'g21', name: 'G21' },
  { slug: 'g14', name: 'G14' },
  { slug: 'a5', name: 'A5' },
  { slug: 'f19', name: 'F19' },
  { slug: 'g29', name: 'G29' },
  { slug: 'g06', name: 'G06' },
  { slug: 'c-01', name: 'C-01 Bell' },
  { slug: 'c-01-cotton', name: 'C-01 Cotton' },
  { slug: 'me-136', name: 'ME-136' },
  { slug: 'me-88p', name: 'ME-88P' },
  { slug: 'me-636', name: 'ME-636' },
  { slug: 'me-176', name: 'ME-176' },
];

function url(p) {
  return `${SITE}${p.startsWith('/') ? p : `/${p}`}`;
}

function getAllUrls() {
  const urls = [];
  for (const l of LOCALES) {
    urls.push(`/${l}/`);
    urls.push(`/${l}/products`);
    urls.push(`/${l}/b2b`);
    urls.push(`/${l}/contact`);
    urls.push(`/${l}/lab`);
    urls.push(`/${l}/about-us`);
    urls.push(`/${l}/faq`);
    for (const m of MODELS) {
      urls.push(`/${l}/model/${m.slug}`);
    }
  }
  return urls;
}

async function getNewsUrls() {
  const out = [];
  try {
    for (const l of LOCALES) {
      const dir = path.join(NEWS_ROOT, l);
      // eslint-disable-next-line no-await-in-loop
      const files = await fs.readdir(dir).catch(() => []);
      for (const f of files) {
        if (!f.toLowerCase().endsWith('.md')) continue;
        const slug = f.replace(/\.md$/i, '');
        out.push(`/${l}/news/${slug}`);
      }
      out.push(`/${l}/news`);
    }
  } catch {
    // ignore
  }
  return out;
}

function renderSitemapXml(extraPaths = []) {
  const now = new Date().toISOString();
  const paths = [...getAllUrls(), ...extraPaths];
  const body = paths
    .map((p) => {
      return `  <url>\n    <loc>${url(p)}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function renderLlmsTxt() {
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
  for (const m of MODELS) lines.push(`- ${m.name}: ${url(`/en/model/${m.slug}`)}`);
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

  const newsUrls = await getNewsUrls();
  await fs.writeFile(path.join(publicDir, 'sitemap.xml'), renderSitemapXml(newsUrls), 'utf8');
  await fs.writeFile(path.join(publicDir, 'llms.txt'), renderLlmsTxt(), 'utf8');
}

await main();

