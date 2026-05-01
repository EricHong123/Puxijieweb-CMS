
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { m } from 'framer-motion';
import { BadgeCheck, Factory, Globe2, ShieldCheck, Truck } from 'lucide-react';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import ProductCard from '@/features/products/components/ProductCard.jsx';
import CategoryFilter from '@/features/products/components/CategoryFilter.jsx';
import { getProductsByCategory, products } from '@/features/products/data/products.js';
import { getSiteOrigin, t } from '@/shared/lib/i18n.js';
import { getCategoryLabel } from '@/features/products/utils/productI18n.js';
import { useLocale } from '@/shared/lib/useLocale.js';
import { getImageFallbackSrc, getImageSrc } from '@/shared/lib/resolveImage.js';
import { getModelSlugById } from '@/features/products/utils/modelSlugs.js';

const LAST_UPDATED = 'April 28, 2026';

const productPageFaqs = [
  {
    question: 'What products does Puxijie manufacture for B2B buyers?',
    answer:
      'Puxijie manufactures outdoor waterproof Bluetooth speakers, portable wireless speakers, specialty speakers, and Bluetooth earbuds for OEM/ODM, private label, wholesale, distributor, and retail channel programs.',
  },
  {
    question: 'Can buyers source IPX6 and IPX7 waterproof Bluetooth speakers from Puxijie?',
    answer:
      'Yes. The product line includes IPX6 and IPX7 portable waterproof speaker models with verified specifications, MOQ guidance, packaging data, chipset details, battery information, and export-ready RFQ support.',
  },
  {
    question: 'Does Puxijie support custom branding and private label audio products?',
    answer:
      'Yes. Puxijie supports OEM/ODM audio projects including logo customization, color planning, packaging direction, sales-channel requirements, and buyer-specific specification confirmation.',
  },
  {
    question: 'What information should a buyer send for a faster quotation?',
    answer:
      'Send the target model, order quantity, destination market, required packaging, logo or branding needs, certification requirements, and expected delivery timing so the RFQ can be reviewed quickly.',
  },
];

