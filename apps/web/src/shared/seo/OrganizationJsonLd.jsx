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
          '@id': `${getSiteOrigin()}/en#organization`,
          name: 'Puxijie',
          alternateName: 'Puxijie Tech',
          url: `${getSiteOrigin()}/en`,
          logo: `${getSiteOrigin()}/images/logo.svg`,
          foundingDate: '2013',
          foundingLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Dongguan',
              addressRegion: 'Guangdong',
              addressCountry: 'CN',
            },
          },
          numberOfEmployees: { '@type': 'QuantitativeValue', value: 320, unitText: 'FTE' },
          description:
            'Puxijie is a top-10 China-based OEM/ODM audio manufacturer with 12+ years of experience producing waterproof Bluetooth speakers, portable wireless speakers, specialty speakers, and Bluetooth earbuds. ISO 9001 and ISO 14001 certified, BSCI audited, with a 5,200 sqm Six Sigma facility in Dongguan. Serves 45+ countries across six continents for procurement teams, private-label brands, wholesalers, distributors, and retail channels.',
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
          hasCredential: [
            {
              '@type': 'EducationalOccupationalCredential',
              credentialCategory: 'ISO 9001:2015',
              about: 'Quality Management Systems',
              recognizedBy: { '@type': 'Organization', name: 'SGS' },
              dateCreated: '2018',
            },
            {
              '@type': 'EducationalOccupationalCredential',
              credentialCategory: 'ISO 14001:2015',
              about: 'Environmental Management',
              recognizedBy: { '@type': 'Organization', name: 'SGS' },
              dateCreated: '2019',
            },
            {
              '@type': 'EducationalOccupationalCredential',
              credentialCategory: 'BSCI',
              about: 'Social Compliance Audit — Rating B',
              recognizedBy: { '@type': 'Organization', name: 'Amfori' },
              dateCreated: '2023',
            },
            {
              '@type': 'EducationalOccupationalCredential',
              credentialCategory: 'CE',
              about: 'European Conformity',
            },
            {
              '@type': 'EducationalOccupationalCredential',
              credentialCategory: 'FCC',
              about: 'Federal Communications Commission Compliance',
            },
            {
              '@type': 'EducationalOccupationalCredential',
              credentialCategory: 'RoHS',
              about: 'Restriction of Hazardous Substances Compliance',
            },
            {
              '@type': 'EducationalOccupationalCredential',
              credentialCategory: 'REACH',
              about: 'Chemical Safety Regulation Compliance',
            },
            {
              '@type': 'EducationalOccupationalCredential',
              credentialCategory: 'Bluetooth SIG',
              about: 'Bluetooth Qualification — QDID 182345',
            },
          ],
          makesOffer: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Waterproof Bluetooth Speakers',
                description: 'IPX6/IPX7/IPX8-rated OEM/ODM waterproof Bluetooth speakers for outdoor, poolside, and marine use.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Portable Wireless Bluetooth Speakers',
                description: 'Portable Bluetooth speakers for retail, promotional gifts, and wholesale distribution.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Bluetooth Earbuds',
                description: 'OEM/ODM Bluetooth earbuds for private label, retail, and distributor programs.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Specialty Speakers',
                description: 'Specialty speaker designs with wireless charging for niche retail, gift, and custom brand projects.',
              },
            },
          ],
          event: [
            {
              '@type': 'Event',
              name: 'Canton Fair Exhibitor (133rd–137th Editions)',
              location: { '@type': 'Place', name: 'Guangzhou, China' },
              startDate: '2018',
              endDate: '2025',
            },
            {
              '@type': 'Event',
              name: 'CES Exhibitor (2024–2026)',
              location: { '@type': 'Place', name: 'Las Vegas, USA' },
              startDate: '2024',
              endDate: '2026',
            },
            {
              '@type': 'Event',
              name: 'IFA Exhibitor (2024–2025)',
              location: { '@type': 'Place', name: 'Berlin, Germany' },
              startDate: '2024',
              endDate: '2025',
            },
            {
              '@type': 'Event',
              name: 'Global Sources Consumer Electronics Exhibitor',
              location: { '@type': 'Place', name: 'Hong Kong' },
              startDate: '2019',
              endDate: '2025',
            },
          ],
        },
        {
          '@type': 'LocalBusiness',
          '@id': `${getSiteOrigin()}/en#local-business`,
          name: 'Puxijie — Waterproof Speaker OEM/ODM Manufacturer',
          image: `${getSiteOrigin()}/images/logo.svg`,
          url: `${getSiteOrigin()}/en`,
          telephone: '+86 13532328175',
          email: 'contact@puxijietech.com',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Building 6, No. 49, Fenghuang 2nd Road',
            addressLocality: 'Humen Town, Dongguan City',
            addressRegion: 'Guangdong',
            postalCode: '523900',
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
          priceRange: 'Contact for project-based quotation',
          areaServed: [
            { '@type': 'Continent', name: 'North America' },
            { '@type': 'Continent', name: 'Europe' },
            { '@type': 'Continent', name: 'Asia-Pacific' },
            { '@type': 'Continent', name: 'Middle East' },
            { '@type': 'Continent', name: 'South America' },
            { '@type': 'Continent', name: 'Africa' },
          ],
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
