export const SUPPORTED_LOCALES = /** @type {const} */ (['en', 'fr', 'vi']);

export const DEFAULT_LOCALE = 'en';

export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

export function getSiteOrigin() {
  return 'https://puxijietech.com';
}

import { cmsMessages } from './i18n.generated.js';

function deepMergeMessages(base, override) {
  if (!override || !Object.keys(override).length) return base;
  const merged = { ...base };
  for (const [localeKey, localeData] of Object.entries(override)) {
    const baseLocale = merged[localeKey] || {};
    merged[localeKey] = deepMergeLocale(baseLocale, localeData);
  }
  return merged;
}

function deepMergeLocale(base, override) {
  const merged = { ...base };
  for (const [key, val] of Object.entries(override)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      merged[key] = deepMergeLocale(base[key] || {}, val);
    } else {
      merged[key] = val;
    }
  }
  return merged;
}

const BASE_MESSAGES = {
  en: {
    siteName: 'Puxijie',
    nav: {
      home: 'Home',
      products: 'Products',
      b2b: 'B2B & Wholesale',
      lab: 'Lab',
      about: 'About Us',
      contact: 'Contact',
      faq: 'FAQ',
    },
    commandSearch: {
      placeholder: 'Search products (e.g. G31, waterproof)…',
      noResults: 'No results found.',
      groupProducts: 'Products',
      groupQuickLinks: 'Quick links',
      browseAll: 'Browse all products',
    },
    faqPage: {
      pageTitle: 'Procurement FAQ (B2B) | Puxijie',
      badge: 'Partner & Wholesale FAQ',
      ctaInquiry: 'Submit an inquiry',
      ctaLab: 'View testing & certifications',
      endUserTitle: 'End-user support',
      endUserDesc:
        'If you are an end-user looking for warranty service or product support, please contact the original seller or retailer where you purchased the product.',
      contactCta: 'Contact Puxijie',
    },
    cta: {
      getQuote: 'Request a quote',
      requestSample: 'Request a sample',
      contactSales: 'Contact sales',
    },
    geo: {
      wechatLabel: 'WeChat ID',
      wechatValue: 'EricH0625',
      responseTime: 'Reply within 24 hours on business days (GMT+8).',
    },
    product: {
      headline: 'Waterproof speaker solutions for brands and distributors',
      keyInfo: 'Key information for buyers',
      downloads: 'Downloads',
      compliance: 'Compliance & testing',
      oem: 'OEM/ODM options',
      moqLead: 'MOQ & lead time',
      inquiry: 'Tell us your target market, quantity, and branding needs.',
    },
    b2bTerms: {
      title: 'Procurement terms (quick view)',
      moqLabel: 'MOQ',
      moqValue: 'Typically from 1,000 pcs per model (single color), varies by program.',
      leadLabel: 'Lead time',
      leadValue: 'Confirmed in quotation based on model, customization, and quantity.',
      paymentLabel: 'Payment',
      paymentValue: 'T/T commonly used. Terms negotiable for qualified partners.',
      incotermsLabel: 'Incoterms',
      incotermsValue: 'EXW / FOB / CIF available depending on destination and logistics.',
      contactLabel: 'Fastest contact',
      contactValue: 'WeChat: EricH0625',
    },
    home: {
      badge: 'OEM/ODM Waterproof Speaker Factory',
      headlineLine1: 'Built for brands,',
      headlineLine2: 'distributors, and',
      headlineEmphasis: ' wholesale programs',
      subhead:
        'Puxijie manufactures waterproof Bluetooth speakers for private label, retail, distribution, and project-based sourcing. Build your line with OEM/ODM flexibility, tested IPX options, and scalable supply.',
      ctaQuote: 'Build My Speaker Line',
      ctaBrowse: 'Explore Models',
      ctaLab: 'View Test Results',
      collectionsTitle: 'Start from proven speaker platforms',
      collectionsDesc:
        'Use existing waterproof and portable Bluetooth speaker models as the base for wholesale selection, private label development, or retailer-ready product programs.',
      categoriesTitle: 'Choose the product direction your channel needs',
      categoriesDesc:
        'Match outdoor waterproof demand, mainstream retail, gifting, and specialty speaker applications before starting OEM/ODM customization.',
    },
    productsPage: {
      allProducts: 'All Products',
      tagline: 'Professional waterproof speakers engineered for extreme conditions',
      showing: 'Showing',
      results: 'results',
      reset: 'Reset',
      filters: 'Filters',
      showingOf: '{shown} of {total} products',
      sidebarCategories: 'Categories',
      sidebarIpx: 'Waterproof rating',
      sidebarIpxNote:
        'Waterproof models are currently available in IPX6 and IPX7 options for different outdoor use cases.',
      emptyCategory: 'No products found in this category.',
      ipxHeavy: 'Heavy splash',
      ipx1m: '1m',
      schemaDescription: 'Puxijie product catalog for OEM/ODM Bluetooth speakers, waterproof portable speakers, private label audio products, wholesale earbuds, MOQ planning, packaging data, and RFQ-ready sourcing.',
    },
    categories: {
      all: 'All products',
      waterproofBt: 'Waterproof Bluetooth speaker',
      normalBt: 'Standard Bluetooth speaker',
      specialty: 'Specialty speaker',
      earbuds: 'Bluetooth earbuds',
      tabAll: 'All',
      tabWaterproof: 'Waterproof',
      tabNormal: 'Standard',
      tabSpecialty: 'Specialty',
      tabEarbuds: 'Earbuds',
    },
    productDetail: {
      keyFeatures: 'Key Features',
      benefits: 'Benefits',
      technicalSpecs: 'Technical Specifications',
      relatedProducts: 'Related Products',
      audio: 'Audio',
      material: 'Material',
      weight: 'Weight',
      dimensions: 'Dimensions',
      waterproofRating: 'Waterproof Rating',
      batteryLife: 'Battery Life',
      construction: 'Construction',
      frequencyRange: 'Frequency Range',
      totalWeight: 'Total Weight',
      lwh: 'L × W × H',
      ipxStandard: 'IPX Standard',
      continuousPlayback: 'Continuous playback',
      buyerSpecTitle: 'Buyer-friendly spec page',
      buyerSpecDesc:
        'Share a single link with distributors/importers. Includes structured data for AI search and procurement.',
      viewModelPage: 'View model page',
      notFound: 'Product not found',
      modelUnavailable: 'This model page is not available.',
      backToProducts: 'Back to Products',
      complianceNote:
        'CE / FCC / RoHS support. Waterproof test reports (if available) are provided in downloads.',
      noDownloads: 'No downloads listed yet.',
      specIp: 'IP rating',
      specBattery: 'Battery',
      specDim: 'Dimensions',
      specWeight: 'Weight',
      depthShort: 'Depth',
    },
    productCard: {
      b2bFitTitle: 'B2B program fit',
      b2bFitDesc: 'Suitable for wholesale selection, private label programs, and project-based sourcing.',
    },
    contactPage: {
      title: 'Contact',
      heroBadge: 'B2B sourcing · OEM/ODM · Wholesale',
      directLabel: 'Direct lines',
      heroTitle: 'Contact our sales team',
      heroDesc:
        'Share your market, target models, and volumes. We support distributors and brands with quotations, samples, compliance packs, and production planning.',
      responseSla: 'Typical first reply within 24 business hours (GMT+8)',
      wechatCardTitle: 'WeChat (fastest for APAC)',
      wechatCardDesc: 'Preferred channel for quick quotes and file exchange.',
      copyWechat: 'Copy WeChat ID',
      copied: 'Copied',
      emailCardTitle: 'Business email',
      phoneCardTitle: 'Phone / WhatsApp',
      hoursCardTitle: 'Office hours',
      hoursValue: 'Monday–Friday · 9:00–18:00 (GMT+8)',
      locationTitle: 'Manufacturing & office',
      mapHint: 'For directions or satellite view, open in Google Maps.',
      quickLinksTitle: 'Quick actions for buyers',
      linkB2bTitle: 'Request a quotation',
      linkB2bDesc: 'MOQ, lead time, Incoterms, and OEM/ODM scope.',
      linkCatalogTitle: 'Download catalog',
      linkCatalogDesc: 'Models, specs, and MOQ (English, no price column).',
      linkFaqTitle: 'Procurement FAQ',
      linkFaqDesc: 'Payment terms, samples, certifications, and logistics.',
      linkLabTitle: 'Lab & certifications',
      linkLabDesc: 'Waterproof test reports and compliance downloads.',
      prepareTitle: 'What to include in your inquiry',
      prepare1: 'Company name, country, and your role (buyer / distributor / brand).',
      prepare2: 'Target models or SKU references, or a short market brief.',
      prepare3: 'Estimated annual volume and first order quantity.',
      prepare4: 'Required certifications (CE, FCC, etc.) and destination market.',
      prepare5: 'Preferred Incoterm (EXW / FOB / CIF) and timeline expectations.',
      consumerNote:
        'End-user warranty: please contact your original retailer or seller. This site is focused on B2B partnerships with brands and distributors.',
      consumerFaqLink: 'Read FAQ',
      businessEmail: 'Business email',
      supportEmail: 'Support email',
      call: 'Call',
      workingHours: 'Working hours',
      openInMaps: 'Open in Google Maps',
    },
    labPage: {
      title: 'Lab',
      heroTitle: 'Puxijie Lab',
      heroDesc:
        'Every speaker is tested to failure, then engineered to exceed those limits. Our lab validates performance claims with measurable data.',
      whyTestTitle: 'Why we test',
      whyTestDesc:
        "Testing is not about meeting minimum standards. It's about understanding failure modes and engineering solutions.",
      simTitle: 'Real-World Simulation',
      simDesc:
        "Lab conditions replicate actual usage scenarios: ocean spray, mountain altitude, shower steam. We test what you'll experience.",
      certTitle: 'Certification compliance',
      certDesc:
        'Products are aligned with IPX7/IPX8, CE, FCC, RoHS. Third-party verification ensures accuracy.',
      improveTitle: 'Continuous improvement',
      improveDesc:
        'Test data drives design iterations. Every lab failure prevents a field failure. We learn, adapt, improve.',
      batteryTitle: 'Battery report',
      batteryDesc:
        'Download battery compliance and test documentation set. Use search to quickly find certificates and reports.',
      waterproofTitle: 'Waterproof reports',
      waterproofDesc: 'Download waterproof verification documents for key models.',
      open: 'Open',
      loading: 'Loading…',
      noMatch: 'No files match your search.',
      searchPlaceholder: 'Search file name…',
    },
    newsPage: {
      title: 'News',
      heroTitle: 'Latest updates from Puxijie',
      heroDesc:
        'Explore company updates, product presentation news, and progress related to OEM/ODM and wholesale support.',
      readNow: 'Read now',
    },
    aboutPage: {
      title: 'About us',
      heroBadge: 'About us',
      heroTitle: 'About Puxijie',
      heroTagline: 'At the forefront of the convergence of technology and music.',
      heroDesc:
        'From product engineering to large-scale manufacturing, Puxijie builds practical speaker solutions for wholesale, OEM/ODM, and long-term business cooperation.',
      heroImageAlt: 'Puxijie waterproof speaker manufacturer — company office reception and front desk',
      storyTitle: 'Brand story',
      story1:
        'Driven by a profound mission to redefine audio experiences, our company has built a legacy over 12 years of relentless innovation. In November 2024, we officially renamed to Puxijie, marking a new chapter in our commitment to delivering uncompromising sound quality in the most demanding environments.',
      story2:
        'Our strength lies in our R&D focus, powered by an elite team composed of seasoned acoustic engineers, electronic experts, and visionary industrial designers. Together, they push the boundaries of innovation, ensuring every product we create stands at the pinnacle of durability, design, and acoustic performance.',
      story3:
        'Operating from our state-of-the-art production base in Wuxuan County, Laibin City, Guangxi Province, we maintain a robust manufacturing capacity exceeding 250,000 units monthly. This scale empowers our global sales network and strategic partnerships, allowing us to bring premium audio solutions to adventurers and professionals worldwide.',
      statYears: '12 Years',
      statYearsLabel: 'of Innovation',
      statCapacity: '250,000+',
      statCapacityLabel: 'Monthly Capacity',
      statGlobal: 'Global',
      statGlobalLabel: 'Sales Network',
      statTeam: 'Elite Team',
      statTeamLabel: 'R&D Experts',
      factoryTitle: 'Factory gallery',
      factoryDesc: 'A quick look at our production floor, equipment, and facility environment.',
      factoryPhotoAlt: 'Puxijie factory manufacturing line — waterproof Bluetooth speaker production photo {n}',
      dialogTitle: 'Factory photo preview',
      openPhotoAria: 'Open factory photo {n}',
      valuesTitle: 'Our Core Values',
      valuesDesc: 'The principles that guide our engineering, design, and business philosophy.',
      valueInnovationTitle: 'Innovation as the soul',
      valueInnovationDesc:
        'We refuse to settle for industry standards. Our engineering team constantly explores new materials, acoustic architectures, and waterproofing techniques to build products that defy expectations.',
      valueQualityTitle: 'Quality first',
      valueQualityDesc:
        'Every speaker undergoes rigorous stress testing. From extreme temperature exposure to deep-water submersion, we ensure absolute reliability before a product reaches your hands.',
      valueCustomerTitle: 'Customer first',
      valueCustomerDesc:
        "Technology is meaningless if it doesn't serve the user. We design our interfaces to be intuitive, our form factors to be ergonomic, and our support to be responsive, ensuring a seamless experience from purchase to daily use.",
      productionTitle: 'Production & Capabilities',
      productionDesc:
        'Located in the heart of Guangxi Province, our advanced manufacturing facility represents the pinnacle of modern audio production. With a monthly capacity exceeding 250,000 units, we maintain strict quality control at scale.',
      prodBullet1: 'State-of-the-art assembly lines',
      prodBullet2: 'Rigorous acoustic testing chambers',
      prodBullet3: 'Advanced waterproofing validation',
      imageProductionAlt: 'Puxijie manufacturing facility — waterproof Bluetooth speaker assembly and QC line',
      globalTitle: 'Global Reach',
      globalDesc:
        "Our products resonate across borders. We've established a robust international presence spanning Europe, America, the Asia-Pacific region, and the Middle East.",
      partnersHeading: 'Trusted Domestic Partners',
      imageGlobalAlt: 'Puxijie factory and team — OEM/ODM waterproof speaker manufacturer environment',
      teamTitle: 'The Minds Behind the Sound',
      teamP1:
        'Hardware is only as good as the people who design it. Our elite R&D division brings together diverse expertise to solve complex engineering challenges.',
      teamP2:
        'From acoustic engineers fine-tuning frequency responses, to electronic experts optimizing battery efficiency, to industrial designers crafting rugged yet elegant exteriors—our team works in perfect harmony.',
      imageTeamAlt: 'Puxijie R&D team — waterproof Bluetooth speaker engineering and industrial design',
      ctaTitle: 'Ready to experience the difference?',
      ctaDesc:
        'Discover our range of professional waterproof speakers or reach out to discuss partnership opportunities.',
      ctaExplore: 'Explore Products',
    },
    helpCenterPage: {
      title: 'Help center',
      badge: 'Support',
      heroTitle: 'Global business network',
      heroDesc:
        "Welcome to Puxijie's business support hub. Get downloads, contact information, and guidance for B2B partnership and wholesale inquiries.",
      tags: ['Wholesale distribution', 'Regional agency', 'OEM/ODM solutions', 'Strategic alliance'],
      consumerTipsTitle: 'Tips for individual customers',
      consumerTipsBody:
        "This site is dedicated to business partnerships and wholesale distribution. If you purchased from retailers or e-commerce platforms, please contact your original purchase channel for warranty and after-sales support.",
      contactsTitle: 'Primary business contacts',
      contactsDesc:
        'For qualified business partners and distributors, our team will help you with OEM/ODM, wholesale programs, and regional cooperation.',
      coverage: 'Global B2B support coverage',
      chinaHq: 'China headquarters',
      suggestedNext: 'Suggested next steps',
      suggestedDesc: "If you're looking for device support, contact our team or review the FAQ.",
      step1Title: 'Contact our support team',
      step1Desc: 'Include model and purchase/invoice details.',
      step1Cta: 'Contact Puxijie',
      step2Title: 'Review common questions',
      step2Desc: 'Check procurement terms, lead time, MOQ, and certifications.',
      step2Cta: 'Go to FAQ',
    },
    catalogPage: {
      title: 'Catalog downloads',
      badge: 'Catalog downloads',
      heroTitle: 'Puxijie 2026 catalog (English, no price)',
      heroDesc:
        'Download the price-free catalog to support B2B sourcing, OEM/ODM planning, and wholesale selection.',
      downloadExcel: 'Download Excel catalog',
      includesLabel: 'Includes:',
      includesValue: 'Models • specifications • key features • MOQ',
      leftTitle: 'Excel catalog download',
      leftBody:
        'File is English and excludes the price column. For official quotations and bulk terms, please contact us.',
      fileLabel: 'File',
      usageLabel: 'Usage',
      usageValue: 'OEM/ODM evaluation, wholesale planning, and model comparison.',
      noteLabel: 'Note',
      noteValuePrefix: 'For warranty, after-sales, and quotations, please use',
      noteValueLink: 'Help center',
      downloadNow: 'Download now',
      previewTitle: 'Model preview',
      previewDesc: 'Search by model name, ID, IPX rating, or MOQ.',
      searchPlaceholder: 'Search (e.g. G34, IPX7, MOQ)',
      batteryLabel: 'Battery',
      viewModel: 'View model details',
      emptyTitle: 'No models match your search.',
      emptyDesc: 'Try searching by model ID (e.g. G34) or IPX rating.',
    },
    sitemapPage: {
      title: 'Sitemap',
      heroTitle: 'Sitemap',
      heroDesc: 'Browse all key pages by category.',
    },
    policies: {
      termsTitle: 'Terms of use',
      privacyTitle: 'Privacy policy',
      warrantyTitle: 'Warranty policy',
      dnsTitle: 'Do not sell/share my data',
      legalNoteEnOnly:
        'Note: This legal page is provided in English for now. If you need a translated version for your region, please contact us.',
    },
    app: {
      loadingTitle: 'Loading…',
      loadingDesc: 'Preparing the page',
      notFoundTitle: '404 - Page not found',
      notFoundDesc: "The page you're looking for doesn't exist.",
      backHome: 'Back to home',
    },
  },
  fr: {
    siteName: 'Puxijie',
    nav: {
      home: 'Accueil',
      products: 'Produits',
      b2b: 'B2B & Grossiste',
      lab: 'Laboratoire',
      about: 'À propos',
      contact: 'Contact',
      faq: 'FAQ',
    },
    commandSearch: {
      placeholder: 'Rechercher un produit (ex. G31, étanche)…',
      noResults: 'Aucun résultat.',
      groupProducts: 'Produits',
      groupQuickLinks: 'Liens rapides',
      browseAll: 'Voir tous les produits',
    },
    faqPage: {
      pageTitle: 'FAQ Achats (B2B) | Puxijie',
      badge: 'FAQ partenaires & grossiste',
      ctaInquiry: 'Envoyer une demande',
      ctaLab: 'Voir essais & certifications',
      endUserTitle: 'Support utilisateur final',
      endUserDesc:
        'Si vous êtes un utilisateur final et recherchez une garantie ou une assistance produit, veuillez contacter le vendeur ou le distributeur auprès duquel vous avez acheté le produit.',
      contactCta: 'Contacter Puxijie',
    },
    cta: {
      getQuote: 'Demander un devis',
      requestSample: 'Demander un échantillon',
      contactSales: 'Contacter le service commercial',
    },
    geo: {
      wechatLabel: 'WeChat',
      wechatValue: 'EricH0625',
      responseTime: 'Réponse sous 24 h les jours ouvrés (GMT+8).',
    },
    product: {
      headline: 'Enceintes étanches pour marques et distributeurs',
      keyInfo: 'Informations clés pour les acheteurs',
      downloads: 'Téléchargements',
      compliance: 'Conformité & tests',
      oem: 'Options OEM/ODM',
      moqLead: 'MOQ & délai',
      inquiry: 'Indiquez votre marché, quantité et besoins de branding.',
    },
    b2bTerms: {
      title: 'Conditions achats (aperçu)',
      moqLabel: 'MOQ',
      moqValue: 'Généralement dès 1 000 pcs par modèle (couleur unique), variable selon le programme.',
      leadLabel: 'Délai',
      leadValue: 'Confirmé lors du devis selon modèle, personnalisation et quantité.',
      paymentLabel: 'Paiement',
      paymentValue: 'T/T (virement) couramment utilisé. Conditions négociables pour partenaires qualifiés.',
      incotermsLabel: 'Incoterms',
      incotermsValue: 'EXW / FOB / CIF selon destination et logistique.',
      contactLabel: 'Contact le plus rapide',
      contactValue: 'WeChat : EricH0625',
    },
    home: {
      badge: 'Fabricant d’enceintes étanches OEM/ODM',
      headlineLine1: 'Conçu pour les marques,',
      headlineLine2: 'les distributeurs et',
      headlineEmphasis: ' les programmes grossistes',
      subhead:
        'Puxijie développe et fabrique des enceintes étanches pour marques, distributeurs et achats projets. Nos programmes combinent flexibilité OEM/ODM, tests d’étanchéité vérifiés et production à grande échelle.',
      ctaQuote: 'Demander un devis',
      ctaBrowse: 'Voir le catalogue produits',
      ctaLab: 'Voir les tests',
      collectionsTitle: 'Collections',
      collectionsDesc:
        'Utilisez nos modèles comme base pour la sélection grossiste, le private label ou la personnalisation selon votre marché.',
      categoriesTitle: 'Catégories produits par marché',
      categoriesDesc:
        'Explorez des catégories dédiées aux besoins d’étanchéité, au retail grand public et aux usages spécialisés.',
    },
    productsPage: {
      allProducts: 'Tous les produits',
      tagline: 'Enceintes étanches professionnelles pour environnements exigeants',
      showing: 'Affichage',
      results: 'résultats',
      reset: 'Réinitialiser',
      filters: 'Filtres',
      showingOf: '{shown} sur {total} produits',
      sidebarCategories: 'Catégories',
      sidebarIpx: 'Indice étanchéité',
      sidebarIpxNote:
        'Les modèles étanches sont disponibles en IPX6 et IPX7 selon les usages extérieurs.',
      emptyCategory: 'Aucun produit dans cette catégorie.',
      ipxHeavy: 'Éclaboussures',
      ipx1m: '1 m',
    },
    categories: {
      all: 'Tous les produits',
      waterproofBt: 'Enceinte Bluetooth étanche',
      normalBt: 'Enceinte Bluetooth standard',
      specialty: 'Enceinte spécialisée',
      earbuds: 'Écouteurs Bluetooth',
      tabAll: 'Tous',
      tabWaterproof: 'Étanche',
      tabNormal: 'Standard',
      tabSpecialty: 'Spécial',
      tabEarbuds: 'Écouteurs',
    },
    productDetail: {
      keyFeatures: 'Points clés',
      benefits: 'Avantages',
      technicalSpecs: 'Spécifications techniques',
      relatedProducts: 'Produits associés',
      audio: 'Audio',
      material: 'Matériau',
      weight: 'Poids',
      dimensions: 'Dimensions',
      waterproofRating: 'Indice étanchéité',
      batteryLife: 'Autonomie',
      construction: 'Construction',
      frequencyRange: 'Plage de fréquences',
      totalWeight: 'Poids total',
      lwh: 'L × l × H',
      ipxStandard: 'Norme IPX',
      continuousPlayback: 'Lecture continue',
      buyerSpecTitle: 'Page fiche acheteur',
      buyerSpecDesc:
        'Partagez un lien unique avec distributeurs/importateurs. Données structurées pour recherche et achats.',
      viewModelPage: 'Voir la page modèle',
      notFound: 'Produit introuvable',
      modelUnavailable: 'Cette page modèle n’est pas disponible.',
      backToProducts: 'Retour aux produits',
      complianceNote:
        'Prise en charge CE / FCC / RoHS. Rapports d’étanchéité (si disponibles) dans les téléchargements.',
      noDownloads: 'Aucun téléchargement pour le moment.',
      specIp: 'Indice IP',
      specBattery: 'Batterie',
      specDim: 'Dimensions',
      specWeight: 'Poids',
      depthShort: 'Profondeur / étanchéité',
    },
    productCard: {
      b2bFitTitle: 'Adéquation programme B2B',
      b2bFitDesc: 'Pour sélection grossiste, private label et achats projet.',
    },
    contactPage: {
      title: 'Contact',
      heroBadge: 'Sourcing B2B · OEM/ODM · Grossiste',
      directLabel: 'Canaux directs',
      heroTitle: 'Contacter le service commercial',
      heroDesc:
        'Indiquez votre marché, modèles cibles et volumes. Nous accompagnons distributeurs et marques : devis, échantillons, dossiers conformité et planification de production.',
      responseSla: 'Première réponse sous 24 h ouvrées (GMT+8), en général',
      wechatCardTitle: 'WeChat (le plus rapide pour l’APAC)',
      wechatCardDesc: 'Canal privilégié pour devis rapides et échange de fichiers.',
      copyWechat: 'Copier l’ID WeChat',
      copied: 'Copié',
      emailCardTitle: 'Email commercial',
      phoneCardTitle: 'Téléphone / WhatsApp',
      hoursCardTitle: 'Horaires',
      hoursValue: 'Lun–Ven · 9h00–18h00 (GMT+8)',
      locationTitle: 'Site industriel & bureau',
      mapHint: 'Pour l’itinéraire ou la vue satellite, ouvrez dans Google Maps.',
      quickLinksTitle: 'Actions rapides pour acheteurs',
      linkB2bTitle: 'Demander un devis',
      linkB2bDesc: 'MOQ, délais, Incoterms et périmètre OEM/ODM.',
      linkCatalogTitle: 'Télécharger le catalogue',
      linkCatalogDesc: 'Modèles, specs et MOQ (anglais, sans colonne prix).',
      linkFaqTitle: 'FAQ achats',
      linkFaqDesc: 'Paiement, échantillons, certifications et logistique.',
      linkLabTitle: 'Labo & certifications',
      linkLabDesc: 'Rapports d’étanchéité et téléchargements conformité.',
      prepareTitle: 'À inclure dans votre premier message',
      prepare1: 'Société, pays et fonction (acheteur / distributeur / marque).',
      prepare2: 'Modèles cibles ou références SKU, ou un brief marché.',
      prepare3: 'Volume annuel estimé et quantité de première commande.',
      prepare4: 'Certifications requises (CE, FCC, etc.) et marché destination.',
      prepare5: 'Incoterm souhaité (EXW / FOB / CIF) et calendrier attendu.',
      consumerNote:
        'Garantie grand public : contactez le revendeur où vous avez acheté. Ce site est orienté partenariats B2B avec marques et distributeurs.',
      consumerFaqLink: 'Voir la FAQ',
      businessEmail: 'Email commercial',
      supportEmail: 'Email support',
      call: 'Appeler',
      workingHours: 'Horaires',
      openInMaps: 'Ouvrir dans Google Maps',
    },
    labPage: {
      title: 'Laboratoire',
      heroTitle: 'Puxijie Lab',
      heroDesc:
        'Chaque enceinte est testée jusqu’à la limite, puis améliorée. Notre laboratoire valide les performances avec des données mesurables.',
      whyTestTitle: 'Pourquoi tester',
      whyTestDesc:
        "Tester, ce n’est pas atteindre le minimum : c’est comprendre les modes de défaillance et concevoir des solutions.",
      simTitle: 'Simulation terrain',
      simDesc:
        'Brouillard salin, altitude, vapeur : nous reproduisons des conditions réelles d’usage.',
      certTitle: 'Conformité & certifications',
      certDesc:
        'Alignement IPX7/IPX8, CE, FCC, RoHS. Vérification tierce pour garantir la fiabilité.',
      improveTitle: 'Amélioration continue',
      improveDesc:
        'Les données d’essai alimentent l’itération produit. Chaque échec en labo évite un échec terrain.',
      batteryTitle: 'Rapport batterie',
      batteryDesc:
        'Téléchargez la documentation batterie. Utilisez la recherche pour trouver rapidement certificats et rapports.',
      waterproofTitle: 'Rapports étanchéité',
      waterproofDesc: 'Téléchargez les rapports d’étanchéité pour les modèles clés.',
      open: 'Ouvrir',
      loading: 'Chargement…',
      noMatch: 'Aucun fichier ne correspond à votre recherche.',
      searchPlaceholder: 'Rechercher un fichier…',
    },
    newsPage: {
      title: 'Actualités',
      heroTitle: 'Dernières actualités Puxijie',
      heroDesc:
        'Actualités entreprise, présentations produits et avancées OEM/ODM & grossiste.',
      readNow: 'Lire',
    },
    aboutPage: {
      title: 'À propos',
      heroBadge: 'À propos',
      heroTitle: 'À propos de Puxijie',
      heroTagline: 'À la croisée de la technologie et de la musique.',
      heroDesc:
        'De l’ingénierie à la fabrication à grande échelle, Puxijie fournit des solutions d’enceintes pour grossiste, OEM/ODM et partenariats long terme.',
      heroImageAlt: 'Accueil et réception des bureaux Puxijie',
      storyTitle: 'Histoire de la marque',
      story1:
        "Portés par la mission de redéfinir l’expérience audio, nous avons bâti 12 ans d’innovation continue. En novembre 2024, nous avons officiellement pris le nom Puxijie, ouvrant un nouveau chapitre pour offrir un son exigeant dans les environnements les plus difficiles.",
      story2:
        "Notre force : la R&D. Une équipe d’ingénieurs acoustiques, d’experts électroniques et de designers industriels repousse les limites, afin que chaque produit atteigne un niveau élevé de durabilité, de design et de performance sonore.",
      story3:
        "Depuis notre base de production à Wuxuan (Laibin, Guangxi), nous dépassons 250 000 unités par mois. Cette capacité soutient notre réseau mondial et nos partenariats, pour livrer des solutions audio premium aux aventuriers et professionnels.",
      statYears: '12 ans',
      statYearsLabel: "d'innovation",
      statCapacity: '250 000+',
      statCapacityLabel: 'Capacité mensuelle',
      statGlobal: 'Mondial',
      statGlobalLabel: 'Réseau commercial',
      statTeam: 'Équipe d’élite',
      statTeamLabel: 'Experts R&D',
      factoryTitle: 'Galerie usine',
      factoryDesc: 'Aperçu de la production, des équipements et de l’environnement.',
      factoryPhotoAlt: 'Photo d’atelier {n}',
      dialogTitle: 'Aperçu photo usine',
      openPhotoAria: 'Ouvrir la photo d’usine {n}',
      valuesTitle: 'Nos valeurs',
      valuesDesc: 'Les principes qui guident notre ingénierie, notre design et notre vision business.',
      valueInnovationTitle: 'L’innovation au cœur',
      valueInnovationDesc:
        'Nous ne nous contentons pas des standards du secteur. Notre équipe explore en continu nouveaux matériaux, architectures acoustiques et solutions d’étanchéité pour créer des produits qui surprennent.',
      valueQualityTitle: 'La qualité d’abord',
      valueQualityDesc:
        'Chaque enceinte subit des tests de contrainte sévères. Des températures extrêmes à l’immersion profonde, nous garantissons la fiabilité avant livraison.',
      valueCustomerTitle: 'Le client d’abord',
      valueCustomerDesc:
        'La technologie n’a de sens que si elle sert l’utilisateur. Nous visons des interfaces intuitives, des formes ergonomiques et un support réactif, pour une expérience fluide du premier contact à l’usage quotidien.',
      productionTitle: 'Production & capacités',
      productionDesc:
        'Située au Guangxi, notre usine moderne incarne une production audio exigeante. Avec plus de 250 000 unités par mois, nous maîtrisons la qualité à grande échelle.',
      prodBullet1: 'Lignes d’assemblage de pointe',
      prodBullet2: 'Chambres d’essais acoustiques rigoureuses',
      prodBullet3: 'Validation avancée de l’étanchéité',
      imageProductionAlt: 'Ligne de production et atelier de fabrication',
      globalTitle: 'Présence internationale',
      globalDesc:
        'Nos produits sont présents sur plusieurs continents : Europe, Amériques, Asie-Pacifique et Moyen-Orient.',
      partnersHeading: 'Partenaires nationaux de confiance',
      imageGlobalAlt: 'Site et équipe Puxijie',
      teamTitle: 'Les talents derrière le son',
      teamP1:
        'Le matériel n’est rien sans les équipes qui le conçoivent. Notre division R&D réunit des expertises complémentaires pour relever les défis techniques.',
      teamP2:
        'Des ingénieurs acoustiques aux spécialistes électronique et designers industriels, nos équipes collaborent pour concilier performance, autonomie et design.',
      imageTeamAlt: 'Équipe ingénierie et design en collaboration',
      ctaTitle: 'Prêt à découvrir la différence ?',
      ctaDesc:
        'Découvrez nos enceintes étanches professionnelles ou contactez-nous pour un partenariat.',
      ctaExplore: 'Voir les produits',
    },
    helpCenterPage: {
      title: 'Centre d’aide',
      badge: 'Support',
      heroTitle: 'Réseau commercial mondial',
      heroDesc:
        'Bienvenue sur le hub support B2B de Puxijie : téléchargements, contacts et conseils pour partenariats et distribution.',
      tags: ['Distribution', 'Agence régionale', 'Solutions OEM/ODM', 'Alliance stratégique'],
      consumerTipsTitle: 'Conseils pour particuliers',
      consumerTipsBody:
        "Ce site est dédié au B2B et à la distribution. Si vous avez acheté via un revendeur ou une plateforme, contactez votre canal d’achat pour la garantie et le SAV.",
      contactsTitle: 'Contacts commerciaux principaux',
      contactsDesc:
        'Pour partenaires et distributeurs qualifiés : OEM/ODM, programmes wholesale et coopération régionale.',
      coverage: 'Couverture support B2B mondial',
      chinaHq: 'Siège Chine',
      suggestedNext: 'Étapes recommandées',
      suggestedDesc: "Pour un support produit, contactez-nous ou consultez la FAQ.",
      step1Title: 'Contacter notre support',
      step1Desc: 'Indiquez le modèle et les détails d’achat/facture.',
      step1Cta: 'Contacter Puxijie',
      step2Title: 'Consulter les questions fréquentes',
      step2Desc: 'MOQ, délais, certifications et conditions d’achat.',
      step2Cta: 'Aller à la FAQ',
    },
    catalogPage: {
      title: 'Téléchargements catalogue',
      badge: 'Téléchargements catalogue',
      heroTitle: 'Catalogue 2026 Puxijie (anglais, sans prix)',
      heroDesc:
        'Téléchargez le catalogue sans prix pour le sourcing B2B, la planification OEM/ODM et la sélection wholesale.',
      downloadExcel: 'Télécharger le catalogue Excel',
      includesLabel: 'Inclus :',
      includesValue: 'Modèles • spécifications • points forts • MOQ',
      leftTitle: 'Téléchargement du catalogue Excel',
      leftBody:
        'Fichier en anglais, sans colonne prix. Pour devis officiels et conditions de volume, contactez-nous.',
      fileLabel: 'Fichier',
      usageLabel: 'Usage',
      usageValue: 'Évaluation OEM/ODM, planification wholesale, comparaison des modèles.',
      noteLabel: 'Note',
      noteValuePrefix: 'Pour la garantie, le SAV et les devis, utilisez',
      noteValueLink: 'Centre d’aide',
      downloadNow: 'Télécharger',
      previewTitle: 'Aperçu des modèles',
      previewDesc: 'Recherchez par nom, ID, indice IPX ou MOQ.',
      searchPlaceholder: 'Rechercher (ex. G34, IPX7, MOQ)',
      batteryLabel: 'Batterie',
      viewModel: 'Voir le détail du modèle',
      emptyTitle: 'Aucun modèle ne correspond.',
      emptyDesc: 'Essayez un ID (ex. G34) ou un indice IPX.',
    },
    sitemapPage: {
      title: 'Plan du site',
      heroTitle: 'Plan du site',
      heroDesc: 'Parcourez toutes les pages clés par catégorie.',
    },
    policies: {
      termsTitle: "Conditions d’utilisation",
      privacyTitle: 'Politique de confidentialité',
      warrantyTitle: 'Politique de garantie',
      dnsTitle: 'Ne pas vendre/partager mes données',
      legalNoteEnOnly:
        'Note : cette page juridique est actuellement fournie en anglais. Pour une version traduite, contactez-nous.',
    },
    app: {
      loadingTitle: 'Chargement…',
      loadingDesc: 'Préparation de la page',
      notFoundTitle: '404 - Page introuvable',
      notFoundDesc: "La page demandée n’existe pas.",
      backHome: 'Retour accueil',
    },
  },
  vi: {
    siteName: 'Puxijie',
    nav: {
      home: 'Trang chủ',
      products: 'Sản phẩm',
      b2b: 'B2B & Bán sỉ',
      lab: 'Phòng lab',
      about: 'Về chúng tôi',
      contact: 'Liên hệ',
      faq: 'FAQ',
    },
    commandSearch: {
      placeholder: 'Tìm sản phẩm (vd. G31, chống nước)…',
      noResults: 'Không có kết quả.',
      groupProducts: 'Sản phẩm',
      groupQuickLinks: 'Liên kết nhanh',
      browseAll: 'Xem tất cả sản phẩm',
    },
    faqPage: {
      pageTitle: 'FAQ Mua hàng (B2B) | Puxijie',
      badge: 'FAQ đối tác & bán sỉ',
      ctaInquiry: 'Gửi yêu cầu',
      ctaLab: 'Xem kiểm thử & chứng nhận',
      endUserTitle: 'Hỗ trợ người dùng cuối',
      endUserDesc:
        'Nếu bạn là người dùng cuối và cần bảo hành hoặc hỗ trợ sản phẩm, vui lòng liên hệ nhà bán lẻ hoặc đại lý nơi bạn đã mua sản phẩm.',
      contactCta: 'Liên hệ Puxijie',
    },
    cta: {
      getQuote: 'Yêu cầu báo giá',
      requestSample: 'Yêu cầu mẫu',
      contactSales: 'Liên hệ sales',
    },
    geo: {
      wechatLabel: 'WeChat',
      wechatValue: 'EricH0625',
      responseTime: 'Phản hồi trong 24 giờ ngày làm việc (GMT+8).',
    },
    product: {
      headline: 'Giải pháp loa chống nước cho thương hiệu & nhà phân phối',
      keyInfo: 'Thông tin chính cho nhà mua hàng',
      downloads: 'Tải xuống',
      compliance: 'Tuân thủ & kiểm định',
      oem: 'Tuỳ chọn OEM/ODM',
      moqLead: 'MOQ & lead time',
      inquiry: 'Cho chúng tôi biết thị trường, số lượng và yêu cầu thương hiệu.',
    },
    b2bTerms: {
      title: 'Điều khoản mua hàng (tóm tắt)',
      moqLabel: 'MOQ',
      moqValue: 'Thường từ 1.000 pcs mỗi model (một màu), có thể thay đổi theo chương trình.',
      leadLabel: 'Lead time',
      leadValue: 'Xác nhận trong báo giá theo model, tuỳ chỉnh và số lượng.',
      paymentLabel: 'Thanh toán',
      paymentValue: 'Thường dùng T/T. Có thể thương lượng cho đối tác đủ điều kiện.',
      incotermsLabel: 'Incoterms',
      incotermsValue: 'EXW / FOB / CIF tuỳ điểm đến và logistics.',
      contactLabel: 'Liên hệ nhanh nhất',
      contactValue: 'WeChat: EricH0625',
    },
    home: {
      badge: 'Nhà sản xuất loa chống nước OEM/ODM',
      headlineLine1: 'Dành cho thương hiệu,',
      headlineLine2: 'nhà phân phối và',
      headlineEmphasis: ' chương trình bán sỉ',
      subhead:
        'Puxijie phát triển và sản xuất loa chống nước cho private label, phân phối và dự án. Kết hợp linh hoạt OEM/ODM, kiểm định chống nước và năng lực sản xuất quy mô lớn.',
      ctaQuote: 'Yêu cầu báo giá',
      ctaBrowse: 'Xem danh mục sản phẩm',
      ctaLab: 'Xem kết quả kiểm định',
      collectionsTitle: 'Bộ sưu tập',
      collectionsDesc:
        'Dùng model sẵn có để chọn hàng bán sỉ, làm private label hoặc tuỳ chỉnh theo thị trường.',
      categoriesTitle: 'Danh mục theo nhu cầu thị trường',
      categoriesDesc:
        'Khám phá các dòng cho nhu cầu chống nước, retail phổ thông và ứng dụng chuyên biệt.',
    },
    productsPage: {
      allProducts: 'Tất cả sản phẩm',
      tagline: 'Loa chống nước chuyên nghiệp cho môi trường khắc nghiệt',
      showing: 'Hiển thị',
      results: 'kết quả',
      reset: 'Đặt lại',
      filters: 'Bộ lọc',
      showingOf: '{shown} / {total} sản phẩm',
      sidebarCategories: 'Danh mục',
      sidebarIpx: 'Chống nước (IPX)',
      sidebarIpxNote:
        'Các model chống nước hiện có IPX6 và IPX7 cho từng kịch bản ngoài trời.',
      emptyCategory: 'Không có sản phẩm trong danh mục này.',
      ipxHeavy: 'Bắn nước mạnh',
      ipx1m: '1 m',
    },
    categories: {
      all: 'Tất cả sản phẩm',
      waterproofBt: 'Loa Bluetooth chống nước',
      normalBt: 'Loa Bluetooth thông thường',
      specialty: 'Loa đặc biệt',
      earbuds: 'Tai nghe Bluetooth',
      tabAll: 'Tất cả',
      tabWaterproof: 'Chống nước',
      tabNormal: 'Thường',
      tabSpecialty: 'Đặc biệt',
      tabEarbuds: 'Tai nghe',
    },
    productDetail: {
      keyFeatures: 'Điểm nổi bật',
      benefits: 'Lợi ích',
      technicalSpecs: 'Thông số kỹ thuật',
      relatedProducts: 'Sản phẩm liên quan',
      audio: 'Âm thanh',
      material: 'Vật liệu',
      weight: 'Trọng lượng',
      dimensions: 'Kích thước',
      waterproofRating: 'Chuẩn chống nước',
      batteryLife: 'Thời lượng pin',
      construction: 'Cấu tạo',
      frequencyRange: 'Dải tần',
      totalWeight: 'Tổng trọng lượng',
      lwh: 'D × R × C',
      ipxStandard: 'Chuẩn IPX',
      continuousPlayback: 'Phát liên tục',
      buyerSpecTitle: 'Trang thông số cho người mua',
      buyerSpecDesc:
        'Chia sẻ một liên kết với nhà phân phối/nhập khẩu. Có dữ liệu có cấu trúc cho tìm kiếm và mua hàng.',
      viewModelPage: 'Xem trang model',
      notFound: 'Không tìm thấy sản phẩm',
      modelUnavailable: 'Trang model này chưa có sẵn.',
      backToProducts: 'Quay lại danh sách sản phẩm',
      complianceNote:
        'Hỗ trợ CE / FCC / RoHS. Báo cáo thử nước (nếu có) nằm trong phần tải xuống.',
      noDownloads: 'Chưa có tài liệu tải xuống.',
      specIp: 'Chuẩn IP',
      specBattery: 'Pin',
      specDim: 'Kích thước',
      specWeight: 'Trọng lượng',
      depthShort: 'Độ sâu / chống nước',
    },
    productCard: {
      b2bFitTitle: 'Phù hợp chương trình B2B',
      b2bFitDesc: 'Phù hợp chọn hàng bán sỉ, private label và mua theo dự án.',
    },
    contactPage: {
      title: 'Liên hệ',
      heroBadge: 'Sourcing B2B · OEM/ODM · Bán sỉ',
      directLabel: 'Kênh liên hệ trực tiếp',
      heroTitle: 'Liên hệ đội sales',
      heroDesc:
        'Cho biết thị trường, model mục tiêu và sản lượng. Chúng tôi hỗ trợ nhà phân phối và thương hiệu: báo giá, mẫu, bộ chứng từ tuân thủ và kế hoạch sản xuất.',
      responseSla: 'Thường phản hồi lần đầu trong 24 giờ ngày làm việc (GMT+8)',
      wechatCardTitle: 'WeChat (nhanh nhất cho APAC)',
      wechatCardDesc: 'Kênh ưu tiên để báo giá nhanh và trao đổi file.',
      copyWechat: 'Sao chép WeChat ID',
      copied: 'Đã sao chép',
      emailCardTitle: 'Email kinh doanh',
      phoneCardTitle: 'Điện thoại / WhatsApp',
      hoursCardTitle: 'Giờ làm việc',
      hoursValue: 'Thứ Hai–Thứ Sáu · 9:00–18:00 (GMT+8)',
      locationTitle: 'Nhà máy & văn phòng',
      mapHint: 'Để chỉ đường hoặc xem vệ tinh, mở trên Google Maps.',
      quickLinksTitle: 'Thao tác nhanh cho nhà mua hàng',
      linkB2bTitle: 'Yêu cầu báo giá',
      linkB2bDesc: 'MOQ, lead time, Incoterms và phạm vi OEM/ODM.',
      linkCatalogTitle: 'Tải catalog',
      linkCatalogDesc: 'Model, thông số và MOQ (tiếng Anh, không cột giá).',
      linkFaqTitle: 'FAQ mua hàng',
      linkFaqDesc: 'Thanh toán, mẫu, chứng nhận và logistics.',
      linkLabTitle: 'Lab & chứng nhận',
      linkLabDesc: 'Báo cáo chống nước và tài liệu tuân thủ.',
      prepareTitle: 'Nên ghi trong email / tin nhắn đầu tiên',
      prepare1: 'Tên công ty, quốc gia và vai trò (buyer / distributor / brand).',
      prepare2: 'Model hoặc SKU mục tiêu, hoặc mô tả ngắn thị trường.',
      prepare3: 'Sản lượng dự kiến theo năm và số lượng lô đầu.',
      prepare4: 'Chứng nhận cần có (CE, FCC…) và thị trường đích.',
      prepare5: 'Incoterm mong muốn (EXW / FOB / CIF) và kỳ vọng timeline.',
      consumerNote:
        'Bảo hành người dùng cuối: vui lòng liên hệ nơi bạn đã mua hàng. Trang này tập trung hợp tác B2B với thương hiệu và nhà phân phối.',
      consumerFaqLink: 'Xem FAQ',
      businessEmail: 'Email kinh doanh',
      supportEmail: 'Email hỗ trợ',
      call: 'Gọi',
      workingHours: 'Giờ làm việc',
      openInMaps: 'Mở trên Google Maps',
    },
    labPage: {
      title: 'Phòng lab',
      heroTitle: 'Puxijie Lab',
      heroDesc:
        'Mỗi loa được test đến giới hạn rồi cải tiến vượt chuẩn. Lab của chúng tôi xác thực hiệu năng bằng dữ liệu.',
      whyTestTitle: 'Vì sao phải test',
      whyTestDesc:
        'Test không chỉ để đạt mức tối thiểu, mà để hiểu điểm hỏng và thiết kế giải pháp.',
      simTitle: 'Mô phỏng thực tế',
      simDesc:
        'Nước biển, độ cao, hơi nước… mô phỏng tình huống sử dụng thật.',
      certTitle: 'Tuân thủ & chứng nhận',
      certDesc:
        'IPX7/IPX8, CE, FCC, RoHS. Có kiểm chứng bên thứ ba.',
      improveTitle: 'Cải tiến liên tục',
      improveDesc:
        'Dữ liệu test giúp cải tiến thiết kế. Mỗi lỗi trong lab giúp tránh lỗi ngoài thực tế.',
      batteryTitle: 'Báo cáo pin',
      batteryDesc:
        'Tải bộ tài liệu pin. Dùng tìm kiếm để tìm nhanh chứng chỉ và báo cáo.',
      waterproofTitle: 'Báo cáo chống nước',
      waterproofDesc: 'Tải báo cáo chống nước cho các model chính.',
      open: 'Mở',
      loading: 'Đang tải…',
      noMatch: 'Không có file phù hợp.',
      searchPlaceholder: 'Tìm tên file…',
    },
    newsPage: {
      title: 'Tin tức',
      heroTitle: 'Cập nhật mới nhất từ Puxijie',
      heroDesc:
        'Tin doanh nghiệp, trình bày sản phẩm và tiến độ liên quan OEM/ODM & bán sỉ.',
      readNow: 'Xem',
    },
    aboutPage: {
      title: 'Về chúng tôi',
      heroBadge: 'Về chúng tôi',
      heroTitle: 'Về Puxijie',
      heroTagline: 'Giao thoa giữa công nghệ và âm nhạc.',
      heroDesc:
        'Từ R&D đến sản xuất quy mô lớn, Puxijie cung cấp giải pháp loa cho bán sỉ, OEM/ODM và hợp tác dài hạn.',
      heroImageAlt: 'Lễ tân và khu văn phòng Puxijie',
      storyTitle: 'Câu chuyện thương hiệu',
      story1:
        'Với sứ mệnh nâng tầm trải nghiệm âm thanh, chúng tôi đã xây dựng 12 năm đổi mới liên tục. Tháng 11/2024, công ty chính thức đổi tên thành Puxijie, mở ra chương mới cho cam kết âm thanh chất lượng cao trong những môi trường khắc nghiệt.',
      story2:
        'Thế mạnh của chúng tôi là R&D, với đội ngũ kỹ sư âm học, chuyên gia điện tử và nhà thiết kế công nghiệp giàu kinh nghiệm. Họ liên tục cải tiến để mỗi sản phẩm đạt chuẩn bền bỉ, thiết kế đẹp và hiệu năng âm thanh tốt.',
      story3:
        'Vận hành tại cơ sở sản xuất hiện đại ở huyện Wuxuan, thành phố Laibin, Quảng Tây, năng lực sản xuất vượt 250.000 chiếc/tháng. Quy mô này giúp chúng tôi phục vụ mạng lưới toàn cầu và đối tác chiến lược.',
      statYears: '12 năm',
      statYearsLabel: 'Đổi mới',
      statCapacity: '250.000+',
      statCapacityLabel: 'Năng lực/tháng',
      statGlobal: 'Toàn cầu',
      statGlobalLabel: 'Mạng lưới bán hàng',
      statTeam: 'Đội ngũ R&D',
      statTeamLabel: 'Chuyên gia',
      factoryTitle: 'Thư viện nhà máy',
      factoryDesc: 'Xem nhanh dây chuyền, thiết bị và môi trường nhà xưởng.',
      factoryPhotoAlt: 'Ảnh nhà máy {n}',
      dialogTitle: 'Xem ảnh nhà máy',
      openPhotoAria: 'Mở ảnh nhà máy {n}',
      valuesTitle: 'Giá trị cốt lõi',
      valuesDesc: 'Nguyên tắc định hướng kỹ thuật, thiết kế và triết lý kinh doanh của chúng tôi.',
      valueInnovationTitle: 'Đổi mới là linh hồn',
      valueInnovationDesc:
        'Chúng tôi không chấp nhận dừng ở chuẩn ngành. Đội ngũ kỹ thuật không ngừng thử vật liệu mới, kiến trúc âm thanh và giải pháp chống nước để tạo sản phẩm vượt kỳ vọng.',
      valueQualityTitle: 'Chất lượng lên trước',
      valueQualityDesc:
        'Mỗi loa đều qua kiểm tra stress nghiêm ngặt. Từ nhiệt độ cực đoan đến ngâm sâu dưới nước, chúng tôi đảm bảo độ tin cậy trước khi giao hàng.',
      valueCustomerTitle: 'Khách hàng lên trước',
      valueCustomerDesc:
        'Công nghệ chỉ có ý nghĩa khi phục vụ người dùng. Chúng tôi thiết kế giao diện trực quan, kiểu dáng cầm nắm thoải mái và hỗ trợ kịp thời, để trải nghiệm suôn sẻ từ lúc mua đến sử dụng hằng ngày.',
      productionTitle: 'Sản xuất & năng lực',
      productionDesc:
        'Đặt tại Quảng Tây, nhà máy hiện đại của chúng tôi đại diện cho sản xuất âm thanh quy mô lớn. Với hơn 250.000 sản phẩm/tháng, chúng tôi duy trì kiểm soát chất lượng chặt chẽ.',
      prodBullet1: 'Dây chuyền lắp ráp hiện đại',
      prodBullet2: 'Buồng thử âm học nghiêm ngặt',
      prodBullet3: 'Kiểm định chống nước tiên tiến',
      imageProductionAlt: 'Nhà máy và dây chuyền sản xuất',
      globalTitle: 'Hiện diện toàn cầu',
      globalDesc:
        'Sản phẩm của chúng tôi có mặt ở nhiều thị trường: châu Âu, châu Mỹ, châu Á–Thái Bình Dương và Trung Đông.',
      partnersHeading: 'Đối tác trong nước',
      imageGlobalAlt: 'Cơ sở và môi trường làm việc Puxijie',
      teamTitle: 'Con người đằng sau âm thanh',
      teamP1:
        'Phần cứng chỉ tốt khi đội ngũ thiết kế đủ mạnh. Bộ phận R&D tập hợp chuyên môn đa dạng để giải quyết bài toán kỹ thuật phức tạp.',
      teamP2:
        'Từ kỹ sư âm học tinh chỉnh dải tần, chuyên gia tối ưu pin, đến designer tạo nên vỏ máy bền và đẹp — đội ngũ phối hợp chặt chẽ.',
      imageTeamAlt: 'Đội ngũ kỹ thuật và thiết kế làm việc cùng nhau',
      ctaTitle: 'Sẵn sàng trải nghiệm sự khác biệt?',
      ctaDesc:
        'Khám phá dòng loa chống nước chuyên nghiệp hoặc liên hệ để trao đổi cơ hội hợp tác.',
      ctaExplore: 'Xem sản phẩm',
    },
    helpCenterPage: {
      title: 'Trung tâm hỗ trợ',
      badge: 'Hỗ trợ',
      heroTitle: 'Mạng lưới kinh doanh toàn cầu',
      heroDesc:
        'Chào mừng đến hub hỗ trợ B2B của Puxijie: tải tài liệu, thông tin liên hệ và hướng dẫn hợp tác/bán sỉ.',
      tags: ['Phân phối sỉ', 'Đại lý khu vực', 'Giải pháp OEM/ODM', 'Liên minh chiến lược'],
      consumerTipsTitle: 'Lưu ý cho khách lẻ',
      consumerTipsBody:
        'Website này tập trung B2B và bán sỉ. Nếu bạn mua qua cửa hàng hoặc sàn TMĐT, vui lòng liên hệ kênh mua ban đầu để được bảo hành và hỗ trợ.',
      contactsTitle: 'Liên hệ kinh doanh chính',
      contactsDesc:
        'Dành cho đối tác/distributor đủ điều kiện: OEM/ODM, chương trình bán sỉ và hợp tác khu vực.',
      coverage: 'Phạm vi hỗ trợ B2B toàn cầu',
      chinaHq: 'Trụ sở Trung Quốc',
      suggestedNext: 'Gợi ý bước tiếp theo',
      suggestedDesc: 'Nếu cần hỗ trợ sản phẩm, hãy liên hệ hoặc xem FAQ.',
      step1Title: 'Liên hệ đội hỗ trợ',
      step1Desc: 'Ghi rõ model và thông tin mua hàng/hóa đơn.',
      step1Cta: 'Liên hệ Puxijie',
      step2Title: 'Xem câu hỏi thường gặp',
      step2Desc: 'MOQ, lead time, chứng nhận và điều khoản mua hàng.',
      step2Cta: 'Tới FAQ',
    },
    catalogPage: {
      title: 'Tải catalog',
      badge: 'Tải catalog',
      heroTitle: 'Catalog Puxijie 2026 (tiếng Anh, không giá)',
      heroDesc:
        'Tải catalog không giá để phục vụ sourcing B2B, lập kế hoạch OEM/ODM và chọn hàng bán sỉ.',
      downloadExcel: 'Tải catalog Excel',
      includesLabel: 'Bao gồm:',
      includesValue: 'Model • thông số • tính năng • MOQ',
      leftTitle: 'Tải catalog Excel',
      leftBody:
        'File tiếng Anh và không có cột giá. Để nhận báo giá chính thức và điều khoản số lượng, vui lòng liên hệ.',
      fileLabel: 'Tệp',
      usageLabel: 'Mục đích',
      usageValue: 'Đánh giá OEM/ODM, lập kế hoạch bán sỉ, so sánh model.',
      noteLabel: 'Ghi chú',
      noteValuePrefix: 'Về bảo hành, hậu mãi và báo giá, vui lòng dùng',
      noteValueLink: 'Trung tâm hỗ trợ',
      downloadNow: 'Tải ngay',
      previewTitle: 'Xem nhanh model',
      previewDesc: 'Tìm theo tên model, ID, IPX hoặc MOQ.',
      searchPlaceholder: 'Tìm (vd. G34, IPX7, MOQ)',
      batteryLabel: 'Pin',
      viewModel: 'Xem chi tiết model',
      emptyTitle: 'Không tìm thấy model phù hợp.',
      emptyDesc: 'Thử tìm theo ID (vd. G34) hoặc IPX.',
    },
    sitemapPage: {
      title: 'Sơ đồ trang',
      heroTitle: 'Sơ đồ trang',
      heroDesc: 'Duyệt tất cả trang chính theo danh mục.',
    },
    policies: {
      termsTitle: 'Điều khoản sử dụng',
      privacyTitle: 'Chính sách quyền riêng tư',
      warrantyTitle: 'Chính sách bảo hành',
      dnsTitle: 'Không bán/chia sẻ dữ liệu của tôi',
      legalNoteEnOnly:
        'Lưu ý: trang pháp lý hiện tạm thời cung cấp bằng tiếng Anh. Nếu bạn cần bản dịch theo khu vực, vui lòng liên hệ.',
    },
    app: {
      loadingTitle: 'Đang tải…',
      loadingDesc: 'Đang chuẩn bị trang',
      notFoundTitle: '404 - Không tìm thấy trang',
      notFoundDesc: 'Trang bạn tìm không tồn tại.',
      backHome: 'Về trang chủ',
    },
  },
};

const MESSAGES = deepMergeMessages(BASE_MESSAGES, cmsMessages);

export function t(locale, keyPath) {
  const parts = String(keyPath).split('.');
  /** @type {any} */
  let cur = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
  for (const p of parts) {
    cur = cur?.[p];
    if (cur == null) return keyPath;
  }
  return typeof cur === 'string' ? cur : keyPath;
}

/**
 * Typed value getter for non-string translations (arrays/objects/numbers).
 * Use this only when you need structured data (e.g., `.map` over an array).
 */
export function tv(locale, keyPath, fallback = null) {
  const parts = String(keyPath).split('.');
  /** @type {any} */
  let cur = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
  for (const p of parts) {
    cur = cur?.[p];
    if (cur == null) return fallback;
  }
  return cur;
}

