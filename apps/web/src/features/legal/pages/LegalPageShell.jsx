import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import { useLocale } from '@/shared/lib/useLocale.js';
import { LEGAL_PAGE_COPY } from '@/features/legal/data/legalPageCopy.js';
import { cmsLegalOverrides } from '@/features/legal/data/legal.generated.js';

function deepMergeLegal(base, override) {
  if (!override) return base;
  const merged = { ...base };
  for (const [localeKey, localeData] of Object.entries(override)) {
    merged[localeKey] = { ...(merged[localeKey] || {}), ...localeData };
  }
  return merged;
}

const LEGAL_COPY = deepMergeLegal(LEGAL_PAGE_COPY, cmsLegalOverrides);

function LegalPageShell({ pageKey }) {
  const locale = useLocale();
  const page = LEGAL_COPY[pageKey]?.[locale] ?? LEGAL_COPY[pageKey]?.en;

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <section className="py-24 bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-800">
                {page.eyebrow}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mt-5 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {page.h1}
              </h1>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {page.lead}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="rounded-3xl border border-gray-200 bg-white shadow-sm p-7 sm:p-10">
              <div className="space-y-4 text-gray-700 leading-relaxed">
                {page.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <ol className="mt-8 list-decimal pl-5 space-y-7 text-gray-700 leading-relaxed">
                {page.sections.map(([title, paragraphs]) => (
                  <li key={title}>
                    <p className="font-semibold text-gray-900">{title}</p>
                    <div className="mt-2 space-y-2">
                      {paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default LegalPageShell;
