import React from 'react';
import { Helmet } from 'react-helmet';
import { m as motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import { getSiteOrigin, t } from '@/shared/lib/i18n.js';
import { useLocale } from '@/shared/lib/useLocale.js';

function SitemapPage() {
  const locale = useLocale();
  const pageCopy = {
    en: {
      seoLine: 'Quick access to outdoor waterproof speaker products, OEM/ODM services, wholesale programs, test reports, and catalogs.',
      core: 'Core',
      support: 'Support',
      policy: 'Policy',
      productPages: 'Product pages',
      productDesc: 'Product detail pages are generated dynamically from the product listing. Start from',
      productLink: 'Products',
      productEnd: 'and choose your model.',
    },
    fr: {
      seoLine: 'Accès rapide aux enceintes étanches outdoor, services OEM/ODM, programmes grossistes, rapports de test et catalogues.',
      core: 'Pages principales',
      support: 'Support',
      policy: 'Politiques',
      productPages: 'Pages produits',
      productDesc: 'Les pages détail produit sont générées depuis la liste produits. Commencez par',
      productLink: 'Produits',
      productEnd: 'puis choisissez votre modèle.',
    },
    vi: {
      seoLine: 'Truy cập nhanh sản phẩm loa chống nước outdoor, dịch vụ OEM/ODM, chương trình bán sỉ, báo cáo kiểm thử và catalog.',
      core: 'Trang chính',
      support: 'Hỗ trợ',
      policy: 'Chính sách',
      productPages: 'Trang sản phẩm',
      productDesc: 'Trang chi tiết sản phẩm được tạo từ danh sách sản phẩm. Hãy bắt đầu từ',
      productLink: 'Sản phẩm',
      productEnd: 'và chọn model bạn cần.',
    },
  }[locale] ?? {};
  const coreLinks = [
    { label: t(locale, 'nav.home'), path: `/${locale}/` },
    { label: t(locale, 'nav.products'), path: `/${locale}/products` },
    { label: t(locale, 'nav.lab'), path: `/${locale}/lab` },
    { label: t(locale, 'nav.b2b'), path: `/${locale}/b2b` },
    { label: t(locale, 'nav.contact'), path: `/${locale}/contact` },
    { label: t(locale, 'nav.about'), path: `/${locale}/about-us` },
  ];

  const supportLinks = [
    { label: t(locale, 'nav.news'), path: `/${locale}/news` },
    { label: t(locale, 'catalogPage.title'), path: `/${locale}/catalog-downloads` },
    { label: t(locale, 'helpCenterPage.title'), path: `/${locale}/help-center` },
    { label: t(locale, 'nav.faq'), path: `/${locale}/faq` },
  ];

  const policyLinks = [
    { label: t(locale, 'policies.termsTitle'), path: `/${locale}/terms-of-use` },
    { label: t(locale, 'policies.privacyTitle'), path: `/${locale}/privacy` },
    { label: t(locale, 'policies.warrantyTitle'), path: `/${locale}/warranty` },
    { label: t(locale, 'policies.dnsTitle'), path: `/${locale}/do-not-sell-share-my-data` },
  ];

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="rounded-3xl border border-gray-200 bg-white p-7">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{pageCopy.core}</h2>
                <ul className="space-y-3">
                  {coreLinks.map((l) => (
                    <li key={l.path}>
                      <Link to={l.path} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-7">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{pageCopy.support}</h2>
                <ul className="space-y-3">
                  {supportLinks.map((l) => (
                    <li key={l.path}>
                      <Link to={l.path} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-7">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{pageCopy.policy}</h2>
                <ul className="space-y-3">
                  {policyLinks.map((l) => (
                    <li key={l.path}>
                      <Link to={l.path} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 rounded-3xl border border-gray-200 bg-gray-50 p-7">
              <h3 className="text-lg font-bold text-gray-900">{pageCopy.productPages}</h3>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                {pageCopy.productDesc}{' '}
                <Link to={`/${locale}/products`} className="font-medium text-gray-900 hover:underline">
                  {pageCopy.productLink}
                </Link>{' '}
                {pageCopy.productEnd}
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default SitemapPage;

