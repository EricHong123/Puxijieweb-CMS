import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { m as motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, FileSpreadsheet, Search } from 'lucide-react';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import { products } from '@/features/products/data/products.js';
import { getSiteOrigin, t } from '@/shared/lib/i18n.js';
import { getLocalizedProduct } from '@/features/products/utils/productI18n.js';
import { getModelSlugById } from '@/features/products/utils/modelSlugs.js';
import { useLocale } from '@/shared/lib/useLocale.js';
import { toPublicFileUrl } from '@/shared/lib/staticFileUrl.js';

const CATALOG_XLSX_NAME = 'Puxijietech_Catalog_ENG_VER.xlsx';
const CATALOG_XLSX_HREF = `/catalog-downloads/${CATALOG_XLSX_NAME}`;

function extractMoqFromBenefits(benefits) {
  const list = Array.isArray(benefits) ? benefits : [];
  for (const b of list) {
    const m = String(b).match(/MOQ\s*:\s*(.+)$/);
    if (m?.[1]) return m[1].trim();
  }
  return '';
}

function CatalogDownloadsPage() {
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const catalogDownloadHref = toPublicFileUrl(CATALOG_XLSX_HREF);
  const catalogSeoLine = {
    en: 'Download catalogs for outdoor portable waterproof speakers — ideal for OEM/ODM, private label, and wholesale sourcing with quick model comparison.',
    fr: 'Téléchargez les catalogues d’enceintes étanches outdoor — idéal pour le sourcing OEM/ODM, private label, wholesale et la comparaison rapide des modèles.',
    vi: 'Tải catalog loa chống nước outdoor — phù hợp cho sourcing OEM/ODM, private label, bán sỉ và so sánh nhanh model.',
  };

  const modelCards = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cards = products.map((p) => {
      const lp = getLocalizedProduct(p, locale);
      const slug = getModelSlugById(p.id);
      const modelTo = slug ? `/${locale}/model/${slug}` : `/${locale}/products/${p.id}`;
      return {
        id: p.id,
        name: lp.name,
        category: lp.category,
        ipxRating: p.ipxRating,
        waterproofDepth: lp.waterproofDepth,
        batteryLife: p.batteryLife,
        moq: extractMoqFromBenefits(lp.benefits),
        modelTo,
      };
    });

    if (!q) return cards;
    return cards.filter((c) => {
      const hay = `${c.id} ${c.name} ${c.category} ${c.ipxRating} ${c.moq}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, locale]);

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>
          {locale === 'en'
            ? 'Catalog Downloads — Outdoor Waterproof Speakers | OEM/ODM & Wholesale | Puxijie'
            : `${t(locale, 'catalogPage.title')} | Puxijie`}
        </title>
        <meta
          name="description"
          content={
            locale === 'en'
              ? 'Download catalogs and model sheets for outdoor portable wireless waterproof speakers. Built for OEM/ODM, private label, and wholesale sourcing with clear MOQ and lead time references.'
              : t(locale, 'catalogPage.heroDesc')
          }
        />
        {locale === 'en' ? (
          <meta
            name="keywords"
            content="waterproof speaker catalog download, outdoor portable speaker models, OEM/ODM speaker catalog, wholesale portable waterproof speakers, private label speaker brochure"
          />
        ) : null}
        <link rel="canonical" href={`${getSiteOrigin()}/${locale}/catalog-downloads`} />
        {['en', 'fr', 'vi'].map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`${getSiteOrigin()}/${l}/catalog-downloads`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${getSiteOrigin()}/en/catalog-downloads`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Puxijie" />
        <meta property="og:url" content={`${getSiteOrigin()}/${locale}/catalog-downloads`} />
        <meta property="og:title" content={t(locale, 'catalogPage.title')} />
        <meta property="og:description" content={t(locale, 'catalogPage.heroDesc')} />
        <meta property="og:image" content={`${getSiteOrigin()}/og-default.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t(locale, 'catalogPage.title')} />
        <meta name="twitter:description" content={t(locale, 'catalogPage.heroDesc')} />
        <meta name="twitter:image" content={`${getSiteOrigin()}/og-default.jpg`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <section className="py-24 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-900">
                {t(locale, 'catalogPage.badge')}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mt-5 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {t(locale, 'catalogPage.heroTitle')}
              </h1>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {t(locale, 'catalogPage.heroDesc')}
              </p>
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                {catalogSeoLine[locale] ?? catalogSeoLine.en}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={catalogDownloadHref}
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  {t(locale, 'catalogPage.downloadExcel')}
                </a>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{t(locale, 'catalogPage.includesLabel')}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    {t(locale, 'catalogPage.includesValue')}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{t(locale, 'catalogPage.leftTitle')}</h2>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                        {t(locale, 'catalogPage.leftBody')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t(locale, 'catalogPage.fileLabel')}</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900 break-all">
                        {CATALOG_XLSX_NAME}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t(locale, 'catalogPage.usageLabel')}</div>
                      <div className="mt-1 text-sm text-gray-700 leading-relaxed">
                        {t(locale, 'catalogPage.usageValue')}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t(locale, 'catalogPage.noteLabel')}</div>
                      <div className="mt-1 text-sm text-gray-700 leading-relaxed">
                        {t(locale, 'catalogPage.noteValuePrefix')}{' '}
                        <Link to={`/${locale}/help-center`} className="font-medium text-gray-900 hover:underline">
                          {t(locale, 'catalogPage.noteValueLink')}
                        </Link>
                        .
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <a
                      href={catalogDownloadHref}
                      download
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors active:scale-[0.99]"
                    >
                      <Download className="w-4 h-4" />
                      {t(locale, 'catalogPage.downloadNow')}
                    </a>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{t(locale, 'catalogPage.previewTitle')}</h2>
                      <p className="mt-2 text-sm text-gray-600">
                        {t(locale, 'catalogPage.previewDesc')}
                      </p>
                    </div>
                    <div className="relative w-full max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t(locale, 'catalogPage.searchPlaceholder')}
                        className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {modelCards.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white transition-colors p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                              {m.category}
                            </div>
                            <div className="mt-1 text-lg font-bold text-gray-900">{m.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">IPX</div>
                            <div className="mt-1 text-sm font-semibold text-gray-900">{m.ipxRating || 'N/A'}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                            {m.waterproofDepth}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                            {t(locale, 'catalogPage.batteryLabel')}: {m.batteryLife}
                          </span>
                          {m.moq ? (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                              MOQ: {m.moq}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-4">
                          <Link
                            to={m.modelTo}
                            className="inline-flex items-center justify-center w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors active:scale-[0.99]"
                          >
                            {t(locale, 'catalogPage.viewModel')}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  {modelCards.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
                      <p className="text-sm font-semibold text-gray-900">{t(locale, 'catalogPage.emptyTitle')}</p>
                      <p className="mt-2 text-sm text-gray-600">{t(locale, 'catalogPage.emptyDesc')}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default CatalogDownloadsPage;

