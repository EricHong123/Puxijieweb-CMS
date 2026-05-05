import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { m } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import Breadcrumb from '@/shared/ui/breadcrumb.jsx';
import { getPaginatedNewsPosts } from '@/features/news/lib/newsContent.js';
import { getSiteOrigin, t } from '@/shared/lib/i18n.js';
import { useLocale } from '@/shared/lib/useLocale.js';

const PER_PAGE = 20;

const COPY = {
  en: {
    breadcrumb: 'News',
    badge: 'B2B Sourcing Updates',
    heroTitle: 'OEM/ODM insights for waterproof speaker buyers',
    heroDesc:
      'Product updates, compliance guides, and sourcing strategies for distributors, importers, and private-label brands.',
    altSuffix: 'Puxijie waterproof speaker manufacturer news',
    showing: 'Showing',
    of: 'of',
    articles: 'articles',
    readNow: 'Read now',
    minRead: 'min read',
    noArticles: 'No news articles yet.',
    prev: 'Prev',
    next: 'Next',
  },
  fr: {
    breadcrumb: 'Actualités',
    badge: 'Actualités sourcing B2B',
    heroTitle: 'Insights OEM/ODM pour acheteurs d\'enceintes étanches',
    heroDesc:
      'Mises à jour produits, guides de conformité et stratégies de sourcing pour distributeurs, importateurs et marques.',
    altSuffix: 'actualités fabricant d\'enceintes étanches Puxijie',
    showing: 'Affichage',
    of: 'sur',
    articles: 'articles',
    readNow: 'Lire',
    minRead: 'min de lecture',
    noArticles: 'Aucun article pour le moment.',
    prev: 'Précédent',
    next: 'Suivant',
  },
  vi: {
    breadcrumb: 'Tin tức',
    badge: 'Cập nhật sourcing B2B',
    heroTitle: 'Insights OEM/ODM cho người mua loa chống nước',
    heroDesc:
      'Cập nhật sản phẩm, hướng dẫn tuân thủ và chiến lược sourcing cho nhà phân phối, nhập khẩu và thương hiệu.',
    altSuffix: 'tin tức nhà sản xuất loa chống nước Puxijie',
    showing: 'Hiển thị',
    of: 'trên',
    articles: 'bài viết',
    readNow: 'Xem',
    minRead: 'phút đọc',
    noArticles: 'Chưa có bài viết nào.',
    prev: 'Trước',
    next: 'Sau',
  },
};

function Pagination({ page, totalPages, copy, onPageChange }) {
  if (totalPages <= 1) return null;

  const goTo = (n) => {
    onPageChange(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
      pageNumbers.push('...');
    }
  }

  return (
    <nav className="mt-16 flex items-center justify-between border-t border-gray-200 pt-8" aria-label="Pagination">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
          page <= 1
            ? 'pointer-events-none text-gray-300'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
        {copy.prev}
      </button>

      <div className="hidden sm:flex items-center gap-1">
        {pageNumbers.map((n, i) =>
          n === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-gray-400 select-none">...</span>
          ) : (
            <button
              key={n}
              onClick={() => goTo(n)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                n === page
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {n}
            </button>
          )
        )}
      </div>

      <span className="sm:hidden text-sm font-medium text-gray-600">
        {page} / {totalPages}
      </span>

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
          page >= totalPages
            ? 'pointer-events-none text-gray-300'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {copy.next}
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function NewsPage() {
  const locale = useLocale();
  const copy = COPY[locale] || COPY.en;
  const [page, setPage] = useState(1);

  const { items: rawItems, total, totalPages } = getPaginatedNewsPosts(locale, {
    page,
    limit: PER_PAGE,
  });

  const posts = rawItems.map((post) => ({
    ...post,
    date: post.displayDate || post.date,
    image: post.heroImages?.[0]?.src || post.image,
    readingMinutes: post.readingMinutes || 1,
  }));

  const startItem = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endItem = Math.min(page * PER_PAGE, total);

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>
          {locale === 'en'
            ? 'News — Outdoor Waterproof Speaker OEM/ODM Insights | Puxijie'
            : `${t(locale, 'newsPage.title')} | Puxijie`}
        </title>
        <meta
          name="description"
          content={
            locale === 'en'
              ? 'Company updates and product insights for outdoor portable wireless waterproof speakers. Learn about OEM/ODM manufacturing, compliance, and wholesale market trends.'
              : t(locale, 'newsPage.heroDesc')
          }
        />
        {locale === 'en' ? (
          <meta
            name="keywords"
            content="outdoor waterproof speaker OEM/ODM news, portable speaker manufacturer updates, wholesale waterproof speakers insights, private label bluetooth speaker trends"
          />
        ) : null}
        <link rel="canonical" href={`${getSiteOrigin()}/${locale}/news/`} />
        {['en', 'fr', 'vi'].map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`${getSiteOrigin()}/${l}/news/`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${getSiteOrigin()}/en/news/`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Puxijie" />
        <meta property="og:url" content={`${getSiteOrigin()}/${locale}/news/`} />
        <meta property="og:title" content={t(locale, 'newsPage.title')} />
        <meta property="og:description" content={t(locale, 'newsPage.heroDesc')} />
        <meta property="og:image" content={`${getSiteOrigin()}/og-default.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t(locale, 'newsPage.title')} />
        <meta name="twitter:description" content={t(locale, 'newsPage.heroDesc')} />
        <meta name="twitter:image" content={`${getSiteOrigin()}/og-default.jpg`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero */}
        <section className="bg-white border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <Breadcrumb
              items={[
                { label: 'Home', href: `/${locale}/` },
                { label: copy.breadcrumb },
              ]}
            />
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <span className="inline-block rounded-full bg-sky-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-sky-700 uppercase">
                {copy.badge}
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {copy.heroTitle}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-gray-500">
                {copy.heroDesc}
              </p>
            </m.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Results bar */}
            <div className="mb-10 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {total > 0
                  ? `${copy.showing} ${startItem}–${endItem} ${copy.of} ${total} ${copy.articles}`
                  : copy.noArticles}
              </p>
            </div>

            {posts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-400">{copy.noArticles}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post, index) => (
                    <m.article
                      key={post.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (index % PER_PAGE) * 0.04 }}
                    >
                      <Link
                        to={
                          post.href
                            ? post.href.replace(/^\/en\//, `/${locale}/`)
                            : `/${locale}/news/`
                        }
                        className="group block overflow-hidden rounded-2xl bg-white border border-gray-200/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
                      >
                        {/* Image */}
                        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                          <img
                            src={post.image}
                            alt={`${post.title} — ${copy.altSuffix}`}
                            width={800}
                            height={450}
                            loading={index < 6 ? 'eager' : 'lazy'}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        {/* Body */}
                        <div className="p-5 sm:p-6">
                          {/* Meta row */}
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                            <time dateTime={post.date}>{post.date}</time>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3 w-3" />
                              {post.readingMinutes} {copy.minRead}
                            </span>
                          </div>

                          <h2 className="text-[1.05rem] font-semibold leading-snug text-gray-900 group-hover:text-sky-700 transition-colors line-clamp-2">
                            {post.title}
                          </h2>

                          {post.excerpt && (
                            <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}

                          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sky-700 group-hover:gap-2 transition-all">
                            {copy.readNow}
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </Link>
                    </m.article>
                  ))}
                </div>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  copy={copy}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default NewsPage;
