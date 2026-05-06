// Seed pages into Supabase via the CMS worker API
// Usage: node cms/scripts/seed-pages.mjs
// Requires: admin login credentials for the CMS

const API = 'https://puxijie-cms-api.hzjeric2002.workers.dev/api/v1';

const PAGES = [
  {
    slug: 'home',
    page_type: 'home',
    translations: {
      en: {
        title: 'Puxijie — OEM/ODM Waterproof Speaker Manufacturer | B2B Audio Factory',
        meta_description:
          'OEM/ODM waterproof Bluetooth speaker factory for brands and distributors. Private label portable speakers, wholesale earbuds, IPX6/IPX7 outdoor audio since 2012.',
        hero_badge: 'OEM/ODM Waterproof Speaker Factory',
      },
      fr: {
        title: 'Puxijie — Fabricant OEM/ODM de Haut-parleurs Étanches | Audio B2B',
        meta_description:
          'Fabricant OEM/ODM de haut-parleurs Bluetooth étanches pour marques et distributeurs. Enceintes portables en marque blanche, écouteurs en gros.',
        hero_badge: 'Fabricant OEM/ODM d\'Enceintes Étanches',
      },
      vi: {
        title: 'Puxijie — Nhà Máy OEM/ODM Loa Chống Nước | Âm Thanh B2B',
        meta_description:
          'Nhà máy OEM/ODM loa Bluetooth chống nước cho thương hiệu và nhà phân phối. Loa di động nhãn riêng, tai nghe bán sỉ.',
        hero_badge: 'Nhà Máy Loa Chống Nước OEM/ODM',
      },
    },
  },
  {
    slug: 'b2b',
    page_type: 'standard',
    translations: {
      en: {
        title: 'B2B & Wholesale Bluetooth Speaker Sourcing | Puxijie',
        meta_description:
          'Wholesale waterproof Bluetooth speakers, OEM/ODM programs, private label audio manufacturing. MOQ from 1,000 pcs. Contact for RFQ and distributor pricing.',
        hero_badge: 'B2B & Wholesale',
      },
      fr: {
        title: 'Sourcing B2B & Vente en Gros Haut-parleurs Bluetooth | Puxijie',
        meta_description:
          'Haut-parleurs Bluetooth étanches en gros, programmes OEM/ODM, fabrication audio en marque blanche. MOQ à partir de 1000 pièces.',
        hero_badge: 'B2B & Vente en Gros',
      },
      vi: {
        title: 'Sourcing B2B & Bán Sỉ Loa Bluetooth | Puxijie',
        meta_description:
          'Loa Bluetooth chống nước bán sỉ, chương trình OEM/ODM, sản xuất âm thanh nhãn riêng. MOQ từ 1.000 chiếc.',
        hero_badge: 'B2B & Bán Sỉ',
      },
    },
  },
  {
    slug: 'contact',
    page_type: 'contact',
    translations: {
      en: {
        title: 'Contact Puxijie — RFQ, OEM Inquiry & Factory Visit | Puxijie',
        meta_description:
          'Contact Puxijie for OEM/ODM Bluetooth speaker RFQs, wholesale pricing, factory visits, and sourcing support. WeChat: EricH0625. Reply within 24h on business days.',
        hero_badge: 'Contact',
      },
      fr: {
        title: 'Contactez Puxijie — Devis, OEM & Visite d\'Usine | Puxijie',
        meta_description:
          'Contactez Puxijie pour des devis OEM/ODM, des prix de gros, des visites d\'usine et du support sourcing. WeChat: EricH0625.',
        hero_badge: 'Contact',
      },
      vi: {
        title: 'Liên Hệ Puxijie — RFQ, OEM & Thăm Nhà Máy | Puxijie',
        meta_description:
          'Liên hệ Puxijie để được báo giá OEM/ODM, giá bán sỉ, thăm nhà máy và hỗ trợ sourcing. WeChat: EricH0625.',
        hero_badge: 'Liên Hệ',
      },
    },
  },
  {
    slug: 'about-us',
    page_type: 'standard',
    translations: {
      en: {
        title: 'About Puxijie — OEM Audio Manufacturer Since 2012 | Puxijie',
        meta_description:
          'Puxijie is a Shenzhen-based OEM/ODM audio manufacturer specializing in waterproof Bluetooth speakers, portable speakers, and earbuds since 2012.',
        hero_badge: 'About Us',
      },
      fr: {
        title: 'À Propos de Puxijie — Fabricant Audio OEM Depuis 2012 | Puxijie',
        meta_description:
          'Puxijie est un fabricant audio OEM/ODM basé à Shenzhen, spécialisé dans les haut-parleurs Bluetooth étanches depuis 2012.',
        hero_badge: 'À Propos',
      },
      vi: {
        title: 'Về Puxijie — Nhà Sản Xuất Âm Thanh OEM Từ 2012 | Puxijie',
        meta_description:
          'Puxijie là nhà sản xuất âm thanh OEM/ODM tại Thâm Quyến, chuyên về loa Bluetooth chống nước từ năm 2012.',
        hero_badge: 'Về Chúng Tôi',
      },
    },
  },
  {
    slug: 'lab',
    page_type: 'standard',
    translations: {
      en: {
        title: 'Puxijie Lab — IPX Testing, Compliance & Certifications | Puxijie',
        meta_description:
          'In-house IPX waterproof testing lab, CE/FCC/RoHS compliance reports, drop tests, and audio quality measurements for OEM/ODM Bluetooth speakers.',
        hero_badge: 'Testing & Certifications',
      },
      fr: {
        title: 'Lab Puxijie — Tests IPX, Conformité & Certifications | Puxijie',
        meta_description:
          'Laboratoire interne de tests IPX, rapports de conformité CE/FCC/RoHS, tests de chute et mesures de qualité audio.',
        hero_badge: 'Tests & Certifications',
      },
      vi: {
        title: 'Phòng Lab Puxijie — Kiểm Tra IPX, Chứng Nhận | Puxijie',
        meta_description:
          'Phòng lab kiểm tra IPX nội bộ, báo cáo CE/FCC/RoHS, kiểm tra độ bền và đo lường chất lượng âm thanh.',
        hero_badge: 'Kiểm Tra & Chứng Nhận',
      },
    },
  },
  {
    slug: 'faq',
    page_type: 'standard',
    translations: {
      en: {
        title: 'Procurement FAQ (B2B) | Puxijie',
        meta_description:
          'Frequently asked questions about OEM/ODM Bluetooth speaker procurement, MOQ, lead times, private labeling, shipping, and warranty for wholesale buyers.',
        hero_badge: 'Partner & Wholesale FAQ',
      },
      fr: {
        title: 'FAQ Achats (B2B) | Puxijie',
        meta_description:
          'Questions fréquentes sur les achats OEM/ODM de haut-parleurs Bluetooth, MOQ, délais, marque blanche, expédition et garantie pour acheteurs en gros.',
        hero_badge: 'FAQ Partenaire & Vente en Gros',
      },
      vi: {
        title: 'FAQ Mua Hàng (B2B) | Puxijie',
        meta_description:
          'Câu hỏi thường gặp về mua hàng OEM/ODM loa Bluetooth, MOQ, thời gian giao hàng, nhãn riêng, vận chuyển và bảo hành cho khách sỉ.',
        hero_badge: 'FAQ Đối Tác & Bán Sỉ',
      },
    },
  },
  {
    slug: 'help-center',
    page_type: 'standard',
    translations: {
      en: {
        title: 'Help Center — Sourcing Guide & OEM FAQ | Puxijie',
        meta_description:
          'B2B help center for Bluetooth speaker sourcing: how to request a quote, understand MOQ, choose waterproof ratings, and start an OEM/ODM project.',
        hero_badge: 'Help Center',
      },
      fr: {
        title: 'Centre d\'Aide — Guide de Sourcing & FAQ OEM | Puxijie',
        meta_description:
          'Centre d\'aide B2B pour le sourcing de haut-parleurs Bluetooth : comment demander un devis, comprendre le MOQ, choisir l\'indice d\'étanchéité.',
        hero_badge: 'Centre d\'Aide',
      },
      vi: {
        title: 'Trung Tâm Trợ Giúp — Hướng Dẫn Sourcing & FAQ OEM | Puxijie',
        meta_description:
          'Trung tâm trợ giúp B2B cho sourcing loa Bluetooth: cách yêu cầu báo giá, hiểu MOQ, chọn cấp chống nước.',
        hero_badge: 'Trung Tâm Trợ Giúp',
      },
    },
  },
  {
    slug: 'catalog-downloads',
    page_type: 'standard',
    translations: {
      en: {
        title: 'Catalog Downloads — Puxijie 2026 (No Price) | Puxijie',
        meta_description:
          'Download the Puxijie 2026 product catalog — English, price-free for B2B sourcing, OEM/ODM planning, and wholesale selection. Excel format available.',
        hero_badge: 'Catalog Downloads',
      },
      fr: {
        title: 'Téléchargements Catalogue — Puxijie 2026 (Sans Prix) | Puxijie',
        meta_description:
          'Téléchargez le catalogue produits Puxijie 2026 en anglais, sans prix pour le sourcing B2B. Format Excel disponible.',
        hero_badge: 'Téléchargements Catalogue',
      },
      vi: {
        title: 'Tải Catalog — Puxijie 2026 (Không Giá) | Puxijie',
        meta_description:
          'Tải catalog sản phẩm Puxijie 2026 bằng tiếng Anh, không giá để phục vụ sourcing B2B. Có định dạng Excel.',
        hero_badge: 'Tải Catalog',
      },
    },
  },
  {
    slug: 'terms-of-use',
    page_type: 'standard',
    translations: {
      en: {
        title: 'Terms of Use | Puxijie',
        meta_description:
          'Terms of use for the Puxijie website. B2B OEM/ODM Bluetooth speaker manufacturer terms and conditions.',
        hero_badge: 'Terms of Use',
      },
      fr: {
        title: 'Conditions d\'Utilisation | Puxijie',
        meta_description:
          'Conditions d\'utilisation du site Puxijie. Conditions générales du fabricant OEM/ODM de haut-parleurs Bluetooth.',
        hero_badge: 'Conditions d\'Utilisation',
      },
      vi: {
        title: 'Điều Khoản Sử Dụng | Puxijie',
        meta_description:
          'Điều khoản sử dụng trang web Puxijie. Điều khoản của nhà sản xuất OEM/ODM loa Bluetooth.',
        hero_badge: 'Điều Khoản Sử Dụng',
      },
    },
  },
  {
    slug: 'privacy',
    page_type: 'standard',
    translations: {
      en: {
        title: 'Privacy Policy | Puxijie',
        meta_description:
          'Privacy policy for Puxijie. How we collect, use, and protect personal data on puxijietech.com.',
        hero_badge: 'Privacy Policy',
      },
      fr: {
        title: 'Politique de Confidentialité | Puxijie',
        meta_description:
          'Politique de confidentialité de Puxijie. Comment nous collectons, utilisons et protégeons les données personnelles.',
        hero_badge: 'Politique de Confidentialité',
      },
      vi: {
        title: 'Chính Sách Bảo Mật | Puxijie',
        meta_description:
          'Chính sách bảo mật của Puxijie. Cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân.',
        hero_badge: 'Chính Sách Bảo Mật',
      },
    },
  },
  {
    slug: 'warranty',
    page_type: 'standard',
    translations: {
      en: {
        title: 'Warranty Policy | Puxijie',
        meta_description:
          'Warranty policy for Puxijie OEM/ODM Bluetooth speakers. Coverage terms, claim process, and B2B warranty support.',
        hero_badge: 'Warranty Policy',
      },
      fr: {
        title: 'Politique de Garantie | Puxijie',
        meta_description:
          'Politique de garantie pour les haut-parleurs Bluetooth OEM/ODM Puxijie. Conditions de couverture et processus de réclamation.',
        hero_badge: 'Politique de Garantie',
      },
      vi: {
        title: 'Chính Sách Bảo Hành | Puxijie',
        meta_description:
          'Chính sách bảo hành cho loa Bluetooth OEM/ODM Puxijie. Điều khoản bảo hành và quy trình yêu cầu.',
        hero_badge: 'Chính Sách Bảo Hành',
      },
    },
  },
  {
    slug: 'do-not-sell-share-my-data',
    page_type: 'standard',
    translations: {
      en: {
        title: 'Do Not Sell or Share My Data | Puxijie',
        meta_description:
          'Your rights under CCPA and other privacy regulations. Opt out of the sale or sharing of personal information collected by puxijietech.com.',
        hero_badge: 'Privacy Rights',
      },
      fr: {
        title: 'Ne Pas Vendre ni Partager Mes Données | Puxijie',
        meta_description:
          'Vos droits en matière de confidentialité. Désactivez la vente ou le partage de vos informations personnelles.',
        hero_badge: 'Droits de Confidentialité',
      },
      vi: {
        title: 'Không Bán hoặc Chia Sẻ Dữ Liệu Của Tôi | Puxijie',
        meta_description:
          'Quyền riêng tư của bạn. Từ chối việc bán hoặc chia sẻ thông tin cá nhân được thu thập bởi puxijietech.com.',
        hero_badge: 'Quyền Riêng Tư',
      },
    },
  },
  {
    slug: 'sitemap',
    page_type: 'standard',
    translations: {
      en: {
        title: 'Sitemap | Puxijie',
        meta_description:
          'Full sitemap of puxijietech.com — browse all pages, products, news articles, and legal pages across all locales.',
        hero_badge: 'Sitemap',
      },
      fr: {
        title: 'Plan du Site | Puxijie',
        meta_description:
          'Plan complet du site puxijietech.com — parcourez toutes les pages, produits, articles et pages légales.',
        hero_badge: 'Plan du Site',
      },
      vi: {
        title: 'Sơ Đồ Trang | Puxijie',
        meta_description:
          'Sơ đồ trang đầy đủ của puxijietech.com — duyệt tất cả các trang, sản phẩm, bài viết và trang pháp lý.',
        hero_badge: 'Sơ Đồ Trang',
      },
    },
  },
];