function getProductsPageCopy(locale) {
  const copy = {
    en: {
      badge: '2026 buyer-ready product line',
      allTitle: 'OEM audio products built for serious channels.',
      heroDesc:
        'Compare private-mold speakers and earbuds with specification-verified parameters, MOQ, packaging data, and OEM/ODM fit for procurement teams, brands, retailers, and distributors.',
      lastUpdated: 'Last updated',
      modelsShown: 'models shown',
      cards: [
        ['Factory supply', 'Built for quote review and channel sourcing.'],
        ['2026 spec sheet', 'Built for quote review and channel sourcing.'],
        ['Export projects', 'Built for quote review and channel sourcing.'],
        ['Bulk packaging', 'Built for quote review and channel sourcing.'],
      ],
      aiEyebrow: 'AI-readable sourcing summary',
      aiTitle: 'OEM audio products for buyers who need verified specifications before RFQ.',
      aiDesc:
        'Puxijie supplies waterproof Bluetooth speakers, portable wireless speakers, specialty speakers, and Bluetooth earbuds for brand owners, retailers, distributors, and promotional product buyers. Product pages expose model code, category, IP rating, chipset, Bluetooth version, battery, MOQ, color options, packaging data, carton information, and RFQ preparation notes so search engines and AI answer engines can understand the catalog without hidden content.',
      ogTitle: 'OEM Bluetooth Speakers & Earbuds Manufacturer | Puxijie Products',
      ogDesc:
        'RFQ-ready waterproof Bluetooth speakers, portable wireless speakers, earbuds, MOQ, packaging, chipset, battery, and OEM/ODM sourcing details for B2B buyers.',
    },
    fr: {
      badge: 'Gamme 2026 prête pour acheteurs',
      allTitle: 'Produits audio OEM pour canaux professionnels.',
      heroDesc:
        'Comparez enceintes et écouteurs avec paramètres vérifiés, MOQ, données packaging et adéquation OEM/ODM pour équipes achats, marques, retailers et distributeurs.',
      lastUpdated: 'Dernière mise à jour',
      modelsShown: 'modèles affichés',
      cards: [
        ['Approvisionnement usine', 'Préparé pour revue de devis et sourcing canal.'],
        ['Fiche technique 2026', 'Préparé pour revue de devis et sourcing canal.'],
        ['Projets export', 'Préparé pour revue de devis et sourcing canal.'],
        ['Packaging volume', 'Préparé pour revue de devis et sourcing canal.'],
      ],
      aiEyebrow: 'Résumé sourcing lisible par IA',
      aiTitle: 'Produits audio OEM pour acheteurs qui veulent des spécifications vérifiées avant RFQ.',
      aiDesc:
        'Puxijie fournit des enceintes Bluetooth étanches, enceintes portables sans fil, enceintes spécialisées et écouteurs Bluetooth pour marques, retailers, distributeurs et acheteurs promotionnels. Les pages produits exposent code modèle, catégorie, indice IP, chipset, version Bluetooth, batterie, MOQ, couleurs, packaging, cartons et notes RFQ.',
      ogTitle: 'Fabricant OEM d’enceintes Bluetooth et écouteurs | Produits Puxijie',
      ogDesc:
        'Enceintes Bluetooth étanches, enceintes portables, écouteurs, MOQ, packaging, chipset, batterie et détails OEM/ODM prêts RFQ pour acheteurs B2B.',
    },
    vi: {
      badge: 'Dòng sản phẩm 2026 sẵn sàng cho buyer',
      allTitle: 'Sản phẩm audio OEM dành cho kênh chuyên nghiệp.',
      heroDesc:
        'So sánh loa và tai nghe với thông số đã xác minh, MOQ, dữ liệu bao bì và mức phù hợp OEM/ODM cho đội mua hàng, thương hiệu, retailer và nhà phân phối.',
      lastUpdated: 'Cập nhật lần cuối',
      modelsShown: 'model đang hiển thị',
      cards: [
        ['Nguồn cung nhà máy', 'Sẵn sàng cho review báo giá và sourcing theo kênh.'],
        ['Thông số 2026', 'Sẵn sàng cho review báo giá và sourcing theo kênh.'],
        ['Dự án xuất khẩu', 'Sẵn sàng cho review báo giá và sourcing theo kênh.'],
        ['Bao bì số lượng lớn', 'Sẵn sàng cho review báo giá và sourcing theo kênh.'],
      ],
      aiEyebrow: 'Tóm tắt sourcing cho AI đọc',
      aiTitle: 'Sản phẩm audio OEM cho buyer cần thông số đã xác minh trước RFQ.',
      aiDesc:
        'Puxijie cung cấp loa Bluetooth chống nước, loa portable không dây, loa chuyên dụng và tai nghe Bluetooth cho chủ thương hiệu, retailer, nhà phân phối và buyer quà tặng. Trang sản phẩm hiển thị mã model, danh mục, IP rating, chipset, phiên bản Bluetooth, pin, MOQ, màu, bao bì, carton và ghi chú RFQ.',
      ogTitle: 'Nhà sản xuất OEM loa Bluetooth và tai nghe | Sản phẩm Puxijie',
      ogDesc:
        'Loa Bluetooth chống nước, loa portable, tai nghe, MOQ, bao bì, chipset, pin và chi tiết OEM/ODM sẵn sàng RFQ cho buyer B2B.',
    },
  };
  return copy[locale] || copy.en;
}

function buildProductUrl(locale, productId) {
  const slug = getModelSlugById(productId);
  return `${getSiteOrigin()}/${locale}${slug ? `/model/${slug}` : `/products/${productId}`}`;
}

function absoluteAssetUrl(img) {
  const path = getImageSrc(img);
  if (typeof path !== 'string' || !path) return undefined;
  if (path.startsWith('http')) return path;
  return `${getSiteOrigin()}${path.startsWith('/') ? path : `/${path}`}`;
}

