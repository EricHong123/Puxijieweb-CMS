import { Marked } from 'marked';
import { newsItems } from '@/features/news/data/news.js';
import { getArticleEnhancement } from '@/features/news/lib/articleEnhancements.js';

const rawNewsModules = import.meta.glob('../../../../content/news/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const DEFAULT_NEWS_IMAGE =
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { frontmatter: {}, body: markdown };

  const raw = match[1];
  const body = markdown.slice(match[0].length);
  const frontmatter = {};
  let currentKey = null;

  for (const line of raw.split('\n')) {
    const keyValue = line.match(/^([A-Za-z0-9_-]+):\s*(.*)\s*$/);
    if (keyValue) {
      const [, key, value] = keyValue;
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

function stripMarkdown(markdown) {
  return String(markdown || '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\((.*?)\)/g, '$1')
    .replace(/[`*_>~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateReadingMinutes(text) {
  const words = stripMarkdown(text).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function formatDisplayDate(locale, dateValue) {
  if (!dateValue) return '';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return String(dateValue);

  const localeMap = {
    en: 'en-US',
    fr: 'fr-FR',
    vi: 'vi-VN',
  };

  return new Intl.DateTimeFormat(localeMap[locale] || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed);
}

function collectHeadingTokens(tokens, list = []) {
  for (const token of tokens) {
    if (!token) continue;
    if (token.type === 'heading') {
      list.push(token);
    }
    if (Array.isArray(token.tokens)) {
      collectHeadingTokens(token.tokens, list);
    }
    if (Array.isArray(token.items)) {
      for (const item of token.items) {
        if (Array.isArray(item.tokens)) {
          collectHeadingTokens(item.tokens, list);
        }
      }
    }
  }
  return list;
}

function buildArticleHtml(markdownBody) {
  const lexer = new Marked();
  const tokens = lexer.lexer(markdownBody);
  const headingTokens = collectHeadingTokens(tokens).filter((token) => token.depth >= 2 && token.depth <= 3);

  const slugCounts = new Map();
  const sections = headingTokens.map((token) => {
    const base = slugify(token.text);
    const count = slugCounts.get(base) || 0;
    slugCounts.set(base, count + 1);
    return {
      id: count ? `${base}-${count}` : base,
      title: token.text,
      depth: token.depth,
    };
  });

  const sectionQueue = [...sections];
  const marked = new Marked({ gfm: true });
  marked.use({
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

  return {
    html: marked.parse(markdownBody),
    sections,
  };
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

const fallbackItemById = new Map(newsItems.map((item) => [item.id, item]));

const allPosts = Object.entries(rawNewsModules)
  .map(([filePath, rawMarkdown]) => {
    const match = filePath.match(/content\/news\/([^/]+)\/([^/]+)\.md$/);
    if (!match) return null;

    const [, locale, slug] = match;
    const { frontmatter, body } = parseFrontmatter(rawMarkdown);
    const enhancement = getArticleEnhancement(locale, slug);
    const rendered = buildArticleHtml(body);
    const html = injectVisualBlocks(rendered.html, rendered.sections, enhancement?.visuals || []);
    const fallbackItem = fallbackItemById.get(slug);
    const description = frontmatter.description || fallbackItem?.excerpt || '';
    const title = frontmatter.title || fallbackItem?.title || slug;

    return {
      id: slug,
      slug,
      locale,
      title,
      description,
      excerpt: description || stripMarkdown(body).slice(0, 180),
      body,
      html,
      sections: rendered.sections,
      date: frontmatter.date || '',
      displayDate: formatDisplayDate(locale, frontmatter.date || fallbackItem?.date || ''),
      keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [],
      image: fallbackItem?.image || DEFAULT_NEWS_IMAGE,
      heroImages: enhancement?.heroImages || [],
      href: `/${locale}/news/${slug}/`,
      readingMinutes: estimateReadingMinutes(body),
    };
  })
  .filter(Boolean)
  .sort((left, right) => {
    const leftTime = new Date(left.date || 0).getTime();
    const rightTime = new Date(right.date || 0).getTime();
    return rightTime - leftTime;
  });

export function getNewsPost(locale, slug) {
  return allPosts.find((post) => post.locale === locale && post.slug === slug) || null;
}

export function getNewsPosts(locale) {
  return allPosts.filter((post) => post.locale === locale);
}
