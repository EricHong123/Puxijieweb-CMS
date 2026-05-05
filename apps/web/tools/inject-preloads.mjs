/**
 * Post-build: injects <link rel="preload"> for hero LCP image and critical CSS
 * into every static index.html so the browser starts fetching them before JS loads.
 *
 * Without this, the hero image (LCP element) can't start downloading until React
 * mounts and renders <img> — adding 2,000ms+ of render delay on slow connections.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(webRoot, '.out');

function collectHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'reports') {
      results.push(...collectHtmlFiles(full));
    } else if (entry.name === 'index.html') {
      results.push(full);
    }
  }
  return results;
}

/**
 * Scan built JS for hero-banner-new-1 image URLs and return separate preload
 * descriptors for desktop and mobile variants so the browser fetches the exact
 * URL that the <picture>/<img> will request later.
 */
function findHeroPreloads() {
  const assetsDir = path.join(outDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.warn('[inject-preloads] No assets/ directory — skipping hero preload');
    return null;
  }

  const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
  const urlPattern = /\/assets\/hero-banner-new-1[^\s")]+\.webp/g;

  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
    const found = new Set();
    let m;
    while ((m = urlPattern.exec(content)) !== null) {
      found.add(m[0]);
    }
    if (found.size === 0) continue;

    // Separate into sized variants and base URLs.
    const allVariants = [];
    const baseByPrefix = new Map(); // hash prefix -> base URL

    for (const u of found) {
      const wm = u.match(/-(\d+)w\.webp$/);
      if (wm) {
        allVariants.push({ url: u, w: parseInt(wm[1], 10) });
      } else {
        // Base URL: extract the hash prefix (text between basename and .webp)
        // Format: /assets/hero-banner-new-1-{hash}.webp
        const hashMatch = u.match(/hero-banner-new-1-(.+)\.webp$/);
        if (hashMatch) {
          baseByPrefix.set(hashMatch[1], u);
        }
      }
    }

    // Group variants by their hash prefix.
    const groups = new Map(); // hashPrefix -> variants[]
    for (const v of allVariants) {
      // URL: /assets/hero-banner-new-1-{hash}-{width}w.webp
      const parts = v.url.match(/^\/assets\/hero-banner-new-1-(.+)-(\d+)w\.webp$/);
      if (parts) {
        const prefix = parts[1];
        if (!groups.has(prefix)) groups.set(prefix, []);
        groups.get(prefix).push(v);
      }
    }

    const result = [];

    for (const [prefix, variants] of groups) {
      variants.sort((a, b) => a.w - b.w);
      const base = baseByPrefix.get(prefix) || variants[variants.length - 1].url;
      const maxW = variants[variants.length - 1].w;
      const srcset = variants.map((v) => `${v.url} ${v.w}w`).join(', ');

      // maxW >= 960 → desktop import (quality=60, wider sizes)
      // maxW <= 800 → mobile import (quality=50, narrower sizes)
      const isDesktop = maxW >= 960;

      result.push({
        base,
        srcset,
        media: isDesktop ? '(min-width: 768px)' : '(max-width: 767px)',
      });
    }

    if (result.length > 0) return result;
  }

  console.warn('[inject-preloads] Could not find hero image URLs in built JS');
  return null;
}

function findCssFile() {
  const assetsDir = path.join(outDir, 'assets');
  if (!fs.existsSync(assetsDir)) return null;

  const cssFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.css'));
  const main = cssFiles.find((f) => f.startsWith('index-'));
  return main ? `/assets/${main}` : null;
}

function main() {
  const heroPreloads = findHeroPreloads();
  const cssUrl = findCssFile();
  const htmlFiles = collectHtmlFiles(outDir);

  if (!heroPreloads && !cssUrl) {
    console.log('[inject-preloads] Nothing to inject');
    return;
  }

  let updatedCount = 0;
  for (const filePath of htmlFiles) {
    let html = fs.readFileSync(filePath, 'utf8');

    if (html.includes('data-preload-injected')) continue;

    const tags = [];

    if (heroPreloads) {
      for (const h of heroPreloads) {
        tags.push(
          `  <link rel="preload" as="image" href="${h.base}" imagesrcset="${h.srcset}" imagesizes="100vw" media="${h.media}" fetchpriority="high" data-preload-injected>`,
        );
      }
    }

    if (cssUrl) {
      tags.push(
        `  <link rel="preload" as="style" href="${cssUrl}" crossorigin data-preload-injected>`,
      );
    }

    const marker = '<link rel="icon"';
    const idx = html.indexOf(marker);
    if (idx !== -1) {
      const endOfTag = html.indexOf('>', idx) + 1;
      html = html.slice(0, endOfTag) + '\n' + tags.join('\n') + html.slice(endOfTag);
      fs.writeFileSync(filePath, html, 'utf8');
      updatedCount++;
    }
  }

  const parts = [];
  if (heroPreloads) parts.push(`hero image (${heroPreloads.length} variants)`);
  if (cssUrl) parts.push(`CSS (${cssUrl})`);
  console.log(`[inject-preloads] Updated ${updatedCount} files with preloads for: ${parts.join(', ')}`);
}

main();
