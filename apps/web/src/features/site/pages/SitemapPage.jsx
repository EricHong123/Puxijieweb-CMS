import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { m as motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import { getSiteOrigin, t } from '@/shared/lib/i18n.js';
import { useLocale } from '@/shared/lib/useLocale.js';
import { products, getProductsByCategory } from '@/features/products/data/products.js';
import { getModelSlugById } from '@/features/products/utils/modelSlugs.js';

const CATEGORY_TRANSLATIONS = {
  'Waterproof Bluetooth Speaker': { en: 'Waterproof Bluetooth Speakers', fr: 'Enceintes Bluetooth étanches', vi: 'Loa Bluetooth chống nước' },
  'Normal Bluetooth Speaker': { en: 'Bluetooth Speakers', fr: 'Enceintes Bluetooth', vi: 'Loa Bluetooth' },
  'Specialty Speaker': { en: 'Specialty Speakers', fr: 'Enceintes spécialisées', vi: 'Loa đặc biệt' },
  'Bluetooth Earbuds': { en: 'Bluetooth Earbuds', fr: 'Écouteurs Bluetooth', vi: 'Tai nghe Bluetooth' },
};

function SitemapPage() {
  const locale = useLocale();

  const pageCopy = {
    en: {
      seoLine: 'Quick access to all Puxijie pages — products, model details, resources, legal, and news articles.',
      mainPages: 'Main pages',
      productCategories: 'Product categories',
      productDetails: 'Product detail pages',
      resources: 'Resources',
      legal: 'Legal',
      allProductsIn: 'All products in',
    },
    fr: {
      seoLine: 'Accès rapide à toutes les pages Puxijie — produits, modèles, ressources, mentions légales et actualités.',
      mainPages: 'Pages principales',
      productCategories: 'Catégories de produits',
      productDetails: 'Pages détail produit',
      resources: 'Ressources',
      legal: 'Mentions légales',
      allProductsIn: 'Tous les produits dans',
    },
    vi: {
      seoLine: 'Truy cập nhanh tất cả trang Puxijie — sản phẩm, chi tiết model, tài nguyên, pháp lý và tin tức.',
      mainPages: 'Trang chính',
      productCategories: 'Danh mục sản phẩm',
      productDetails: 'Trang chi tiết sản phẩm',
      resources: 'Tài nguyên',
      legal: 'Pháp lý',
      allProductsIn: 'Tất cả sản phẩm trong',
    },
  }[locale] ?? {};

  const mainLinks = [
    { label: t(locale, 'nav.home'), path: `/${locale}/` },
    { label: t(locale, 'nav.products'), path: `/${locale}/products` },
    { label: t(locale, 'nav.about'), path: `/${locale}/about-us` },
    { label: t(locale, 'nav.contact'), path: `/${locale}/contact` },
    { label: t(locale, 'nav.b2b'), path: `/${locale}/b2b` },
    { label: t(locale, 'nav.lab'), path: `/${locale}/lab` },
  ];

  const resourceLinks = [
    { label: t(locale, 'newsPage.title'), path: `/${locale}/news` },
    { label: t(locale, 'nav.faq'), path: `/${locale}/faq` },
    { label: t(locale, 'catalogPage.title'), path: `/${locale}/catalog-downloads` },
    { label: t(locale, 'helpCenterPage.title'), path: `/${locale}/help-center` },
  ];

  const legalLinks = [
    { label: t(locale, 'policies.termsTitle'), path: `/${locale}/terms-of-use` },
    { label: t(locale, 'policies.privacyTitle'), path: `/${locale}/privacy` },
    { label: t(locale, 'policies.warrantyTitle'), path: `/${locale}/warranty` },
    { label: t(locale, 'policies.dnsTitle'), path: `/${locale}/do-not-sell-share-my-data` },
  ];

  const categories = useMemo(() => {
    const catSet = new Set(products.map((p) => p.category).filter(Boolean));
    return [...catSet].sort();
  }, []);

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>
          {locale === 'en'
            ? 'Sitemap — Outdoor Waterproof Speakers & B2B OEM/ODM Pages | Puxijie'
            : `${t(locale, 'sitemapPage.title')} | Puxijie`}
        </title>
        <meta
          name="description"
          content={
            locale === 'en'
              ? 'Navigate Puxijie pages for outdoor portable wireless waterproof speakers, OEM/ODM services, wholesale programs, lab reports, and catalog downloads.'
              : t(locale, 'sitemapPage.heroDesc')
          }
        />
        {locale === 'en' ? (
          <meta
            name="keywords"
            content="puxijie sitemap, outdoor waterproof speakers pages, OEM/ODM speaker manufacturer site map, wholesale portable speakers links"
          />
        ) : null}
        <link rel="canonical" href={`${getSiteOrigin()}/${locale}/sitemap`} />
        {['en', 'fr', 'vi'].map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`${getSiteOrigin()}/${l}/sitemap`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${getSiteOrigin()}/en/sitemap`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Puxijie" />
        <meta property="og:url" content={`${getSiteOrigin()}/${locale}/sitemap`} />
        <meta property="og:title" content={t(locale, 'sitemapPage.title')} />
        <meta property="og:description" content={t(locale, 'sitemapPage.heroDesc')} />
        <meta property="og:image" content={`${getSiteOrigin()}/og-default.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t(locale, 'sitemapPage.title')} />
        <meta name="twitter:description" content={t(locale, 'sitemapPage.heroDesc')} />
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
                {t(locale, 'sitemapPage.heroTitle')}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mt-5 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {t(locale, 'sitemapPage.heroTitle')}
              </h1>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {t(locale, 'sitemapPage.heroDesc')}
              </p>
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                {pageCopy.seoLine}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Row 1: Main Pages | Resources | Legal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="rounded-3xl border border-gray-200 bg-white p-7">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{pageCopy.mainPages}</h2>
                <ul className="space-y-3">
                  {mainLinks.map((l) => (
                    <li key={l.path}>
                      <Link to={l.path} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-7">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{pageCopy.resources}</h2>
                <ul className="space-y-3">
                  {resourceLinks.map((l) => (
                    <li key={l.path}>
                      <Link to={l.path} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-7">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{pageCopy.legal}</h2>
                <ul className="space-y-3">
                  {legalLinks.map((l) => (
                    <li key={l.path}>
                      <Link to={l.path} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Row 2: Product Categories */}
            <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-7">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{pageCopy.productCategories}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat) => (
                  <div key={cat}>
                    <Link
                      to={`/${locale}/products?category=${encodeURIComponent(cat)}`}
                      className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
                    >
                      {(CATEGORY_TRANSLATIONS[cat] && CATEGORY_TRANSLATIONS[cat][locale]) || cat}
                    </Link>
                    <span className="ml-1.5 text-xs text-gray-400">
                      ({getProductsByCategory(cat).length})
                    </span>
                    <ul className="mt-2 space-y-1.5">
                      {getProductsByCategory(cat).map((product) => {
                        const modelSlug = getModelSlugById(product.id);
                        const detailPath = modelSlug
                          ? `/${locale}/model/${modelSlug}`
                          : `/${locale}/products`;
                        return (
                          <li key={product.id}>
                            <Link
                              to={detailPath}
                              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                            >
                              {product.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default SitemapPage;