function ProductListingPage() {
  const locale = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedIpxRatings, setSelectedIpxRatings] = useState([]);
  const heroProduct = products.find((product) => product.id === 'qw-g34') || products[0];
  const heroImage = Array.isArray(heroProduct?.image) ? heroProduct.image[0] : heroProduct?.image;
  const verifiedProducts = products.filter((product) => product.sheetVerified);
  const canonicalUrl = `${getSiteOrigin()}/${locale}/products`;
  const isEnglish = locale === 'en';
  const pageCopy = getProductsPageCopy(locale);

  // Sync URL query -> UI state (e.g. header links switching categories)
  useEffect(() => {
    setActiveCategory(categoryParam);
    setSelectedIpxRatings([]);
  }, [categoryParam]);

  const categoryCounts = {
    All: verifiedProducts.length,
    'Waterproof Bluetooth Speaker': verifiedProducts.filter(p => p.category === 'Waterproof Bluetooth Speaker').length,
    'Normal Bluetooth Speaker': verifiedProducts.filter(p => p.category === 'Normal Bluetooth Speaker').length,
    'Specialty Speaker': verifiedProducts.filter(p => p.category === 'Specialty Speaker').length,
    'Bluetooth Earbuds': verifiedProducts.filter(p => p.category === 'Bluetooth Earbuds').length
  };

  useEffect(() => {
    let filtered = getProductsByCategory(activeCategory).filter((product) => product.sheetVerified);

    // Apply IPX rating filter
    if (selectedIpxRatings.length > 0) {
      filtered = filtered.filter(product =>
        selectedIpxRatings.includes(product.ipxRating)
      );
    }

    // All Products: buyer-first sort (category priority + flagship models first)
    if (activeCategory === 'All') {
      const categoryPriority = {
        'Waterproof Bluetooth Speaker': 10,
        'Normal Bluetooth Speaker': 20,
        'Specialty Speaker': 30,
        'Bluetooth Earbuds': 40,
      };
      const flagshipOrder = [
        // Waterproof
        'qw-g34',
        'qw-g31',
        // Normal
        'qw-g23',
        'qw-g21',
        'qw-g14',
        'qw-a5',
        'qw-g06',
        // Specialty
        'qw-c-01',
        // Earbuds
        'me-728',
        'me-136',
        'me-76',
        'me-88p',
        'me-636',
        'me-176',
      ];
      const flagshipRank = Object.fromEntries(flagshipOrder.map((id, i) => [id, i + 1]));
      filtered = [...filtered].sort((a, b) => {
        const ca = categoryPriority[a.category] ?? 999;
        const cb = categoryPriority[b.category] ?? 999;
        if (ca !== cb) return ca - cb;
        const ra = flagshipRank[a.id] ?? 999;
        const rb = flagshipRank[b.id] ?? 999;
        if (ra !== rb) return ra - rb;
        return String(a.name).localeCompare(String(b.name));
      });
    }

    setFilteredProducts(filtered);
  }, [activeCategory, selectedIpxRatings]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const handleIpxRatingChange = (rating, checked) => {
    if (checked) {
      setSelectedIpxRatings(prev => [...prev, rating]);
    } else {
      setSelectedIpxRatings(prev => prev.filter(r => r !== rating));
    }
  };

  const clearAllFilters = () => {
    setActiveCategory('All');
    setSelectedIpxRatings([]);
    setSearchParams({});
  };

  const hasActiveFilters =
    activeCategory !== 'All' ||
    selectedIpxRatings.length > 0;

  const collectionJsonLd = useMemo(() => {
    const itemListProducts = (filteredProducts.length > 0 ? filteredProducts : verifiedProducts).slice(0, 24);
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: t(locale, 'productsPage.title'),
          inLanguage: locale,
          dateModified: '2026-04-28',
          description: t(locale, 'productsPage.schemaDescription'),
          about: [
            'outdoor waterproof Bluetooth speaker manufacturer',
            'portable wireless speaker OEM/ODM',
            'private label Bluetooth speaker supplier',
            'Bluetooth earbuds wholesale',
            'IPX6 IPX7 waterproof speaker sourcing',
          ],
          isPartOf: {
            '@type': 'WebSite',
            name: 'Puxijie',
            url: getSiteOrigin(),
          },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonicalUrl}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${getSiteOrigin()}/${locale}` },
            { '@type': 'ListItem', position: 2, name: t(locale, 'nav.products'), item: canonicalUrl },
          ],
        },
        {
          '@type': 'ItemList',
          '@id': `${canonicalUrl}#product-list`,
          name: 'Puxijie RFQ-ready audio product models',
          numberOfItems: itemListProducts.length,
          itemListElement: itemListProducts.map((product, index) => {
            const image = Array.isArray(product.image) ? product.image[0] : product.image;
            return {
              '@type': 'ListItem',
              position: index + 1,
              url: buildProductUrl(locale, product.id),
              item: {
                '@type': 'Product',
                name: product.name,
                url: buildProductUrl(locale, product.id),
                image: absoluteAssetUrl(image),
                brand: { '@type': 'Brand', name: 'Puxijie' },
                manufacturer: { '@type': 'Organization', name: 'Puxijie' },
                category: product.category,
                description: `${product.name} ${product.category} for OEM/ODM, private label, wholesale, distributor, and retail sourcing programs.`,
              },
            };
          }),
        },
        {
          '@type': 'FAQPage',
          '@id': `${canonicalUrl}#faq`,
          mainEntity: productPageFaqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ],
    };
  }, [canonicalUrl, filteredProducts, locale, verifiedProducts]);

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>
          {locale === 'en'
            ? activeCategory === 'All'
              ? 'Products — Outdoor Portable Waterproof Speakers | OEM/ODM & Wholesale | Puxijie'
              : activeCategory === 'Waterproof Bluetooth Speaker'
                ? 'Outdoor Waterproof Bluetooth Speakers — OEM/ODM & Wholesale | Puxijie'
                : activeCategory === 'Normal Bluetooth Speaker'
                  ? 'Portable Wireless Bluetooth Speakers — OEM/ODM & Wholesale | Puxijie'
                  : activeCategory === 'Specialty Speaker'
                    ? 'Specialty Portable Speakers — OEM/ODM Programs | Puxijie'
                    : activeCategory === 'Bluetooth Earbuds'
                      ? 'Bluetooth Earbuds — OEM/ODM & Wholesale | Puxijie'
                      : `${getCategoryLabel(locale, activeCategory)} | Puxijie`
            : `${activeCategory === 'All' ? t(locale, 'productsPage.allProducts') : getCategoryLabel(locale, activeCategory)} | Puxijie`}
        </title>
        <meta
          name="description"
          content={
            locale === 'en'
              ? 'Browse outdoor portable wireless waterproof speakers for OEM/ODM, private label, and wholesale programs. Filter by IPX6/IPX7 ratings and model categories.'
              : t(locale, 'productsPage.tagline')
          }
        />
        {locale === 'en' ? (
          <meta
            name="keywords"
            content="outdoor waterproof bluetooth speaker wholesale, portable wireless waterproof speaker OEM/ODM, IPX7 waterproof speaker manufacturer, private label bluetooth speaker, bulk order portable speakers"
          />
        ) : null}
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageCopy.ogTitle} />
        <meta property="og:description" content={pageCopy.ogDesc} />
        <meta property="og:image" content={absoluteAssetUrl(heroImage)} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={canonicalUrl} />
        {['en', 'fr', 'vi'].map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`${getSiteOrigin()}/${l}/products`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${getSiteOrigin()}/en/products`} />
        {collectionJsonLd && <script type="application/ld+json">{JSON.stringify(collectionJsonLd)}</script>}
      </Helmet>

      <div className="min-h-screen bg-[#f6f5f1]">
        <Header />

        <section className="relative overflow-hidden border-b border-gray-200 bg-[#111111] text-white">
          <div className="absolute inset-0 opacity-35">
            <img
              src={getImageSrc(heroImage)}
              alt=""
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = getImageFallbackSrc();
                event.currentTarget.srcset = '';
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative grid gap-8 py-14 md:grid-cols-[1.1fr_0.9fr] md:items-end lg:py-20"
            >
              <div className="max-w-3xl">
                <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase text-white/80 backdrop-blur">
                  <ShieldCheck className="h-4 w-4" />
                  {pageCopy.badge}
                </p>
                <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
                  {activeCategory === 'All' ? pageCopy.allTitle : getCategoryLabel(locale, activeCategory)}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                  {pageCopy.heroDesc}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                  {pageCopy.lastUpdated}: {LAST_UPDATED}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="rounded-md bg-white px-4 py-2 text-sm font-bold text-gray-950">
                    {filteredProducts.length} {pageCopy.modelsShown}
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="rounded-md border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      {t(locale, 'productsPage.reset')}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  [pageCopy.cards[0][0], pageCopy.cards[0][1], Factory],
                  [pageCopy.cards[1][0], pageCopy.cards[1][1], BadgeCheck],
                  [pageCopy.cards[2][0], pageCopy.cards[2][1], Globe2],
                  [pageCopy.cards[3][0], pageCopy.cards[3][1], Truck],
                ].map(([label, desc, Icon]) => (
                  <div key={label} className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <Icon className="mb-3 h-5 w-5 text-white" />
                    <p className="font-semibold text-white">{label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/65">{desc}</p>
                  </div>
                ))}
              </div>
            </m.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Mobile: top filter */}
            <div className="lg:hidden mb-6 sticky top-16 z-30 rounded-lg border border-gray-200/80 bg-white/90 px-3 py-3 shadow-sm backdrop-blur">
              <CategoryFilter
                locale={locale}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
              {/* Desktop: sidebar filter */}
              <aside className="hidden lg:block">
                <div className="sticky top-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  {/* Header */}
                  <div className="border-b border-gray-200 bg-gray-950 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-semibold text-white">{t(locale, 'productsPage.filters')}</h2>
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="text-xs font-medium text-white/75 hover:text-white hover:underline"
                        >
                          {t(locale, 'productsPage.reset')}
                        </button>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-white/60">
                      {t(locale, 'productsPage.showingOf')
                        .replace('{shown}', String(filteredProducts.length))
                        .replace('{total}', String(verifiedProducts.length))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="divide-y divide-gray-200">
                    {/* Categories Section */}
                    <div className="px-6 py-5">
                      <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">{t(locale, 'productsPage.sidebarCategories')}</h3>
                      <div className="space-y-1.5">
                        <CategoryFilter
                          locale={locale}
                          variant="sidebar"
                          activeCategory={activeCategory}
                          onCategoryChange={handleCategoryChange}
                          counts={categoryCounts}
                        />
                      </div>
                    </div>

                    {/* IPX Rating Section */}
                    <div className="px-6 py-5">
                      <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">{t(locale, 'productsPage.sidebarIpx')}</h3>
                      <div className="space-y-2">
                        {['IPX6', 'IPX7'].map((rating) => (
                          <label key={rating} className="flex items-center cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedIpxRatings.includes(rating)}
                              onChange={(e) => handleIpxRatingChange(rating, e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-500 flex-shrink-0"
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 font-medium flex-1">{rating}</span>
                            <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full transition-colors">
                              {rating === 'IPX6' ? t(locale, 'productsPage.ipxHeavy') : t(locale, 'productsPage.ipx1m')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Info Section */}
                  <div className="border-t border-gray-200 bg-[#f6f5f1] px-6 py-4">
                    <p className="text-xs font-medium text-gray-700/90 leading-relaxed">
                        {t(locale, 'productsPage.sidebarIpxNote')}
                      </p>
                    </div>
                  </div>
                </div>
              </aside>

              <main>
                {filteredProducts.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-white py-16 text-center">
                    <p className="text-lg text-gray-500">{t(locale, 'productsPage.emptyCategory')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </div>
                )}
              </main>
            </div>
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">{pageCopy.aiEyebrow}</p>
              <h2 className="mt-3 text-3xl font-bold text-gray-950">{pageCopy.aiTitle}</h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                {pageCopy.aiDesc}
              </p>
            </div>
            {isEnglish ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {productPageFaqs.map((faq) => (
                  <article key={faq.question} className="rounded-lg border border-gray-200 bg-[#f8f7f3] p-5">
                    <h3 className="text-sm font-bold text-gray-950">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default ProductListingPage;