async function main() {
  const email = process.env.CMS_EMAIL;
  const password = process.env.CMS_PASSWORD;

  if (!email || !password) {
    console.error('Set CMS_EMAIL and CMS_PASSWORD environment variables.');
    console.error('  CMS_EMAIL=admin@example.com CMS_PASSWORD=xxx node cms/scripts/seed-pages.mjs');
    process.exit(1);
  }

  // Step 1: Login to get JWT token
  console.log('Logging in...');
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.error('Login failed:', loginData.error);
    process.exit(1);
  }
  const token = loginData.data.token;
  console.log('Logged in successfully.\n');

  // Step 2: Create each page
  let created = 0;
  let skipped = 0;

  for (const page of PAGES) {
    const translations = ['en', 'fr', 'vi'].map((locale) => ({
      locale,
      ...page.translations[locale],
    }));

    const res = await fetch(`${API}/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        slug: page.slug,
        page_type: page.page_type,
        translations,
        is_published: true,
      }),
    });

    const data = await res.json();
    if (data.success) {
      console.log(`  ✓ ${page.slug} (${page.page_type})`);
      created++;
    } else if (data.error?.includes('duplicate') || data.error?.includes('already exists')) {
      console.log(`  - ${page.slug} (already exists, skipping)`);
      skipped++;
    } else {
      console.log(`  ✗ ${page.slug}: ${data.error}`);
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped, ${PAGES.length - created - skipped} failed.`);
}

main().catch(console.error);
