
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { m } from 'framer-motion';
import { Beaker, FileText, Search, Shield, Zap } from 'lucide-react';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import { getSiteOrigin, t } from '@/shared/lib/i18n.js';
import { useLocale } from '@/shared/lib/useLocale.js';
import { toPublicFileUrl } from '@/shared/lib/staticFileUrl.js';

function getLabPageCopy(locale) {
  const copy = {
    en: {
      buyerValidation:
        'Buyer-ready validation for outdoor waterproof speakers: IPX6/IPX7 water resistance, durability checks, and compliance references for OEM/ODM and wholesale sourcing.',
      files: 'files',
      tip: 'Tip: PDFs open in a new tab. OFD files may require a compatible viewer.',
      pdfNote: 'PDF • Opens in a new tab',
      reportTitle: (model) => `${model} Waterproof Test Report (PDF)`,
    },
    fr: {
      buyerValidation:
        'Validation prête pour acheteurs d’enceintes outdoor étanches : résistance IPX6/IPX7, contrôles de durabilité et références conformité pour sourcing OEM/ODM et wholesale.',
      files: 'fichiers',
      tip: 'Astuce : les PDF s’ouvrent dans un nouvel onglet. Les fichiers OFD peuvent nécessiter un lecteur compatible.',
      pdfNote: 'PDF • Ouvre dans un nouvel onglet',
      reportTitle: (model) => `Rapport de test étanchéité ${model} (PDF)`,
    },
    vi: {
      buyerValidation:
        'Kiểm định sẵn sàng cho buyer loa outdoor chống nước: IPX6/IPX7, kiểm tra độ bền và tài liệu tuân thủ cho sourcing OEM/ODM và bán sỉ.',
      files: 'tệp',
      tip: 'Gợi ý: PDF mở trong tab mới. File OFD có thể cần trình xem tương thích.',
      pdfNote: 'PDF • Mở trong tab mới',
      reportTitle: (model) => `Báo cáo kiểm tra chống nước ${model} (PDF)`,
    },
  };
  return copy[locale] || copy.en;
}

