import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { getSiteOrigin } from '@/shared/lib/i18n.js';
import { coreKeywords, secondaryKeywords } from '@/shared/seo/seoKeywords.js';

function OrganizationJsonLd() {
  const jsonLd = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Puxijie',
      url: `${getSiteOrigin()}/en`,
      logo: `${getSiteOrigin()}/images/logo.svg`,
      description:
        '12-year waterproof Bluetooth speaker manufacturer offering OEM/ODM, wholesale, and private label services for brands, distributors, and gift buyers.',
      knowsAbout: [...coreKeywords, ...secondaryKeywords].slice(0, 24),
      email: 'contact@puxijietech.com',
      telephone: '+86 13532328175',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Building 6, No. 49, Fenghuang 2nd Road',
        addressLocality: 'Humen Town, Dongguan City',
        addressRegion: 'Guangdong',
        addressCountry: 'CN',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: 'inquiry@puxijietech.com',
          telephone: '+86 13532328175',
          availableLanguage: ['English', 'French', 'Vietnamese'],
        },
      ],
      sameAs: [
        'https://www.instagram.com/puxijie_tech/',
        'https://www.facebook.com/profile.php?id=61585567220467',
      ],
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'WeChat', value: 'EricH0625' },
      ],
    };
  }, []);

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}

export default OrganizationJsonLd;

