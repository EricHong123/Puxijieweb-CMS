
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { ArrowLeft, Download, Droplets, Battery, Gauge, Package, Ruler, Weight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import ProductGallery from '@/features/products/components/ProductGallery.jsx';
import ProductCard from '@/features/products/components/ProductCard.jsx';
import InquiryButton from '@/shared/site/InquiryButton.jsx';
import { getProductById, getRelatedProducts } from '@/features/products/data/products.js';
import { DEFAULT_LOCALE, isSupportedLocale, t } from '@/shared/lib/i18n.js';
import { getLocalizedProduct } from '@/features/products/utils/productI18n.js';
import { getModelSlugById } from '@/features/products/utils/modelSlugs.js';
import { toPublicFileUrl } from '@/shared/lib/staticFileUrl.js';

function ProductDetailPage() {
  const { id, locale: localeParam } = useParams();
  const locale = isSupportedLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const navigate = useNavigate();
  const product = getProductById(id);
  const relatedProducts = getRelatedProducts(id);
  const modelSlug = getModelSlugById(id);
  const fallbackProductsUrl = `/${locale}/products`;
  const p = useMemo(() => (product ? getLocalizedProduct(product, locale) : null), [product, locale]);
  const detailCopy = {
    en: {
      back: 'Back',
      sourcingLine: 'Outdoor portable wireless waterproof speaker for OEM/ODM, private label, and wholesale sourcing. Share your target MOQ, IPX rating, and packaging requirements for a quote.',
    },
    fr: {
      back: 'Retour',
      sourcingLine: 'Enceinte Bluetooth étanche outdoor pour sourcing OEM/ODM, private label et programmes grossistes. Indiquez votre MOQ cible, indice IPX et besoins packaging pour recevoir un devis.',
    },
    vi: {
      back: 'Quay lại',
      sourcingLine: 'Loa Bluetooth chống nước outdoor cho sourcing OEM/ODM, private label và bán sỉ. Gửi MOQ mục tiêu, chuẩn IPX và yêu cầu bao bì để nhận báo giá.',
    },
  }[locale] ?? {};

  if (!product || !p) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{t(locale, 'productDetail.notFound')}</h1>
            <Button asChild variant="secondary" className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-100">
              <Link to={fallbackProductsUrl}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                {t(locale, 'productDetail.backToProducts')}
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (modelSlug) {
    return <Navigate to={`/${locale}/model/${modelSlug}`} replace />;
  }

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>
          {locale === 'en'
            ? `${p.name} Outdoor Portable Waterproof Speaker | OEM/ODM & Wholesale - Puxijie`
            : `${p.name} - ${p.category} | Puxijie`}
        </title>
        <meta
          name="description"
          content={
            locale === 'en'
              ? `${p.name} is an outdoor portable wireless waterproof speaker for OEM/ODM, private label, and wholesale programs. ${p.ipxRating || ''} ${p.features?.[0] ? `• ${p.features[0]}` : ''}`.trim()
              : `${p.name}: ${p.ipxRating}. ${p.features[0]}`
          }
        />
        {locale === 'en' ? (
          <meta
            name="keywords"
            content="outdoor portable waterproof speaker OEM/ODM, wireless waterproof bluetooth speaker wholesale, IPX7 outdoor speaker manufacturer, private label portable speakers"
          />
        ) : null}
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />

        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              type="button"
              variant="ghost"
              className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => {
                if (window.history.length > 1) navigate(-1);
                else navigate(fallbackProductsUrl);
              }}
            >
                <ArrowLeft className="mr-2 w-4 h-4" />
                {detailCopy.back}
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <m.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <ProductGallery images={p.image} productName={p.name} />
              </m.div>

              <m.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {p.category}
                  </p>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                    {p.name}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 max-w-xl">
                    {detailCopy.sourcingLine}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
                  <div className="text-center bg-white border border-gray-200 rounded-xl p-4">
                    <Droplets className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500 mb-1">{t(locale, 'productDetail.waterproofRating')}</p>
                    <p className="text-lg font-bold text-gray-900">{p.ipxRating}</p>
                  </div>
                  <div className="text-center bg-white border border-gray-200 rounded-xl p-4">
                    <Battery className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500 mb-1">{t(locale, 'productDetail.batteryLife')}</p>
                    <p className="text-lg font-bold text-gray-900">{p.batteryLife}</p>
                  </div>
                  <div className="text-center bg-white border border-gray-200 rounded-xl p-4">
                    <Gauge className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500 mb-1">{t(locale, 'productDetail.depthShort')}</p>
                    <p className="text-lg font-bold text-gray-900">{p.waterproofDepth}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">{t(locale, 'productDetail.keyFeatures')}</h2>
                  <ul className="space-y-2">
                    {p.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">{t(locale, 'productDetail.benefits')}</h2>
                  <ul className="space-y-2">
                    {p.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <InquiryButton productName={p.name} className="w-full bg-white border border-gray-900 text-gray-900 hover:bg-gray-100" />
                </div>

                {modelSlug && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h2 className="text-base font-bold text-gray-900">{t(locale, 'productDetail.buyerSpecTitle')}</h2>
                    <p className="mt-2 text-sm text-gray-600">
                      {t(locale, 'productDetail.buyerSpecDesc')}
                    </p>
                    <a
                      href={`/${locale}/model/${modelSlug}`}
                      className="mt-4 inline-flex items-center justify-center rounded-xl border border-gray-900 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      {t(locale, 'productDetail.viewModelPage')}
                    </a>
                  </div>
                )}

                {Array.isArray(p.downloads) && p.downloads.length > 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <h2 className="text-base font-bold text-gray-900">{t(locale, 'product.downloads')}</h2>
                    <div className="mt-3 space-y-2">
                      {p.downloads.map((d) => (
                        <a
                          key={d.url}
                          href={toPublicFileUrl(d.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          <span className="min-w-0 truncate">{d.title}</span>
                          <Download className="h-4 w-4 text-gray-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </m.div>
            </div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold mb-8 text-gray-900">{t(locale, 'productDetail.technicalSpecs')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-3">
                    <Gauge className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{t(locale, 'productDetail.audio')}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{t(locale, 'productDetail.frequencyRange')}</p>
                  <p className="text-lg font-bold text-gray-900">{p.frequencyRange}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{t(locale, 'productDetail.material')}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{t(locale, 'productDetail.construction')}</p>
                  <p className="text-lg font-bold text-gray-900">{p.material}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-3">
                    <Weight className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{t(locale, 'productDetail.weight')}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{t(locale, 'productDetail.totalWeight')}</p>
                  <p className="text-lg font-bold text-gray-900">{product.weight}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-3">
                    <Ruler className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{t(locale, 'productDetail.dimensions')}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{t(locale, 'productDetail.lwh')}</p>
                  <p className="text-lg font-bold text-gray-900">{product.dimensions}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-3">
                    <Droplets className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{t(locale, 'productDetail.waterproofRating')}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{t(locale, 'productDetail.ipxStandard')}</p>
                  <p className="text-lg font-bold text-gray-900">{p.ipxRating}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-3">
                    <Battery className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{t(locale, 'productDetail.batteryLife')}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{t(locale, 'productDetail.continuousPlayback')}</p>
                  <p className="text-lg font-bold text-gray-900">{p.batteryLife}</p>
                </div>
              </div>
            </m.div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="py-16 bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold mb-8 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {t(locale, 'productDetail.relatedProducts')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedProducts.map((relatedProduct, index) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
}

export default ProductDetailPage;
