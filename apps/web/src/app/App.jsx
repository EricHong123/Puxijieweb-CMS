import React from 'react';
import { Navigate, Route, Routes, BrowserRouter as Router, useParams } from 'react-router-dom';
import ScrollToTop from '@/shared/site/ScrollToTop.jsx';
import { DEFAULT_LOCALE, isSupportedLocale, t } from '@/shared/lib/i18n.js';
import OrganizationJsonLd from '@/shared/seo/OrganizationJsonLd.jsx';
import { useLocale } from '@/shared/lib/useLocale.js';
import { useAnalytics } from '@/shared/lib/useAnalytics.js';

const HomePage = React.lazy(() => import('@/features/home/pages/HomePage.jsx'));
const ProductListingPage = React.lazy(() => import('@/features/products/pages/ProductListingPage.jsx'));
const ProductDetailPage = React.lazy(() => import('@/features/products/pages/ProductDetailPage.jsx'));
const ProductModelPage = React.lazy(() => import('@/features/products/pages/ProductModelPage.jsx'));
const PuxijieLabPage = React.lazy(() => import('@/features/company/pages/PuxijieLabPage.jsx'));
const B2BPage = React.lazy(() => import('@/features/company/pages/B2BPage.jsx'));
const ContactPage = React.lazy(() => import('@/features/company/pages/ContactPage.jsx'));
const AboutUsPage = React.lazy(() => import('@/features/company/pages/AboutUsPage.jsx'));
const FaqPage = React.lazy(() => import('@/features/faq/pages/FaqPage.jsx'));
const TermsOfUsePage = React.lazy(() => import('@/features/legal/pages/TermsOfUsePage.jsx'));
const WarrantyPolicyPage = React.lazy(() => import('@/features/legal/pages/WarrantyPolicyPage.jsx'));
const PrivacyPolicyPage = React.lazy(() => import('@/features/legal/pages/PrivacyPolicyPage.jsx'));
const DoNotSellShareMyDataPage = React.lazy(() => import('@/features/legal/pages/DoNotSellShareMyDataPage.jsx'));
const HelpCenterPage = React.lazy(() => import('@/features/company/pages/HelpCenterPage.jsx'));
const SitemapPage = React.lazy(() => import('@/features/site/pages/SitemapPage.jsx'));
const CatalogDownloadsPage = React.lazy(() => import('@/features/products/pages/CatalogDownloadsPage.jsx'));
const NewsPage = React.lazy(() => import('@/features/news/pages/NewsPage.jsx'));
const NewsArticlePage = React.lazy(() => import('@/features/news/pages/NewsArticlePage.jsx'));

function LocaleGuard({ children }) {
  const params = useParams();
  const locale = params?.locale;
  if (!isSupportedLocale(locale)) {
    return <Navigate to={`/${DEFAULT_LOCALE}`} replace />;
  }
  return children;
}

function AppShell() {
  const locale = useLocale();
  useAnalytics();
  return (
    <>
      <ScrollToTop />
      <OrganizationJsonLd />
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="text-base font-semibold">{t(locale, 'app.loadingTitle')}</div>
              <div className="text-sm text-muted-foreground">{t(locale, 'app.loadingDesc')}</div>
            </div>
          </div>
        }
      >
        <Routes>
          {/* Locale entrypoints */}
          <Route path="/" element={<Navigate to={`/${DEFAULT_LOCALE}`} replace />} />

          {/* Backward-compatible routes (keep old URLs working) */}
          <Route path="/products" element={<Navigate to={`/${DEFAULT_LOCALE}/products`} replace />} />
          <Route path="/products/:id" element={<Navigate to={`/${DEFAULT_LOCALE}/products/:id`} replace />} />
          <Route path="/puxijie-lab" element={<Navigate to={`/${DEFAULT_LOCALE}/puxijie-lab`} replace />} />
          <Route path="/lab" element={<Navigate to={`/${DEFAULT_LOCALE}/lab`} replace />} />
          <Route path="/b2b" element={<Navigate to={`/${DEFAULT_LOCALE}/b2b`} replace />} />
          <Route path="/contact" element={<Navigate to={`/${DEFAULT_LOCALE}/contact`} replace />} />
          <Route path="/about-us" element={<Navigate to={`/${DEFAULT_LOCALE}/about-us`} replace />} />
          <Route path="/faq" element={<Navigate to={`/${DEFAULT_LOCALE}/faq`} replace />} />
          <Route path="/terms-of-use" element={<Navigate to={`/${DEFAULT_LOCALE}/terms-of-use`} replace />} />
          <Route path="/warranty" element={<Navigate to={`/${DEFAULT_LOCALE}/warranty`} replace />} />
          <Route path="/privacy" element={<Navigate to={`/${DEFAULT_LOCALE}/privacy`} replace />} />
          <Route path="/do-not-sell-share-my-data" element={<Navigate to={`/${DEFAULT_LOCALE}/do-not-sell-share-my-data`} replace />} />
          <Route path="/help-center" element={<Navigate to={`/${DEFAULT_LOCALE}/help-center`} replace />} />
          <Route path="/catalog-downloads" element={<Navigate to={`/${DEFAULT_LOCALE}/catalog-downloads`} replace />} />
          <Route path="/news" element={<Navigate to={`/${DEFAULT_LOCALE}/news`} replace />} />
          <Route path="/sitemap" element={<Navigate to={`/${DEFAULT_LOCALE}/sitemap`} replace />} />

          {/* Localized routes */}
          <Route
            path="/:locale/*"
            element={
              <LocaleGuard>
                <Routes>
                  <Route path="" element={<HomePage />} />
                  <Route path="products" element={<ProductListingPage />} />
                  <Route path="products/:id" element={<ProductDetailPage />} />
                  <Route path="products/:slug/model" element={<ProductModelPage />} />
                  <Route path="model/:slug" element={<ProductModelPage />} />
                  <Route path="puxijie-lab" element={<PuxijieLabPage />} />
                  <Route path="lab" element={<PuxijieLabPage />} />
                  <Route path="b2b" element={<B2BPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="about-us" element={<AboutUsPage />} />
                  <Route path="faq" element={<FaqPage />} />
                  <Route path="terms-of-use" element={<TermsOfUsePage />} />
                  <Route path="warranty" element={<WarrantyPolicyPage />} />
                  <Route path="privacy" element={<PrivacyPolicyPage />} />
                  <Route path="do-not-sell-share-my-data" element={<DoNotSellShareMyDataPage />} />
                  <Route path="help-center" element={<HelpCenterPage />} />
                  <Route path="catalog-downloads" element={<CatalogDownloadsPage />} />
                  <Route path="news" element={<NewsPage />} />
                  <Route path="news/:slug" element={<NewsArticlePage />} />
                  <Route path="sitemap" element={<SitemapPage />} />
                </Routes>
              </LocaleGuard>
            }
          />

          <Route
            path="*"
            element={
              <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold">{t(locale, 'app.notFoundTitle')}</h1>
                  <p className="text-muted-foreground">{t(locale, 'app.notFoundDesc')}</p>
                  <a
                    href={`/${DEFAULT_LOCALE}`}
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200"
                  >
                    {t(locale, 'app.backHome')}
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </React.Suspense>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
