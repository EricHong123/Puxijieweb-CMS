import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(webRoot, '.out');
const sourceIndex = path.join(outDir, 'index.html');
const locales = ['en', 'fr', 'vi'];

const localizedRoutes = [
  '',
  'products',
  'lab',
  'puxijie-lab',
  'b2b',
  'contact',
  'about-us',
  'faq',
  'terms-of-use',
  'warranty',
  'privacy',
  'do-not-sell-share-my-data',
  'help-center',
  'catalog-downloads',
  'news',
  'sitemap',
];

const topLevelRoutes = [
  'products',
  'lab',
  'puxijie-lab',
  'b2b',
  'contact',
  'about-us',
  'faq',
  'terms-of-use',
  'warranty',
  'privacy',
  'do-not-sell-share-my-data',
  'help-center',
  'catalog-downloads',
  'news',
  'sitemap',
];

const modelRoutes = [
  { slug: 'g31', legacyId: 'qw-g31' },
  { slug: 'g34', legacyId: 'qw-g34' },
  { slug: 'c-01', legacyId: 'qw-c-01' },
  { slug: 'c-01-cotton', legacyId: 'qw-c-01-cotton' },
  { slug: 'a5', legacyId: 'qw-a5' },
  { slug: 'f19', legacyId: 'qw-f19' },
  { slug: 'g29', legacyId: 'qw-g29' },
  { slug: 'g21', legacyId: 'qw-g21' },
  { slug: 'g23', legacyId: 'qw-g23' },
  { slug: 'g06', legacyId: 'qw-g06' },
  { slug: 'g14', legacyId: 'qw-g14' },
  { slug: 'me-728', legacyId: 'me-728' },
  { slug: 'me-136', legacyId: 'me-136' },
  { slug: 'me-76', legacyId: 'me-76' },
  { slug: 'me-88p', legacyId: 'me-88p' },
  { slug: 'me-636', legacyId: 'me-636' },
  { slug: 'me-176', legacyId: 'me-176' },
];

async function ensureRouteIndex(route, html) {
  const cleanRoute = route.replace(/^\/+|\/+$/g, '');
  const targetDir = cleanRoute ? path.join(outDir, cleanRoute) : outDir;
  const targetFile = path.join(targetDir, 'index.html');

  try {
    await fs.access(targetFile);
    return;
  } catch {
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(targetFile, html, 'utf8');
  }
}

async function main() {
  const html = await fs.readFile(sourceIndex, 'utf8');

  for (const route of topLevelRoutes) {
    await ensureRouteIndex(route, html);
  }

  await ensureRouteIndex('404', html);

  for (const locale of locales) {
    for (const route of localizedRoutes) {
      const fullRoute = route ? `${locale}/${route}` : locale;
      await ensureRouteIndex(fullRoute, html);
    }

    for (const model of modelRoutes) {
      await ensureRouteIndex(`${locale}/model/${model.slug}`, html);
      await ensureRouteIndex(`${locale}/products/${model.legacyId}`, html);
      await ensureRouteIndex(`${locale}/products/${model.slug}/model`, html);
    }
  }
}

await main();
