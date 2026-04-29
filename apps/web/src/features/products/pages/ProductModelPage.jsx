import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Boxes, Cable, Cpu, Download, Factory, PackageCheck, Palette, Radio, Ruler, ShieldCheck, Weight } from 'lucide-react';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import { getProductById } from '@/features/products/data/products.js';
import ProductGallery from '@/features/products/components/ProductGallery.jsx';
import InquiryButton from '@/shared/site/InquiryButton.jsx';
import { DEFAULT_LOCALE, getSiteOrigin, isSupportedLocale, t } from '@/shared/lib/i18n.js';
import { getLocalizedProduct } from '@/features/products/utils/productI18n.js';
import { MODEL_SLUG_TO_ID } from '@/features/products/utils/modelSlugs.js';
import { getImageFallbackSrc, getImageSrc } from '@/shared/lib/resolveImage.js';
import { toPublicFileUrl } from '@/shared/lib/staticFileUrl.js';

const LAST_UPDATED = 'April 28, 2026';

function getModelPageCopy(locale) {
  const copy = {
    en: {
      verified: '2026 specification verified',
      updated: 'Last updated',
      rfqStatus: 'RFQ status',
      projectQuote: 'Project quote',
      confirm: 'Confirm',
      preparedDesc:
        'is prepared for OEM/ODM, private label, wholesale, and retail channel sourcing with verified technical and commercial parameters from the 2026 specification sheet.',
      decisionTitle: 'Buyer Decision Snapshot',
      colors: 'Colors',
      custom: 'Custom',
      productSize: 'Product size',
      netWeight: 'Net weight',
      technical: 'Technical Parameters',
      commercial: 'Commercial & Packing Data',
      confidence: 'Procurement Confidence',
      oemReady: 'OEM/ODM ready',
      oemReadyDesc:
        'Logo, color, packaging, and sales-channel requirements can be evaluated against MOQ and material limits.',
      rfqInputs: 'Clear RFQ inputs',
      rfqInputsDesc: 'MOQ, packaging, color, battery, chipset, carton, and branding inputs are visible before inquiry.',
      buyerSupport: 'Buyer support',
      buyerSupportDesc:
        'Share target market, order quantity, certification needs, and packaging direction for a cleaner quote.',
      aiEyebrow: 'AI-readable product summary',
      aiTitleSuffix: 'sourcing facts for Google and AI answer engines.',
      aiDesc:
        'is listed with crawlable model data, category, buyer use case, chipset, Bluetooth version, battery, color options, MOQ, package data, carton data, and customization notes. This page is intentionally written for B2B buyers searching for OEM Bluetooth speaker manufacturers, waterproof portable speaker suppliers, private label audio factories, wholesale earbuds, and RFQ-ready consumer electronics programs.',
      quoteEyebrow: 'Quote next step',
      quoteTitle: 'Send this model into a buyer-ready RFQ.',
      quoteDesc:
        'Include destination market, target quantity, required packaging, logo position, and certification needs.',
    },
    fr: {
      verified: 'Spécification 2026 vérifiée',
      updated: 'Dernière mise à jour',
      rfqStatus: 'Statut RFQ',
      projectQuote: 'Devis projet',
      confirm: 'À confirmer',
      preparedDesc:
        'est préparé pour le sourcing OEM/ODM, private label, wholesale et retail avec paramètres techniques et commerciaux vérifiés depuis la fiche 2026.',
      decisionTitle: 'Synthèse de décision acheteur',
      colors: 'Couleurs',
      custom: 'Personnalisé',
      productSize: 'Taille produit',
      netWeight: 'Poids net',
      technical: 'Paramètres techniques',
      commercial: 'Données commerciales et packaging',
      confidence: 'Confiance achats',
      oemReady: 'Prêt OEM/ODM',
      oemReadyDesc:
        'Logo, couleur, packaging et exigences de canal peuvent être évalués selon MOQ et limites matières.',
      rfqInputs: 'Entrées RFQ claires',
      rfqInputsDesc: 'MOQ, packaging, couleur, batterie, chipset, carton et branding sont visibles avant demande.',
      buyerSupport: 'Support acheteur',
      buyerSupportDesc:
        'Partagez marché cible, quantité, besoins certification et direction packaging pour un devis plus propre.',
      aiEyebrow: 'Résumé produit lisible par IA',
      aiTitleSuffix: 'faits sourcing pour Google et moteurs de réponse IA.',
      aiDesc:
        'est présenté avec données modèle crawlables, catégorie, usage acheteur, chipset, version Bluetooth, batterie, couleurs, MOQ, packaging, carton et notes de personnalisation.',
      quoteEyebrow: 'Étape suivante du devis',
      quoteTitle: 'Envoyer ce modèle dans une RFQ prête acheteur.',
      quoteDesc:
        'Incluez marché de destination, quantité cible, packaging requis, position logo et besoins de certification.',
    },
    vi: {
      verified: 'Thông số 2026 đã xác minh',
      updated: 'Cập nhật lần cuối',
      rfqStatus: 'Trạng thái RFQ',
      projectQuote: 'Báo giá theo dự án',
      confirm: 'Xác nhận',
      preparedDesc:
        'được chuẩn bị cho sourcing OEM/ODM, private label, bán sỉ và kênh retail với thông số kỹ thuật và thương mại đã xác minh từ spec sheet 2026.',
      decisionTitle: 'Tóm tắt quyết định cho buyer',
      colors: 'Màu sắc',
      custom: 'Tùy chỉnh',
      productSize: 'Kích thước sản phẩm',
      netWeight: 'Trọng lượng tịnh',
      technical: 'Thông số kỹ thuật',
      commercial: 'Dữ liệu thương mại và đóng gói',
      confidence: 'Độ tin cậy mua hàng',
      oemReady: 'Sẵn sàng OEM/ODM',
      oemReadyDesc:
        'Logo, màu, bao bì và yêu cầu kênh bán hàng có thể được đánh giá theo MOQ và giới hạn vật liệu.',
      rfqInputs: 'Đầu vào RFQ rõ ràng',
      rfqInputsDesc: 'MOQ, bao bì, màu, pin, chipset, carton và branding hiển thị trước khi inquiry.',
      buyerSupport: 'Hỗ trợ buyer',
      buyerSupportDesc:
        'Gửi thị trường mục tiêu, số lượng, yêu cầu chứng nhận và hướng bao bì để báo giá gọn hơn.',
      aiEyebrow: 'Tóm tắt sản phẩm cho AI đọc',
      aiTitleSuffix: 'dữ liệu sourcing cho Google và AI answer engines.',
      aiDesc:
        'được liệt kê với dữ liệu model có thể crawl, danh mục, use case buyer, chipset, phiên bản Bluetooth, pin, màu, MOQ, bao bì, carton và ghi chú tùy chỉnh.',
      quoteEyebrow: 'Bước báo giá tiếp theo',
      quoteTitle: 'Đưa model này vào RFQ sẵn sàng cho buyer.',
      quoteDesc:
        'Bao gồm thị trường đích, số lượng mục tiêu, bao bì yêu cầu, vị trí logo và nhu cầu chứng nhận.',
    },
  };
  return copy[locale] || copy.en;
}

