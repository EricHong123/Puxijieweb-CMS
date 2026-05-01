import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { getSiteOrigin } from '@/shared/lib/i18n.js';
import { coreKeywords, secondaryKeywords } from '@/shared/seo/seoKeywords.js';

function OrganizationJsonLd() {
  const jsonLd = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: 'Puxijie',
          url: `${getSiteOrigin()}/en`,
          logo: `${getSiteOrigin()}/images/logo.svg`,
          description:
            '12-year waterproof Bluetooth speaker manufacturer offering OEM/ODM, wholesale, and private label services for brands, distributors, and gift buyers.',
          knowsAbout: [...coreKeywords, ...secondaryKeywords].slice(0, 24),
          email: 'contact@puxijietech.com',
          telephone: '+86 13532328175',
          sameAs: [
            'https://www.instagram.com/puxijie_tech/',
            'https://www.facebook.com/profile.php?id=61585567220467',
          ],
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'WeChat', value: 'EricH0625' },
          ],
        },
        {
          '@type': 'LocalBusiness',
          '@id': `${getSiteOrigin()}/en#local-business`,
          name: 'Puxijie — Outdoor Waterproof Speaker OEM/ODM Manufacturer',
          image: `${getSiteOrigin()}/images/logo.svg`,
          url: `${getSiteOrigin()}/en`,
          telephone: '+86 13532328175',
          email: 'contact@puxijietech.com',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Building 6, No. 49, Fenghuang 2nd Road',
            addressLocality: 'Humen Town, Dongguan City',
            addressRegion: 'Guangdong',
            addressCountry: 'CN',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 22.75181,
            longitude: 113.69522,
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              opens: '09:00',
              closes: '18:00',
            },
          ],
          priceRange: 'Contact for pricing',
          areaServed: ['EU', 'US', 'Asia-Pacific', 'Middle East', 'South America'],
          contactPoint: [
            {
              '@type': 'ContactPoint',
              contactType: 'sales',
              email: 'inquiry@puxijietech.com',
              telephone: '+86 13532328175',
              availableLanguage: ['English', 'French', 'Vietnamese'],
            },
          ],
        },
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