function PuxijieLabPage() {
  const locale = useLocale();
  const pageCopy = getLabPageCopy(locale);
  const [batteryManifest, setBatteryManifest] = useState(null);
  const [batteryQuery, setBatteryQuery] = useState('');
  const waterproofReports = [
    {
      title: pageCopy.reportTitle('G31'),
      url: '/reports/waterproof/G31-Waterproof-Test-Report.pdf',
    },
    {
      title: pageCopy.reportTitle('G34'),
      url: '/reports/waterproof/G34-Waterproof-Test-Report.pdf',
    },
  ];

  useEffect(() => {
    let cancelled = false;
    fetch(toPublicFileUrl('/reports/battery/IMR18650-1200/manifest.json'))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setBatteryManifest(data);
      })
      .catch(() => {
        if (cancelled) return;
        setBatteryManifest(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const batteryFiles = useMemo(() => {
    const files = batteryManifest?.files ?? [];
    const q = batteryQuery.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => (f.path || '').toLowerCase().includes(q));
  }, [batteryManifest, batteryQuery]);

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>
          {locale === 'en'
            ? 'Lab & Test Reports — Waterproof Speaker Reliability | Puxijie OEM/ODM'
            : `${t(locale, 'labPage.title')} | Puxijie`}
        </title>
        <meta
          name="description"
          content={
            locale === 'en'
              ? 'View waterproof speaker lab testing and validation reports for B2B sourcing. IPX6/IPX7 water resistance, durability checks, and compliance support for OEM/ODM and wholesale programs.'
              : t(locale, 'labPage.heroDesc')
          }
        />
        {locale === 'en' ? (
          <meta
            name="keywords"
            content="waterproof speaker test report, IPX7 waterproof speaker validation, outdoor speaker lab testing, OEM/ODM speaker compliance, reliability test for portable speakers"
          />
        ) : null}
        <link rel="canonical" href={`${getSiteOrigin()}/${locale}/lab`} />
        {['en', 'fr', 'vi'].map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`${getSiteOrigin()}/${l}/lab`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${getSiteOrigin()}/en/lab`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Puxijie" />
        <meta property="og:url" content={`${getSiteOrigin()}/${locale}/lab`} />
        <meta property="og:title" content={t(locale, 'labPage.title')} />
        <meta property="og:description" content={t(locale, 'labPage.heroDesc')} />
        <meta property="og:image" content={`${getSiteOrigin()}/og-default.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t(locale, 'labPage.title')} />
        <meta name="twitter:description" content={t(locale, 'labPage.heroDesc')} />
        <meta name="twitter:image" content={`${getSiteOrigin()}/og-default.jpg`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <section className="relative py-24 overflow-hidden border-b border-gray-200">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1657778752500-9da406aa813f?w=1920&q=80"
              alt="Puxijie lab testing and certification — waterproof Bluetooth speaker reliability validation"
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/90"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {t(locale, 'labPage.heroTitle')}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t(locale, 'labPage.heroDesc')}
              </p>
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                {pageCopy.buyerValidation}
              </p>
            </m.div>
          </div>
        </section>

        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {t(locale, 'labPage.whyTestTitle')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t(locale, 'labPage.whyTestDesc')}
              </p>
            </m.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <Beaker className="w-12 h-12 text-gray-900 mb-4" />
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t(locale, 'labPage.simTitle')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(locale, 'labPage.simDesc')}
                </p>
              </m.div>

              <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <Shield className="w-12 h-12 text-gray-900 mb-4" />
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t(locale, 'labPage.certTitle')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(locale, 'labPage.certDesc')}
                </p>
              </m.div>

              <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <Zap className="w-12 h-12 text-gray-900 mb-4" />
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t(locale, 'labPage.improveTitle')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(locale, 'labPage.improveDesc')}
                </p>
              </m.div>
            </div>
          </div>
        </section>

        {/* Battery Report */}
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {t(locale, 'labPage.batteryTitle')}
              </h2>
              <p className="text-gray-600 max-w-3xl">
                {t(locale, 'labPage.batteryDesc')}
              </p>
            </m.div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-gray-900">IMR18650-1200</span>
                  <span className="text-gray-500">
                    {batteryManifest?.count ? `${batteryManifest.count} ${pageCopy.files}` : t(locale, 'labPage.loading')}
                  </span>
                </div>

                <div className="relative w-full sm:w-[360px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={batteryQuery}
                    onChange={(e) => setBatteryQuery(e.target.value)}
                    placeholder={t(locale, 'labPage.searchPlaceholder')}
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>

              <div className="mt-5 max-h-[520px] overflow-auto rounded-xl border border-gray-200 bg-white">
                {batteryManifest && batteryFiles.length === 0 ? (
                  <div className="p-6 text-sm text-gray-600">{t(locale, 'labPage.noMatch')}</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {(batteryFiles || []).slice(0, 300).map((f) => (
                      <li key={f.url} className="flex items-center justify-between gap-4 p-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{f.path}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {(f.bytes ? `${Math.round(f.bytes / 1024)} KB` : '')}
                          </p>
                        </div>
                        <a
                          href={toPublicFileUrl(f.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          {t(locale, 'labPage.open')}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                {pageCopy.tip}
              </div>
            </div>
          </div>
        </section>

        {/* Waterproof Reports */}
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {t(locale, 'labPage.waterproofTitle')}
              </h2>
              <p className="text-gray-600 max-w-3xl">
                {t(locale, 'labPage.waterproofDesc')}
              </p>
            </m.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {waterproofReports.map((r) => (
                <a
                  key={r.url}
                  href={toPublicFileUrl(r.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-gray-200 bg-gray-50 p-5 hover:bg-gray-100/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{pageCopy.pdfNote}</p>
                    </div>
                    <span className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 group-hover:bg-gray-50">
                      {t(locale, 'labPage.open')}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default PuxijieLabPage;
