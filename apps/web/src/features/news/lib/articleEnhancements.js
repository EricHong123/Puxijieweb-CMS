const articleEnhancements = {
  'en/how-to-choose-waterproof-speaker': {
    heroImages: [
      {
        src: '/images/news/g31-outdoor.webp',
        alt: 'G31 outdoor waterproof bluetooth speaker product image',
      },
      {
        src: '/images/news/g34-ipx7.webp',
        alt: 'G34 IPX7 waterproof bluetooth speaker product image',
      },
    ],
    visuals: [
      {
        afterHeading: 'IPX6 vs IPX7: what wholesale buyers should really compare',
        eyebrow: 'Product Visual Match',
        title: 'Different waterproof targets usually map to different retail promises.',
        description:
          'Use a more immersion-ready product direction for poolside and water-sport channels, and a splash-oriented direction for broader outdoor retail and promotional programs.',
        images: [
          {
            src: '/images/news/g31-outdoor.webp',
            alt: 'Outdoor waterproof bluetooth speaker product view for IPX6-oriented wholesale programs',
            caption: 'G31-style direction: stronger fit for rain, splash, patio, and outdoor general-use positioning.',
          },
          {
            src: '/images/news/g34-ipx7.webp',
            alt: 'IPX7 waterproof bluetooth speaker product view for poolside and immersion-resistant wholesale programs',
            caption: 'G34-style direction: better for poolside, resort, boating, and IPX7-led sales positioning.',
          },
        ],
      },
      {
        afterHeading: 'How to choose the right waterproof speaker for your market',
        eyebrow: 'Channel Positioning',
        title: 'Retail context changes what “the right waterproof speaker” actually means.',
        description:
          'Compact, lifestyle-led SKUs work better for travel, gifting, and shelf-driven channels, while bulkier outdoor models may fit functional performance programs better.',
        images: [
          {
            src: '/images/news/g23-compact.webp',
            alt: 'Compact portable waterproof bluetooth speaker for travel and retail gifting channels',
            caption: 'A compact portable format can support travel speaker, gifting, and premium lifestyle retail programs.',
          },
        ],
      },
      {
        afterHeading: 'Feature checklist for wholesale waterproof Bluetooth speakers',
        eyebrow: 'Specification Review',
        title: 'Use product visuals to verify the spec sheet against the real industrial design.',
        description:
          'A checklist is stronger when it is tied to the actual structure: port cover placement, shell seams, buttons, and packaging footprint all affect final sourcing decisions.',
        images: [
          {
            src: '/images/news/g21-portable.webp',
            alt: 'Portable waterproof bluetooth speaker reference image for checking ports, seams, and packaging readiness',
            caption: 'Review real product structure, not only the quotation sheet, before approving packaging and compliance flow.',
          },
        ],
      },
    ],
  },
};

export function getArticleEnhancement(locale, slug) {
  return articleEnhancements[`${locale}/${slug}`] || null;
}