function getLocaleFromParams(params) {
  const locale = params?.locale;
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}

function buildLocalizedUrl(locale, path) {
  return `${getSiteOrigin()}/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Static asset URL for JSON-LD (imagetools exports `{ src, ... }`, not a path string). */
function absoluteAssetUrl(img) {
  const path = getImageSrc(img);
  if (typeof path !== 'string' || !path) return null;
  if (path.startsWith('http')) return path;
  return `${getSiteOrigin()}${path.startsWith('/') ? path : `/${path}`}`;
}

function ProductModelPage() {
  const params = useParams();
  const locale = getLocaleFromParams(params);
  const navigate = useNavigate();
  const slug = String(params?.slug || '').toLowerCase();
  const productId = MODEL_SLUG_TO_ID[slug];
  const product = productId ? getProductById(productId) : null;
  const p = useMemo(() => (product ? getLocalizedProduct(product, locale) : null), [product, locale]);
  const fallbackProductsUrl = `/${locale}/products`;

  const canonicalPath = `/model/${slug}`;
  const canonical = buildLocalizedUrl(locale, canonicalPath);

  const modelCode = useMemo(() => {
    if (!p?.name) return '';
    return String(p.name).split(/\s+/)[0];
  }, [p?.name]);

  const isEnglish = locale === 'en';
  const pageCopy = getModelPageCopy(locale);
  const englishTitle = useMemo(() => {
    if (!p) return '';
    if (p.category === 'Bluetooth Earbuds') {
      const model = modelCode || p.name;
      return `${model} Bluetooth Earbuds — OEM/ODM & Wholesale | Puxijie`;
    }
    const ipx = (p.ipxRating || '').toUpperCase();
    const model = modelCode || p.name;
    if (!ipx || ipx === 'N/A') {
      return `${model} Specialty Speaker | Puxijie OEM/ODM`;
    }
    return `${model} — ${ipx} Outdoor Portable Waterproof Speaker | OEM/ODM & Wholesale | Puxijie`;
  }, [modelCode, p]);

  const englishDescription = useMemo(() => {
    if (!p) return '';
    if (p.category === 'Bluetooth Earbuds') {
      const model = modelCode || p.name;
      return `${model} is a Bluetooth earbuds model designed for OEM/ODM and wholesale programs. 10m transmission range, 20Hz-20kHz frequency response, and compact battery configurations for brands, distributors, and promotional gifts.`;
    }
    const ipx = (p.ipxRating || '').toUpperCase();
    const model = modelCode || p.name;
    const playtime = p.batteryLife || '—';
    if (!ipx || ipx === 'N/A') {
      return `${model} is a specialty speaker designed for OEM/ODM and wholesale programs. ${playtime} playtime, portable design, ideal for brands, distributors, and promotional gifts.`;
    }
    return `${model} is an outdoor portable wireless ${ipx} waterproof speaker designed for OEM/ODM, private label, and wholesale programs. ${playtime} playtime, rugged portable design, built for brands, distributors, and promotional gifts.`;
  }, [modelCode, p]);

  const englishH1 = useMemo(() => {
    if (!p) return '';
    if (p.category === 'Bluetooth Earbuds') {
      const model = modelCode || p.name;
      return `${model} Bluetooth Earbuds — OEM/ODM & Wholesale`;
    }
    const ipx = (p.ipxRating || '').toUpperCase();
    const model = modelCode || p.name;
    if (!ipx || ipx === 'N/A') {
      return `${model} Specialty Speaker — OEM/ODM Ready`;
    }
    return `${ipx} Outdoor Portable Waterproof Speaker ${model} — OEM/ODM & Wholesale`;
  }, [modelCode, p]);

  const alternates = useMemo(() => {
    const langs = ['en', 'fr', 'vi'];
    return langs.map((l) => ({
      hrefLang: l,
      href: buildLocalizedUrl(l, canonicalPath),
    }));
  }, [canonicalPath]);

  const pageFaqs = useMemo(() => {
    if (!p) return [];
    const model = modelCode || p.name;
    const productType = p.category === 'Bluetooth Earbuds' ? 'Bluetooth earbuds' : 'Bluetooth speaker';
    return [
      {
        question: `What is ${model} used for?`,
        answer: `${model} is a ${productType} model prepared for OEM/ODM, private label, wholesale, distributor, retailer, promotional gift, and channel sourcing programs.`,
      },
      {
        question: `Which verified specifications are available for ${model}?`,
        answer: `${model} includes buyer-facing specification data such as category, chipset, Bluetooth version, transmission distance, battery configuration, color options, MOQ guidance, package data, and carton planning information where available.`,
      },
      {
        question: `Can ${model} be customized for brand programs?`,
        answer: `Yes. Puxijie can review logo, color, packaging, accessory, compliance, and market-specific requirements for ${model} after the buyer shares project details.`,
      },
      {
        question: `How can a buyer request an RFQ for ${model}?`,
        answer: `Send the target quantity, destination market, packaging direction, branding requirements, certification needs, and expected timeline so Puxijie can prepare a project-specific quotation.`,
      },
    ];
  }, [modelCode, p]);

  const jsonLd = useMemo(() => {
    if (!p) return null;
    const images = Array.isArray(p.image) ? p.image : [p.image];
    const model = modelCode || p.name;
    const ipx = (p.ipxRating || '').toUpperCase();
    const imageUrls = images.map(absoluteAssetUrl).filter(Boolean);
    const specProperties = [
      ...(Array.isArray(p.sheetSpecs) ? p.sheetSpecs : []),
      ...(Array.isArray(p.packagingSpecs) ? p.packagingSpecs : []),
    ]
      .filter(([label, value]) => label && value)
      .map(([label, value]) => ({ '@type': 'PropertyValue', name: label, value: String(value) }));

    const productName =
      p.category === 'Bluetooth Earbuds'
        ? `${model} Bluetooth Earbuds`
        : p.category === 'Specialty Speaker'
          ? `${model} Specialty Speaker`
          : `${model} Waterproof Bluetooth Speaker`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${canonical}#webpage`,
          url: canonical,
          name: isEnglish ? englishTitle : `${p.name} | ${t(locale, 'siteName')}`,
          inLanguage: locale,
          dateModified: '2026-04-28',
          description: isEnglish
            ? englishDescription
            : `${p.name} — ${t(locale, 'product.headline')}. ${t(locale, 'geo.responseTime')}`,
          about: { '@id': `${canonical}#product` },
          isPartOf: {
            '@type': 'WebSite',
            name: 'Puxijie',
            url: getSiteOrigin(),
          },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonical}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${getSiteOrigin()}/${locale}` },
            { '@type': 'ListItem', position: 2, name: 'Products', item: `${getSiteOrigin()}/${locale}/products` },
            { '@type': 'ListItem', position: 3, name: model, item: canonical },
          ],
        },
        {
          '@type': 'Product',
          '@id': `${canonical}#product`,
          name: productName,
          sku: model,
          mpn: model,
          model,
          category: p.category,
          description: isEnglish
            ? englishDescription
            : `${p.name} — ${t(locale, 'product.headline')}. ${t(locale, 'geo.wechatLabel')}: ${t(locale, 'geo.wechatValue')}.`,
          brand: { '@type': 'Brand', name: 'Puxijie' },
          manufacturer: { '@type': 'Organization', name: 'Puxijie', url: getSiteOrigin() },
          url: canonical,
          image: imageUrls.length > 0 ? imageUrls : undefined,
          additionalProperty: [
            ipx && ipx !== 'N/A' ? { '@type': 'PropertyValue', name: 'IP rating', value: ipx } : null,
            p.batteryLife ? { '@type': 'PropertyValue', name: 'Playtime', value: p.batteryLife } : null,
            ...specProperties,
          ].filter(Boolean),
        },
        {
          '@type': 'FAQPage',
          '@id': `${canonical}#faq`,
          mainEntity: pageFaqs.map((faq) => ({
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
  }, [canonical, englishDescription, englishTitle, isEnglish, locale, modelCode, p, pageFaqs]);

  if (!product || !p) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{t(locale, 'productDetail.notFound')}</h1>
          <p className="mt-3 text-gray-600">{t(locale, 'productDetail.modelUnavailable')}</p>
          <Link to={fallbackProductsUrl} className="mt-8 inline-block rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50">
            {t(locale, 'productDetail.backToProducts')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const sheetSpecs = Array.isArray(p.sheetSpecs) ? p.sheetSpecs : [];
  const packagingSpecs = Array.isArray(p.packagingSpecs) ? p.packagingSpecs : [];
  const heroImage = Array.isArray(p.image) ? p.image[0] : p.image;
  const decisionStats = [
    { label: pageCopy.rfqStatus, value: pageCopy.projectQuote, icon: BadgeCheck },
    { label: 'MOQ', value: p.moq || pageCopy.confirm, icon: Boxes },
    { label: 'Bluetooth', value: p.bluetoothVersion || pageCopy.confirm, icon: Radio },
    { label: 'Chipset', value: p.chipset || pageCopy.confirm, icon: Cpu },
  ];

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>{isEnglish ? englishTitle : `${p.name} | ${t(locale, 'siteName')}`}</title>
        <meta
          name="description"
          content={isEnglish ? englishDescription : `${p.name} — ${t(locale, 'product.headline')}. ${t(locale, 'geo.responseTime')}`}
        />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        {isEnglish ? (
          <meta
            name="keywords"
            content="outdoor portable waterproof speaker OEM/ODM, wireless waterproof speaker wholesale, private label outdoor bluetooth speaker, IPX7 waterproof speaker supplier"
          />
        ) : null}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={isEnglish ? englishTitle : `${p.name} | ${t(locale, 'siteName')}`} />
        <meta property="og:description" content={isEnglish ? englishDescription : `${p.name} — ${t(locale, 'product.headline')}. ${t(locale, 'geo.responseTime')}`} />
        <meta property="og:image" content={absoluteAssetUrl(heroImage)} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={canonical} />
        {alternates.map((a) => (
          <link key={a.hrefLang} rel="alternate" hrefLang={a.hrefLang} href={a.href} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={buildLocalizedUrl('en', canonicalPath)} />
        {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      </Helmet>

      <div className="min-h-screen bg-[#f6f5f1]">
        <Header />

        <main>
          <section className="relative overflow-hidden bg-[#111111] text-white">
            <div className="absolute inset-0 opacity-35">
              <img
                src={getImageSrc(heroImage)}
                alt=""
                onError={(event) => {
                  event.currentTarget.src = getImageFallbackSrc();
                  event.currentTarget.srcset = '';
                }}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
            <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.length > 1) navigate(-1);
                    else navigate(fallbackProductsUrl);
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t(locale, 'productsPage.allProducts')}
                </button>
              </div>

              <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase text-white/80 backdrop-blur">
                    <ShieldCheck className="h-4 w-4" />
                    {pageCopy.verified}
                  </p>
                  <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    {isEnglish ? englishH1 : p.name}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                    {`${p.name} ${pageCopy.preparedDesc}`}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                    {pageCopy.updated}: {LAST_UPDATED}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {decisionStats.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                      <Icon className="mb-3 h-5 w-5 text-white" />
                      <p className="text-xs font-semibold uppercase text-white/55">{label}</p>
                      <p className="mt-1 text-base font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="lg:sticky lg:top-6 lg:self-start">
                <ProductGallery images={p.image} productName={p.name} />
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">{p.category}</p>
                      <h2 className="mt-2 text-2xl font-bold text-gray-950">{pageCopy.decisionTitle}</h2>
                    </div>
                    <InquiryButton productName={p.name} className="bg-gray-950 text-white hover:bg-gray-800" />
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      [pageCopy.colors, p.colorOptions || pageCopy.custom, Palette],
                      [pageCopy.productSize, p.dimensions || pageCopy.confirm, Ruler],
                      [pageCopy.netWeight, p.weight || p.setWeight || pageCopy.confirm, Weight],
                    ].map(([label, value, Icon]) => (
                      <div key={label} className="rounded-md border border-gray-200 bg-[#f8f7f3] p-4">
                        <Icon className="mb-3 h-5 w-5 text-gray-700" />
                        <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
                        <p className="mt-1 text-sm font-bold text-gray-950">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <Factory className="h-5 w-5 text-gray-800" />
                    <h2 className="text-xl font-bold text-gray-950">{pageCopy.technical}</h2>
                  </div>
                  <dl className="mt-5 grid grid-cols-1 overflow-hidden rounded-lg border border-gray-200 sm:grid-cols-2">
                    {sheetSpecs.map(([label, value]) => (
                      <div key={label} className="border-b border-gray-200 p-4 last:border-b-0 sm:border-r sm:even:border-r-0">
                        <dt className="text-xs font-semibold uppercase text-gray-500">{label}</dt>
                        <dd className="mt-1 text-sm font-bold text-gray-950">{value || pageCopy.confirm}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <PackageCheck className="h-5 w-5 text-gray-800" />
                    <h2 className="text-xl font-bold text-gray-950">{pageCopy.commercial}</h2>
                  </div>
                  <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {packagingSpecs.map(([label, value]) => (
                      <div key={label} className="rounded-md bg-[#f8f7f3] p-4">
                        <dt className="text-xs font-semibold uppercase text-gray-500">{label}</dt>
                        <dd className="mt-1 text-sm font-bold text-gray-950">{value || pageCopy.confirm}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-lg border border-gray-200 bg-gray-950 p-5 text-white shadow-sm sm:p-6">
                    <h2 className="text-xl font-bold">{pageCopy.confidence}</h2>
                    <ul className="mt-4 space-y-3">
                      {(p.procurementNotes || []).map((note) => (
                        <li key={note} className="flex items-start gap-3 text-sm leading-relaxed text-white/75">
                          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-3">
                      <Cable className="h-5 w-5 text-gray-800" />
                      <h2 className="text-xl font-bold text-gray-950">{t(locale, 'product.downloads')}</h2>
                    </div>
                    {Array.isArray(p.downloads) && p.downloads.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        {p.downloads.map((d) => (
                          <a
                            key={d.url}
                            href={toPublicFileUrl(d.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-[#f8f7f3] px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                          >
                            <span className="min-w-0 truncate">{d.title}</span>
                            <Download className="h-4 w-4 text-gray-500" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-gray-600">{t(locale, 'productDetail.noDownloads')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-gray-200 bg-white py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  [pageCopy.oemReady, pageCopy.oemReadyDesc],
                  [pageCopy.rfqInputs, pageCopy.rfqInputsDesc],
                  [pageCopy.buyerSupport, pageCopy.buyerSupportDesc],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-lg border border-gray-200 bg-[#f8f7f3] p-5">
                    <p className="text-base font-bold text-gray-950">{title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-y border-gray-200 bg-white py-12">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">{pageCopy.aiEyebrow}</p>
                <h2 className="mt-3 text-3xl font-bold text-gray-950">
                  {modelCode || p.name} {pageCopy.aiTitleSuffix}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  {modelCode || p.name} {pageCopy.aiDesc}
                </p>
              </div>
              {isEnglish ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {pageFaqs.map((faq) => (
                    <article key={faq.question} className="rounded-lg border border-gray-200 bg-[#f8f7f3] p-5">
                      <h3 className="text-sm font-bold text-gray-950">{faq.question}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-gray-950 p-6 text-white sm:p-8 lg:flex lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-white/50">{pageCopy.quoteEyebrow}</p>
                <h2 className="mt-2 text-2xl font-bold">{pageCopy.quoteTitle}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
                  {pageCopy.quoteDesc}
                </p>
              </div>
              <div className="mt-5 lg:mt-0">
                <InquiryButton productName={p.name} className="bg-white text-gray-950 hover:bg-gray-100" />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default ProductModelPage;

