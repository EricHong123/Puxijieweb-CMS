import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { m } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import { getPaginatedNewsPosts } from '@/features/news/lib/newsContent.js';
import { getSiteOrigin, t } from '@/shared/lib/i18n.js';
import { useLocale } from '@/shared/lib/useLocale.js';

const PER_PAGE = 20;

function getNewsPageCopy(locale) {
  const copy = {
    en: {
      intro:
        'Updates for B2B sourcing of outdoor portable waterproof speakers. OEM/ODM manufacturing, compliance, and wholesale market insights.',
      altSuffix: 'Puxijie waterproof speaker manufacturer news',
    },
    fr: {
      intro:
        'Actualités pour le sourcing B2B d’enceintes portables étanches : fabrication OEM/ODM, conformité et tendances wholesale.',
      altSuffix: 'actualités fabricant d’enceintes étanches Puxijie',
    },
    vi: {
      intro:
        'Cập nhật cho sourcing B2B loa portable chống nước: sản xuất OEM/ODM, tuân thủ và insight thị trường bán sỉ.',
      altSuffix: 'tin tức nhà sản xuất loa chống nước Puxijie',
    },
  };
  return copy[locale] || copy.en;
}

function NewsPage() {
  const locale = useLocale();
  const pageCopy = getNewsPageCopy(locale);
  const [page, setPage] = useState(1);

  const { items: rawItems, total, totalPages } = getPaginatedNewsPosts(locale, {
    page,
    limit: PER_PAGE,
  });

  const localizedItems = rawItems.map((post) => ({
    ...post,
    date: post.displayDate || post.date,
    image: post.heroImages?.[0]?.src || post.image,
  }));

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

        <section className="border-b border-gray-200 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-900">
                {t(locale, 'newsPage.title')}
              </div>
              <h1 className="mt-5 text-4xl font-bold text-gray-900 md:text-5xl" style={{ letterSpacing: '-0.02em' }}>
                {t(locale, 'newsPage.heroTitle')}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                {t(locale, 'newsPage.heroDesc')}
              </p>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-gray-600">
                {pageCopy.intro}
              </p>
            </m.div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {localizedItems.map((item, index) => (
                <m.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link
                    to={item.href ? item.href.replace(/^\/en\//, `/${locale}/`) : `/${locale}/news/`}
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                      <img
                        src={item.image}
                        alt={`${item.title} — ${pageCopy.altSuffix}`}
                        width={1600}
                        height={900}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="px-5 py-5 text-center">
                      <p className="text-xs font-medium text-gray-400">{item.date}</p>
                      <h2 className="mt-3 min-h-[4.5rem] text-[1.05rem] font-bold leading-snug text-gray-900">
                        {item.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.excerpt}</p>
                      <div className="mt-4 inline-flex items-center text-sm font-medium text-sky-700">
                        {t(locale, 'newsPage.readNow')} <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </m.article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t(locale, 'newsPage.prev')}
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => {
                      if (totalPages <= 7) return true;
                      if (n === 1 || n === totalPages) return true;
                      if (n >= page - 1 && n <= page + 1) return true;
                      return false;
                    })
                    .map((n, idx, arr) => {
                      const showEllipsis = idx > 0 && n - arr[idx - 1] > 1;
                      return (
                        <React.Fragment key={n}>
                          {showEllipsis && (
                            <span className="px-1 text-gray-400 select-none">...</span>
                          )}
                          <button
                            onClick={() => setPage(n)}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                              n === page
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {n}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  {t(locale, 'newsPage.next')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default NewsPage;
