import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { m } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import { Button } from '@/shared/ui/button';
import { DEFAULT_LOCALE, getSiteOrigin, isSupportedLocale, t } from '@/shared/lib/i18n.js';
import { PROCUREMENT_FAQ } from '@/features/faq/data/procurementFaq.js';
import { getFaqExtendedSections } from '@/features/faq/data/faqExtendedSections.jsx';

function FaqPage() {
  const params = useParams();
  const locale = isSupportedLocale(params?.locale) ? params.locale : DEFAULT_LOCALE;
  const faq = PROCUREMENT_FAQ[locale] ?? PROCUREMENT_FAQ[DEFAULT_LOCALE];
  const sections = useMemo(() => getFaqExtendedSections(locale), [locale]);

  const canonical = `${getSiteOrigin()}/${locale}/faq`;
  const alternates = useMemo(
    () =>
      (['en', 'fr', 'vi'] || []).map((l) => ({
        hrefLang: l,
        href: `${getSiteOrigin()}/${l}/faq`,
      })),
    []
  );

  const faqJsonLd = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.items.map((it) => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: it.a,
        },
      })),
    };
  }, [faq]);

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>{t(locale, 'faqPage.pageTitle')}</title>
        <meta
          name="description"
          content={faq.description}
        />
        <link rel="canonical" href={canonical} />
        {alternates.map((a) => (
          <link key={a.hrefLang} rel="alternate" hrefLang={a.hrefLang} href={a.href} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${getSiteOrigin()}/en/faq`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Puxijie" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={faq.title} />
        <meta property="og:description" content={faq.description} />
        <meta property="og:image" content={`${getSiteOrigin()}/og-default.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={faq.title} />
        <meta name="twitter:description" content={faq.description} />
        <meta name="twitter:image" content={`${getSiteOrigin()}/og-default.jpg`} />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <section className="py-24 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                {t(locale, 'faqPage.badge')}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mt-5 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {faq.title}
              </h1>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {faq.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button asChild size="lg" className="bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]">
                  <Link to={`/${locale}/b2b`}>{t(locale, 'faqPage.ctaInquiry')}</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-100 active:scale-[0.98]">
                  <Link to={`/${locale}/lab`}>{t(locale, 'faqPage.ctaLab')}</Link>
                </Button>
              </div>
            </m.div>
          </div>
        </section>

        <section className="py-10 bg-gray-50 border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{faq.title}</h2>
              </div>
              <div className="px-4 sm:px-8 py-6">
                <Accordion type="single" collapsible className="w-full">
                  {faq.items.map((item, idx) => (
                    <AccordionItem key={item.q} value={`proc-${idx}`} className="border-b border-gray-200 last:border-b-0">
                      <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                      <AccordionContent>
                        <div className="text-gray-700 leading-relaxed">{item.a}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="px-4 py-2 rounded-full border border-gray-200 bg-white/60 text-sm font-medium text-gray-700 hover:bg-white transition-colors duration-200"
                >
                  {section.shortTitle}
                </a>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-10">
              {sections.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm"
                >
                  <div className="px-8 py-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  </div>

                  <div className="px-4 sm:px-8 py-6">
                    <Accordion type="single" collapsible className="w-full">
                      {section.items.map((item, idx) => (
                        <AccordionItem
                          key={`${section.id}-${idx}`}
                          value={`${section.id}-${idx}`}
                          className="border-b border-gray-200 last:border-b-0"
                        >
                          <AccordionTrigger className="text-left">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="text-gray-700 leading-relaxed space-y-2">
                              {item.a}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-3xl border border-blue-100 bg-blue-50 p-8">
              <h2 className="text-xl font-bold text-gray-900">{t(locale, 'faqPage.endUserTitle')}</h2>
              <p className="mt-3 text-gray-700 leading-relaxed max-w-3xl">
                {t(locale, 'faqPage.endUserDesc')}
              </p>
              <div className="mt-6">
                <Button asChild size="lg" variant="secondary" className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-100 active:scale-[0.98] transition-all duration-200">
                  <Link to={`/${locale}/contact`}>{t(locale, 'faqPage.contactCta')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default FaqPage;
