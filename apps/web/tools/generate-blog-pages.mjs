/**
 * Build-time news generator: Markdown → static HTML in .out/en/news/...
 *
 * - Reads apps/web/content/news/en/*.md
 * - Supports simple YAML-like frontmatter (--- ... ---) for title/description/date/keywords
 * - Outputs:
 *   - .out/en/news/index.html (listing)
 *   - .out/en/news/<slug>/index.html (article page)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { Marked } from 'marked';
import { getArticleEnhancement } from '../src/features/news/lib/articleEnhancements.js';

const SITE = 'https://puxijietech.com';
const LOCALES = ['en', 'fr', 'vi'];

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function slugFromFilename(filename) {
  return filename.replace(/\.md$/i, '').trim();
}

function parseFrontmatter(md) {
  const fmMatch = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!fmMatch) return { frontmatter: {}, body: md };
  const raw = fmMatch[1];
  const body = md.slice(fmMatch[0].length);

  const frontmatter = {};
  let currentKey = null;
  for (const line of raw.split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)\s*$/);
    if (kv) {
      const [, key, value] = kv;
      currentKey = key;
      if (value === '') {
        frontmatter[key] = [];
      } else {
        frontmatter[key] = value.replace(/^"|"$/g, '');
      }
      continue;
    }
    const listItem = line.match(/^\s*-\s+(.*)\s*$/);
    if (listItem && currentKey && Array.isArray(frontmatter[currentKey])) {
      frontmatter[currentKey].push(listItem[1].replace(/^"|"$/g, ''));
    }
  }

  return { frontmatter, body };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

function estimateReadingTimeMinutes(text) {
  const words = String(text)
    .replace(/[`*_#>\-\[\]\(\)!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function renderVisualBlock(block) {
  const imagesHtml = (block.images || [])
    .map(
      (image) => `
        <figure class="news-inline-visual__card">
          <div class="news-inline-visual__media">
            <img class="news-inline-visual__image" src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async" />
          </div>
          <figcaption class="news-inline-visual__caption">${escapeHtml(image.caption)}</figcaption>
        </figure>
      `.trim()
    )
    .join('');

  return `
    <section class="news-inline-visual">
      <div class="news-inline-visual__header">
        ${block.eyebrow ? `<p class="news-inline-visual__eyebrow">${escapeHtml(block.eyebrow)}</p>` : ''}
        ${block.title ? `<h3 class="news-inline-visual__title">${escapeHtml(block.title)}</h3>` : ''}
        ${block.description ? `<p class="news-inline-visual__description">${escapeHtml(block.description)}</p>` : ''}
      </div>
      <div class="news-inline-visual__grid news-inline-visual__grid--${Math.max(1, (block.images || []).length)}">
        ${imagesHtml}
      </div>
    </section>
  `.trim();
}

function collectSectionsFromMarkdown(body) {
  const sections = [];
  const slugCounts = new Map();
  for (const line of String(body).split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.*)\s*$/);
    if (!match) continue;
    const depth = match[1].length;
    const title = match[2].trim();
    const base = slugify(title);
    const count = slugCounts.get(base) || 0;
    slugCounts.set(base, count + 1);
    sections.push({
      id: count ? `${base}-${count}` : base,
      title,
      depth,
    });
  }
  return sections;
}

function injectVisualBlocks(html, sections, visualBlocks) {
  if (!visualBlocks?.length) return html;

  let output = html;
  for (const block of visualBlocks) {
    const targetSection = sections.find((section) => section.title === block.afterHeading);
    if (!targetSection) continue;
    const regex = new RegExp(`(<h[23] id="${targetSection.id}">[\\s\\S]*?<\\/h[23]>)`);
    output = output.replace(regex, `$1${renderVisualBlock(block)}`);
  }
  return output;
}

function renderSiteHeader(locale) {
  return `
<header class="news-mini-header">
  <div class="news-mini-header__inner">
    <a class="news-mini-header__back" href="/${locale}/news" aria-label="Back to News">
      <span class="news-mini-header__chev" aria-hidden="true">←</span>
      <span>Back</span>
    </a>
    <div class="news-mini-header__brand">Puxijie News</div>
  </div>
</header>
  `.trim();
}

function renderSiteFooter() {
  return `
<footer class="news-footer">
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-12">
      <div class="lg:col-span-4 space-y-4">
        <div class="text-xl font-bold text-white" style="letter-spacing:0;">Puxijie</div>
        <p class="text-sm text-slate-300 leading-relaxed max-w-[52ch]">
          OEM/ODM waterproof speaker manufacturer for brands, distributors, and wholesale programs.
        </p>
        <div class="space-y-2">
          <div class="flex items-start gap-3 text-sm text-slate-300">
            <span class="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300">✉</span>
            <a href="mailto:inquiry@puxijietech.com" class="hover:text-white hover:underline break-all">inquiry@puxijietech.com</a>
          </div>
          <div class="flex items-start gap-3 text-sm text-slate-300">
            <span class="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300">☎</span>
            <span>+86 13532328175</span>
          </div>
          <div class="flex items-start gap-3 text-sm text-slate-300">
            <span class="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300">⌖</span>
            <span class="leading-relaxed">Building 6, No. 49, Fenghuang 2nd Road, Humen Town, Dongguan City, Guangdong, China</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-slate-300">
            <span class="font-semibold text-white">WeChat:</span>
            <span>EricH0625</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-3">
        <div class="text-sm font-semibold uppercase tracking-wider text-white">Messaging</div>
        <p class="mt-3 text-sm text-slate-300 leading-relaxed">Scan to chat with our team.</p>
        <div class="mt-4 grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <div class="text-xs font-semibold text-white">WeChat</div>
            <div class="rounded-xl border border-white/10 bg-white/5 p-2">
              <img src="/images/qr-wechat.png" alt="WeChat QR code" loading="lazy" decoding="async" class="mx-auto h-28 w-28 sm:h-32 sm:w-32 object-contain" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="text-xs font-semibold text-white">WhatsApp</div>
            <div class="rounded-xl border border-white/10 bg-white/5 p-2">
              <img src="/images/qr-whatsapp.png" alt="WhatsApp QR code" loading="lazy" decoding="async" class="mx-auto h-28 w-28 sm:h-32 sm:w-32 object-contain" />
            </div>
          </div>
        </div>
        <p class="mt-3 text-xs text-slate-400">Tip: save these QR codes for faster contact.</p>
      </div>

      <div class="lg:col-span-3">
        <div class="text-sm font-semibold uppercase tracking-wider text-white">Company</div>
        <ul class="mt-4 space-y-2 text-sm text-slate-300">
          <li><a class="hover:text-white hover:underline" href="/en/about-us">About Us</a></li>
          <li><a class="hover:text-white hover:underline" href="/en/b2b">B2B &amp; Wholesale</a></li>
        </ul>
      </div>

      <div class="lg:col-span-2">
        <div class="text-sm font-semibold uppercase tracking-wider text-white">Support</div>
        <ul class="mt-4 space-y-2 text-sm text-slate-300">
          <li><a class="hover:text-white hover:underline" href="/en/news">News</a></li>
          <li><a class="hover:text-white hover:underline" href="/en/catalog-downloads">Catalog Downloads</a></li>
          <li><a class="hover:text-white hover:underline" href="/en/help-center">Help Center</a></li>
          <li><a class="hover:text-white hover:underline" href="/en/contact">Contact</a></li>
        </ul>
      </div>

      <div class="lg:col-span-2">
        <div class="text-sm font-semibold uppercase tracking-wider text-white">Policy</div>
        <ul class="mt-4 space-y-2 text-sm text-slate-300">
          <li><a class="hover:text-white hover:underline" href="/en/terms-of-use">Terms of Use</a></li>
          <li><a class="hover:text-white hover:underline" href="/en/privacy">Privacy</a></li>
          <li><a class="hover:text-white hover:underline" href="/en/warranty">Warranty</a></li>
        </ul>
      </div>
    </div>

    <div class="mt-12 border-t border-white/10 pt-6 text-sm text-slate-400 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p>© 2026 Puxijie. All rights reserved.</p>
      <p class="text-xs text-slate-400">OEM/ODM · Waterproof speakers · Wholesale</p>
    </div>
  </div>
</footer>
  `.trim();
}

function renderLayout({ locale, title, description, canonicalPath, articleJsonLd, contentHtml }) {
  const canonical = `${SITE}${canonicalPath}`;
  const pageTitle = `${title} | Puxijie`;
  const metaDesc = description ? escapeHtml(description) : '';

  // Use site Tailwind output by referencing built CSS (resolved at build time).
  // We avoid loading the SPA JS so the static article remains visible and crawlable.
  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content="Puxijie" />
    <title>${escapeHtml(pageTitle)}</title>
    ${description ? `<meta name="description" content="${metaDesc}" />` : ''}
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="alternate" hreflang="en" href="${escapeHtml(canonical)}" />
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(canonical)}" />
    <link rel="stylesheet" href="/assets/index.css" data-fallback="1" />
    <style>
      /* Static News layout: do NOT rely on Tailwind (purge-safe). */
      body {
        --mag-ink: #101010;
        --mag-muted: #5b5b5b;
        --mag-paper: #f7f7f3;
        --mag-line: #d8d8d2;
        --mag-accent: #bd1f2d;
        --mag-green: #17463b;
        margin: 0;
        color: var(--mag-ink);
        background: var(--mag-paper);
      }
      .news-container { max-width: 90rem; margin: 0 auto; padding: 1.4rem 1.125rem 4.5rem; }
      .news-stack { display: flex; flex-direction: column; gap: 1.75rem; }
      .news-card { background: transparent; border: 0; border-radius: 0; box-shadow: none; }
      .news-card-pad { padding: 0; }
      .news-breadcrumbs { font-size: 0.875rem; color: var(--mag-muted); }
      .news-breadcrumbs a { color: inherit; text-decoration: none; }
      .news-breadcrumbs a:hover { text-decoration: underline; color: var(--mag-ink); }
      .news-hero-grid {
        border-bottom: 1px solid var(--mag-ink);
        border-top: 3px solid var(--mag-ink);
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-top: 1rem;
        padding: 1.6rem 0 1.9rem;
        align-items: end;
      }
      .news-main-grid {
        border-top: 1px solid var(--mag-line);
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.75rem;
        align-items: start;
        max-width: 80rem;
        margin: 0 auto;
        padding-top: 1.75rem;
      }
      .news-aside { display: flex; flex-direction: column; gap: 1rem; border-bottom: 1px solid var(--mag-line); padding-bottom: 1.25rem; }
      @media (min-width: 1024px) {
        .news-hero-grid { grid-template-columns: minmax(0, 1.35fr) minmax(360px, .65fr); gap: 2rem; }
        .news-main-grid { grid-template-columns: minmax(0, 1fr) 300px; gap: 2rem; }
        .news-aside { position: sticky; top: 6rem; border-bottom: 0; grid-column: 2; grid-row: 1; }
        .news-article { grid-column: 1; grid-row: 1; }
      }

      /* Minimal header (single back button) */
      .news-mini-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(247,247,243,.94);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--mag-line);
      }
      .news-mini-header__inner{
        max-width: 80rem;
        margin: 0 auto;
        padding: 0 1rem;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .news-mini-header__back{
        display: inline-flex;
        align-items: center;
        gap: .5rem;
        padding: .5rem .75rem;
        border-radius: 0;
        border: 1px solid var(--mag-ink);
        background: transparent;
        color: var(--mag-ink);
        font-weight: 700;
        font-size: 14px;
        text-decoration: none;
      }
      .news-mini-header__back:hover{ background: var(--mag-ink); color: #fff; }
      .news-mini-header__chev{ font-size: 16px; line-height: 1; }
      .news-mini-header__brand {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0;
        text-transform: uppercase;
        color: var(--mag-accent);
      }
      .news-hero-images { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; margin-bottom: 1.5rem; }
      .news-hero-images__frame { aspect-ratio: 4 / 5; overflow: hidden; border-radius: 0; border: 1px solid var(--mag-line); background: #e7e7e1; }
      .news-hero-images__frame img { display: block; width: 100%; height: 100%; object-fit: cover; }

      .news-article {
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 18px;
        line-height: 1.75;
        max-width: 820px;
      }
      .news-article.prose :where(p, li) { line-height: 1.75; color: #292929; }
      .news-article.prose :where(h2) {
        margin-top: 3rem;
        padding-top: 1.25rem;
        border-top: 3px solid var(--mag-ink);
        color: var(--mag-ink);
        font-family: Georgia, "Times New Roman", serif;
        font-size: 2.125rem;
        font-weight: 500;
        letter-spacing: 0;
        line-height: 1.08;
      }
      .news-article.prose :where(h3) {
        margin-top: 2rem;
        color: var(--mag-ink);
        font-size: 1.25rem;
        letter-spacing: 0;
      }
      .news-article.prose :where(strong) { color: var(--mag-green); font-weight: 850; }
      .news-article.prose :where(a) { color: var(--mag-accent); font-weight: 800; }
      .news-article.prose :where(table) { width: 100%; border-collapse: collapse; margin-top: 1.75rem; display: block; overflow-x: auto; }
      .news-article.prose :where(thead) { background: #ededE8; }
      .news-article.prose :where(th, td) { border: 1px solid var(--mag-line); min-width: 160px; padding: .75rem; text-align: left; vertical-align: top; }
      .news-inline-visual { margin-top: 2rem; border-bottom: 1px solid var(--mag-line); border-top: 1px solid var(--mag-line); padding: 1.125rem 0 1.4rem; }
      .news-inline-visual__eyebrow { margin: 0; font-size: .75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0; color: var(--mag-accent); }
      .news-inline-visual__title { margin: .5rem 0 0; font-family: Georgia, "Times New Roman", serif; font-size: 1.56rem; line-height: 1.15; letter-spacing: 0; color: var(--mag-ink); font-weight: 500; }
      .news-inline-visual__description { margin: .6rem 0 0; font-size: .95rem; line-height: 1.6; color: var(--mag-muted); }
      .news-inline-visual__grid { display: grid; gap: 1rem; margin-top: 1.25rem; }
      @media (min-width: 768px) {
        .news-inline-visual__grid--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      .news-inline-visual__card { overflow: hidden; border-radius: 0; border: 1px solid var(--mag-line); background: transparent; }
      .news-inline-visual__media { aspect-ratio: 16 / 11; overflow: hidden; }
      .news-inline-visual__image { width: 100%; height: 100%; object-fit: cover; display: block; }
      .news-inline-visual__caption { padding: .7rem .75rem .8rem; font-size: .8125rem; line-height: 1.5; color: var(--mag-muted); }
      .news-card h1 { color: var(--mag-ink) !important; font-family: Georgia, "Times New Roman", serif; font-size: 3rem; font-weight: 500; line-height: .98; letter-spacing: 0 !important; }
      .news-card p, .news-card li, .news-card .text-slate-300, .news-card .text-gray-700 { color: #333 !important; }
      .news-card .text-white, .news-card .text-slate-950 { color: var(--mag-ink) !important; }
      .news-card .text-cyan-200 { color: var(--mag-accent) !important; }
      .news-card .bg-cyan-400, .news-card .bg-white\/6, .news-card .bg-cyan-400\/10 { background: transparent !important; }
      .news-card .border-white\/10, .news-card .border-cyan-400\/25, .news-card .border-white\/10 { border-color: var(--mag-line) !important; }
      .news-footer {
        border-top: 3px solid var(--mag-ink);
        background: var(--mag-ink);
        color: #fff;
      }
      @media (min-width: 760px) {
        .news-card h1 { font-size: 4.375rem; }
      }
      @media (max-width: 520px) {
        .news-container { padding-top: 1rem; }
        .news-card h1 { font-size: 2.25rem; }
        .news-article { font-size: 17px; }
        .news-article.prose :where(h2) { font-size: 1.8125rem; }
        .news-hero-images { margin-left: -1.125rem; margin-right: -1.125rem; }
      }

    </style>
    ${articleJsonLd ? `<script type="application/ld+json">${JSON.stringify(articleJsonLd)}</script>` : ''}
  </head>
  <body class="bg-gray-50 text-gray-900">
    ${renderSiteHeader(locale)}

    <main class="news-container">
      ${contentHtml}
    </main>

    ${renderSiteFooter()}
  </body>
</html>`;
}

async function findHashedCss(outDir) {
  const assetsDir = path.join(outDir, 'assets');
  const entries = await fs.readdir(assetsDir).catch(() => []);
  const css = entries.find((f) => /^index-.*\.css$/i.test(f)) || entries.find((f) => /\.css$/i.test(f));
  return css ? `/assets/${css}` : null;
}

async function writeFileEnsured(p, content) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content, 'utf8');
}

async function main() {
  const webRoot = process.cwd();
  const outDir = path.join(webRoot, '.out');

  const cssHref = await findHashedCss(outDir);

  for (const locale of LOCALES) {
    const contentDir = path.join(webRoot, 'content', 'news', locale);
    const mdFiles = (await fs.readdir(contentDir).catch(() => []))
      .filter((f) => f.toLowerCase().endsWith('.md'))
      .sort();

    if (mdFiles.length === 0) continue;

    const posts = [];
    for (const file of mdFiles) {
      const slug = slugFromFilename(file);
      const raw = await fs.readFile(path.join(contentDir, file), 'utf8');
      const { frontmatter, body } = parseFrontmatter(raw);
      const title = frontmatter.title || slug;
      const description = frontmatter.description || '';
      const date = frontmatter.date || '';
      const keywords = Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [];
      const sections = collectSectionsFromMarkdown(body);
      const enhancement = getArticleEnhancement(locale, slug);

      const readingMins = estimateReadingTimeMinutes(body);
      const sectionQueue = [...sections];
      const articleMarked = new Marked({ gfm: true });
      articleMarked.use({
        renderer: {
          heading(token) {
            const fallbackId = slugify(token.text);
            const section = token.depth >= 2 && token.depth <= 3 ? sectionQueue.shift() : null;
            const id = section?.id || fallbackId;
            const tag = `h${Math.min(token.depth, 6)}`;
            return `<${tag} id="${id}">${this.parser.parseInline(token.tokens)}</${tag}>`;
          },
        },
      });
      const contentHtml = injectVisualBlocks(articleMarked.parse(body), sections, enhancement?.visuals || []);
      const canonicalPath = `/${locale}/news/${slug}/`;
      const articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        datePublished: date || undefined,
        dateModified: date || undefined,
        inLanguage: locale,
        mainEntityOfPage: `${SITE}${canonicalPath}`,
        publisher: {
          '@type': 'Organization',
          name: 'Puxijie',
          url: `${SITE}/${locale}/`,
        },
        author: {
          '@type': 'Organization',
          name: 'Puxijie',
        },
        keywords: keywords.length ? keywords.join(', ') : undefined,
      };

      const breadcrumbs = `
<nav class="text-sm text-slate-300">
  <a class="hover:text-white hover:underline" href="/${locale}/">Home</a>
  <span class="mx-2 text-slate-500">/</span>
  <a class="hover:text-white hover:underline" href="/${locale}/news">News</a>
  <span class="mx-2 text-slate-500">/</span>
  <span class="font-medium text-white">${escapeHtml(title)}</span>
</nav>
    `.trim();

    const heroImages = enhancement?.heroImages || [];
    const heroImagesHtml = heroImages.length
      ? `<div class="news-hero-images">
      ${heroImages
        .map(
          (image) => `<div class="news-hero-images__frame">
        <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="eager" decoding="async" />
      </div>`
        )
        .join('')}
    </div>`
      : '';

    const metaCard = `
<div class="news-card news-card-pad">
  ${heroImagesHtml}
  <div class="text-xs font-semibold uppercase text-cyan-200" style="letter-spacing:0;">Article</div>
  <div class="mt-3 space-y-2 text-sm text-slate-300">
    ${date ? `<div><span class="font-semibold text-white">Date:</span> ${escapeHtml(date)}</div>` : ''}
    <div><span class="font-semibold text-white">Reading:</span> ${readingMins} min</div>
    <div><span class="font-semibold text-white">Category:</span> News</div>
  </div>
  ${
    keywords.length
      ? `<div class="mt-4">
    <div class="text-xs font-semibold uppercase text-cyan-200" style="letter-spacing:0;">Topics</div>
    <div class="mt-2 flex flex-wrap gap-2">
      ${keywords
        .slice(0, 8)
        .map(
          (k) =>
            `<span class="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-xs font-semibold text-slate-200">${escapeHtml(
              k
            )}</span>`
        )
        .join('')}
    </div>
  </div>`
      : ''
  }
  <div class="mt-5 flex flex-col gap-2">
    <a href="/${locale}/contact" class="inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
      Talk to sales
    </a>
    <a href="/${locale}/news" class="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-400/10">
      Back to News
    </a>
  </div>
</div>
    `.trim();

    const hero = `
<section class="news-card">
  <div class="news-card-pad">
    ${breadcrumbs}
    <div class="news-hero-grid">
      <div>
      <div class="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase text-cyan-200" style="letter-spacing:0;">
        OEM / ODM Audio Insight
      </div>
      <h1 class="mt-4 text-3xl sm:text-4xl font-bold text-white" style="letter-spacing:0;">
        ${escapeHtml(title)}
      </h1>
      ${
        description
          ? `<p class="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">${escapeHtml(description)}</p>`
          : ''
      }
      </div>
      <div>${metaCard}</div>
    </div>
  </div>
</section>
    `.trim();

    const aside = `
<aside class="news-aside">
  <div class="news-card news-card-pad">
    <div class="text-sm font-semibold uppercase text-cyan-200" style="letter-spacing:0;">Need a quote?</div>
    <p class="mt-3 text-sm text-slate-300 leading-relaxed">
      Share your target quantity, branding requirements, and destination market to start an OEM/ODM discussion.
    </p>
    <a href="/${locale}/contact" class="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
      Contact sales
    </a>
  </div>
  <div class="news-card news-card-pad">
    <div class="text-sm font-semibold uppercase text-cyan-200" style="letter-spacing:0;">Quick links</div>
    <ul class="mt-4 space-y-2 text-sm text-slate-300">
      <li><a class="hover:text-white hover:underline" href="/${locale}/products">Browse products</a></li>
      <li><a class="hover:text-white hover:underline" href="/${locale}/b2b">B2B &amp; Wholesale</a></li>
      <li><a class="hover:text-white hover:underline" href="/${locale}/lab">Lab &amp; reports</a></li>
      <li><a class="hover:text-white hover:underline" href="/${locale}/catalog-downloads">Catalog downloads</a></li>
    </ul>
  </div>
</aside>
    `.trim();

    const layout = `
<div class="news-stack">
  ${hero}
  <div class="news-main-grid">
    <article class="news-card news-card-pad prose prose-slate max-w-none news-article">
      ${contentHtml}
    </article>
    <div>${aside}</div>
  </div>
</div>
    `.trim();

      let html = renderLayout({ locale, title, description, canonicalPath, articleJsonLd, contentHtml: layout });
      if (cssHref) html = html.replace('/assets/index.css', cssHref);

      const outPath = path.join(outDir, locale, 'news', slug, 'index.html');
      await writeFileEnsured(outPath, html);

      posts.push({ slug, title, description, date });
    }

    // Static news index (we keep generating it for fallback/SEO), but the SPA /{locale}/news is the primary listing.
    const listItems = posts
      .map((p) => {
        const href = `/${locale}/news/${p.slug}/`;
        return `<li class="py-4 border-b border-white/10">
  <a class="text-lg font-semibold text-white hover:underline" href="${href}">${escapeHtml(p.title)}</a>
  ${p.date ? `<div class="mt-1 text-xs text-slate-400">${escapeHtml(p.date)}</div>` : ''}
  ${p.description ? `<p class="mt-2 text-sm text-slate-300">${escapeHtml(p.description)}</p>` : ''}
</li>`;
      })
      .join('\n');

    const indexContent = `
<section class="rounded-3xl border border-gray-200 bg-white px-6 py-8 sm:px-10 sm:py-10 shadow-sm">
  <div class="inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase text-cyan-200" style="letter-spacing:0;">News</div>
  <h1 class="mt-4 text-3xl sm:text-4xl font-bold text-white" style="letter-spacing:0;">News</h1>
  <p class="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
    Updates and insights for B2B buyers sourcing outdoor waterproof Bluetooth speakers, OEM/ODM, and wholesale programs.
  </p>
</section>
<section class="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-2 sm:px-10 shadow-sm">
  <ul class="list-none pl-0">${listItems}</ul>
</section>
  `.trim();

    let indexHtml = renderLayout({
      locale,
      title: 'News',
      description: 'News and articles for B2B buyers sourcing outdoor waterproof Bluetooth speakers, OEM/ODM, and wholesale programs.',
      canonicalPath: `/${locale}/news`,
      articleJsonLd: null,
      contentHtml: indexContent,
    });
    if (cssHref) indexHtml = indexHtml.replace('/assets/index.css', cssHref);
    await writeFileEnsured(path.join(outDir, locale, 'news', 'index.html'), indexHtml);
  }
}

await main();
