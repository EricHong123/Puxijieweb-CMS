export const FACTORY_PROFILE = {
  // Scale
  founded: 2013,
  employeeCount: 320,
  rdTeamSize: 28,
  factorySqm: 5200,
  productionLines: 8,
  monthlyCapacity: 250000,
  annualCapacity: 3000000,
  cumulativeUnitsShipped: '18,000,000+',

  // Quality
  qualityStandard: 'Six Sigma',
  dpmo: 3.4,
  fieldReturnRate: '<0.3%',
  inspectionStages: 6,

  // Speed
  prototypingHours: 48,
  samplingDays: 7,
  leadTimeDays: '15–25',

  // Supply Chain
  localSourcingRadiusKm: 30,
  localSourcingPercent: 80,
  bufferStockDays: 30,

  // Export
  countriesExported: 45,
  regionsServed: [
    'North America',
    'Europe',
    'Asia-Pacific',
    'Middle East',
    'South America',
    'Africa',
  ],

  // Certifications
  certifications: [
    { code: 'ISO 9001:2015', name: 'Quality Management Systems', body: 'SGS', year: 2018 },
    { code: 'ISO 14001:2015', name: 'Environmental Management', body: 'SGS', year: 2019 },
    { code: 'BSCI', name: 'Social Compliance Audit', body: 'Amfori', rating: 'B', year: 2023 },
    { code: 'CE', name: 'European Conformity' },
    { code: 'FCC', name: 'Federal Communications Commission' },
    { code: 'RoHS', name: 'Restriction of Hazardous Substances' },
    { code: 'REACH', name: 'Chemical Safety Regulation' },
    { code: 'IEC 62133', name: 'Battery Safety' },
    { code: 'UN 38.3', name: 'Battery Transport Safety' },
    { code: 'Bluetooth SIG', name: 'Bluetooth Qualification', id: 'QDID 182345' },
    { code: 'IPX8', name: 'Waterproof Validation (in-house per IEC 60529)' },
  ],

  // Trade Shows
  tradeShows: [
    { name: 'Canton Fair', edition: '133rd–137th', location: 'Guangzhou', years: '2018–2025' },
    { name: 'Global Sources Consumer Electronics', location: 'Hong Kong', years: '2019, 2023, 2024, 2025' },
    { name: 'CES', location: 'Las Vegas', years: '2024, 2025, 2026' },
    { name: 'IFA', location: 'Berlin', years: '2024, 2025' },
  ],

  // Partnerships
  chipsetPartners: ['JL (Zhuhai Jieli)', 'Actions (Zhuhai Actions)', 'Realtek'],
  batteryPartners: ['Li-ion cylindrical 18650 (A-tier suppliers)', 'Li-polymer pouch cell suppliers'],

  // Client Profile
  namedPartners: ['Sansui', 'Aiwa', 'Yongwei', 'Remax', 'XO', 'Colorful', 'Maitian'],
  clientTypes: [
    'Fortune 500 consumer electronics brands (under NDA)',
    'European private-label retail chains',
    'North American promotional products distributors',
    'Southeast Asian e-commerce marketplace sellers',
    'Middle Eastern wholesale importers',
  ],

  // R&D
  patents: 9,
  prototypeTurnaround: '48 hours',
  designCapabilities: [
    'Acoustic simulation and passive radiator tuning',
    '3D CAD/CAM rapid prototyping',
    'CMF (Color/Material/Finish) design',
    'Injection mold design and tooling optimization',
    'Bluetooth antenna matching and RF tuning',
  ],

  // Location
  location: {
    addressLocality: 'Humen Town, Dongguan City',
    addressRegion: 'Guangdong Province',
    postalCode: '523900',
    country: 'China',
    corridor: 'Dongguan-Shenzhen manufacturing corridor',
  },

  // Contact
  contact: {
    email: 'contact@puxijietech.com',
    salesEmail: 'inquiry@puxijietech.com',
    phone: '+86 13532328175',
    wechat: 'EricH0625',
    hours: 'Mon–Fri, 9:00–18:00 (GMT+8)',
  },

  // MOQ tiers
  moq: {
    trial: 500,
    standardLow: 1000,
    standardHigh: 3000,
    volume: 10000,
  },
};
