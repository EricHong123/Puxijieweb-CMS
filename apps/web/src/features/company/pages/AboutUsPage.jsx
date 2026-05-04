import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { m as motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Factory,
  Globe,
  Microscope,
  PackageCheck,
  RadioTower,
  Shield,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import companyFrontdeskImage from '@/features/company/assets/about-us/company-frontdesk.webp?w=800;1200;1600&format=webp&as=img';
import factory1 from '@/features/company/assets/about-us/factory/factory-1.webp?w=360;720;1080;1600&format=webp&as=img';
import factory2 from '@/features/company/assets/about-us/factory/factory-2.webp?w=360;720;1080;1600&format=webp&as=img';
import factory3 from '@/features/company/assets/about-us/factory/factory-3.webp?w=360;720;1080;1600&format=webp&as=img';
import factory4 from '@/features/company/assets/about-us/factory/factory-4.webp?w=360;720;1080;1600&format=webp&as=img';
import factory5 from '@/features/company/assets/about-us/factory/factory-5.webp?w=360;720;1080;1600&format=webp&as=img';
import factory6 from '@/features/company/assets/about-us/factory/factory-6.webp?w=360;720;1080;1600&format=webp&as=img';
import factory7 from '@/features/company/assets/about-us/factory/factory-7.webp?w=360;720;1080;1600&format=webp&as=img';
import factory8 from '@/features/company/assets/about-us/factory/factory-8.webp?w=360;720;1080;1600&format=webp&as=img';
import factory9 from '@/features/company/assets/about-us/factory/factory-9.webp?w=360;720;1080;1600&format=webp&as=img';
import factory10 from '@/features/company/assets/about-us/factory/factory-10.webp?w=360;720;1080;1600&format=webp&as=img';
import factory11 from '@/features/company/assets/about-us/factory/factory-11.webp?w=360;720;1080;1600&format=webp&as=img';
import factory12 from '@/features/company/assets/about-us/factory/factory-12.webp?w=360;720;1080;1600&format=webp&as=img';
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog';
import { getSiteOrigin, t } from '@/shared/lib/i18n.js';
import { useLocale } from '@/shared/lib/useLocale.js';
import { getImageHeight, getImageSrc, getImageSrcSet, getImageWidth } from '@/shared/lib/resolveImage.js';

function getAboutCopy(locale) {
  const copy = {
    en: {
      title: 'About Puxijie — Top-10 China Waterproof Bluetooth Speaker OEM/ODM Manufacturer',
      description:
        'Meet Puxijie — a top-10 China OEM/ODM audio manufacturer since 2013. ISO 9001 & ISO 14001 certified, Six Sigma quality, 5,200 sqm facility, 320 employees, exporting to 45+ countries. Waterproof Bluetooth speakers, portable wireless speakers, specialty speakers, and Bluetooth earbuds for OEM/ODM, private label, and wholesale B2B.',
      badge: 'Top-10 China OEM/ODM Audio Factory — Since 2013',
      heroTitle: 'A sharper way to build your outdoor speaker line',
      heroDesc:
        'Puxijie is one of China\'s top-10 waterproof Bluetooth speaker OEM/ODM manufacturers. A vertically integrated, ISO 9001 & ISO 14001 certified, Six Sigma factory in Dongguan — helping brands, distributors, retailers, and procurement teams move from concept to market-ready audio supply across 45+ countries.',
      heroSupport:
        'Our work combines OEM/ODM engineering, private label branding, IPX waterproof validation, scalable production, and export-ready B2B support.',
      primaryCta: 'Discuss an OEM/ODM project',
      secondaryCta: 'View product platforms',
      chips: ['OEM/ODM speaker factory', 'Private label audio', 'Wholesale portable speakers', 'IPX6/IPX7 waterproof speaker'],
      stats: [
        ['Since 2013', '12+ years manufacturing'],
        ['250K+', 'monthly production capacity'],
        ['5,200 sqm', '8 production lines'],
        ['320+', 'employees & engineers'],
        ['IPX6/IPX7/IPX8', 'waterproof validation'],
        ['45+ Countries', '6 continents served'],
      ],
      trustTitle: 'Built for the questions professional buyers ask first',
      trustDesc:
        'About Us should not be a vanity page. For sourcing teams, it should answer the real questions: Can this factory customize? Can it scale? Can it validate quality? Can it communicate clearly before production starts?',
      trustCards: [
        ['OEM/ODM control', 'Logo, color, packaging, feature alignment, market fit, and product roadmap support for private label waterproof Bluetooth speakers.'],
        ['Factory visibility', 'Production lines, QC checkpoints, battery documentation, waterproof reports, and model-level data give buyers a clearer sourcing picture.'],
        ['Wholesale readiness', 'MOQ planning, sample review, carton data, export communication, and RFQ preparation for distributors and retailers.'],
      ],
      storyEyebrow: 'Who we are',
      storyTitle: 'From audio engineering to dependable supply',
      storyBody:
        'Founded in 2013, Puxijie has grown from a tight audio engineering team into one of China\'s top-10 waterproof Bluetooth speaker OEM/ODM manufacturers. Operating from a 5,200 sqm Six Sigma facility in the Dongguan-Shenzhen manufacturing corridor, our 320-person team ships to 45+ countries across six continents. In November 2024, we unified under the Puxijie name to reflect our global ambition. The principle remains simple: give B2B buyers OEM/ODM programs that are easier to evaluate, faster to customize, and built to repeat at scale.',
      storyPoints: [
        'Our 28-person R&D division — acoustic engineers, electronic specialists, and industrial designers — collaborates from concept sketch through golden sample in 7–14 business days.',
        'ISO 9001, ISO 14001, and BSCI-audited (Rating B) production ensures every order meets international compliance standards.',
        'Proven product platforms with 18,000,000+ cumulative units shipped reduce development risk for OEM/ODM, private label, and wholesale programs.',
        'Production planning is built around wholesale volume, Six Sigma QC, full export documentation, and repeat-order consistency.',
      ],
      capabilityEyebrow: 'Manufacturing capability',
      capabilityTitle: 'Production that buyers can actually inspect',
      capabilityDesc:
        'Our factory gallery is not decoration. It supports trust for buyers sourcing outdoor portable wireless waterproof speakers, Bluetooth earbuds, and specialty speaker programs.',
      capabilityCards: [
        ['Assembly & QC', 'Speaker assembly, visual inspection, acoustic checks, and batch consistency review.'],
        ['Waterproof validation', 'IPX-focused engineering for splash-resistant and outdoor-use speaker categories.'],
        ['Export documentation', 'Catalogs, model data, compliance references, and RFQ information for procurement teams.'],
      ],
      processEyebrow: 'B2B workflow',
      processTitle: 'A cleaner path from RFQ to shipment',
      process: [
        ['01', 'Define the target market', 'Share channel, target price band, quantity, waterproof rating, and packaging direction.'],
        ['02', 'Match the platform', 'Select from proven waterproof Bluetooth speaker, portable speaker, specialty speaker, or earbud models.'],
        ['03', 'Customize and sample', 'Confirm logo, colors, packaging, function needs, certificates, and sample approval.'],
        ['04', 'Produce and support', 'Move into production with QC checkpoints, documentation, shipping coordination, and reorder planning.'],
      ],
      valueTitle: 'Why sourcing teams stay with Puxijie',
      valueDesc:
        'The difference is not one feature. It is the combination of practical engineering, clear communication, repeatable quality, and products that fit wholesale channels.',
      valueCards: [
        ['Engineering discipline', 'Waterproofing, battery, acoustics, materials, and usability are reviewed as one product system.'],
        ['Commercial clarity', 'MOQ, lead time, customization scope, and RFQ details are made visible before buyers commit.'],
        ['Long-term cooperation', 'We support brands and distributors beyond the first order with model selection and product-line planning.'],
      ],
      partnerTitle: 'Trusted by audio and electronics channels',
      partnerDesc:
        'Our speaker platforms support domestic and international channel partners across retail, gift, distributor, and private label programs.',
      ctaTitle: 'Looking for a waterproof Bluetooth speaker manufacturer?',
      ctaDesc:
        'Send your market, model target, quantity, IPX requirement, and branding plan. We will help you choose the right Puxijie platform for OEM/ODM or wholesale sourcing.',
      factoryAlt: 'Puxijie waterproof Bluetooth speaker factory production and QC photo {n}',
      imageAlt: 'Puxijie China waterproof Bluetooth speaker manufacturer office and reception',
      dialogTitle: 'Puxijie factory photo preview',
    },
    fr: {
      title: 'À propos de Puxijie — Fabricant d’enceintes Bluetooth étanches OEM/ODM',
      description:
        'Découvrez Puxijie, fabricant chinois d’enceintes Bluetooth étanches pour OEM/ODM, private label audio, enceintes portables wholesale, IPX6/IPX7 et sourcing B2B.',
      badge: 'Usine audio étanche pour acheteurs B2B',
      heroTitle: 'Une façon plus nette de construire votre gamme outdoor',
      heroDesc:
        'Puxijie est un fabricant d’enceintes Bluetooth étanches en Chine, au service des marques, distributeurs, retailers et acheteurs promotionnels.',
      heroSupport:
        'Nous combinons ingénierie OEM/ODM, private label, validation IPX, production scalable et support export B2B.',
      primaryCta: 'Discuter un projet OEM/ODM',
      secondaryCta: 'Voir les plateformes produits',
      chips: ['Usine enceintes OEM/ODM', 'Audio private label', 'Enceintes portables wholesale', 'Enceinte étanche IPX6/IPX7'],
      stats: [
        ['Depuis 2013', "12+ ans d'expérience"],
        ['250K+', 'capacité mensuelle'],
        ['5 200 m²', '8 lignes de production'],
        ['320+', 'employés & ingénieurs'],
        ['IPX6/IPX7/IPX8', 'validation étanchéité'],
        ['45+ Pays', '6 continents desservis'],
      ],
      trustTitle: 'Conçu pour les premières questions des acheteurs professionnels',
      trustDesc:
        'Une page À propos ne doit pas être seulement institutionnelle. Pour le sourcing, elle doit répondre aux vraies questions : personnalisation, capacité, validation qualité et communication avant production.',
      trustCards: [
        ['Contrôle OEM/ODM', 'Logo, couleur, packaging, fonctions, adaptation marché et roadmap pour enceintes Bluetooth étanches private label.'],
        ['Visibilité usine', 'Lignes de production, points QC, documents batterie, rapports étanchéité et données modèle.'],
        ['Prêt pour le wholesale', 'MOQ, échantillons, cartons, communication export et informations RFQ pour distributeurs et retailers.'],
      ],
      storyEyebrow: 'Qui sommes-nous',
      storyTitle: 'De l’ingénierie audio à un approvisionnement fiable',
      storyBody:
        'Puxijie est passé d’une équipe audio orientée technologie à un fournisseur spécialisé en enceintes outdoor étanches. Le nom a changé en novembre 2024, mais l’idée reste la même : rendre les programmes speakers plus faciles à évaluer, personnaliser et répéter.',
      storyPoints: [
        'Les équipes acoustique, électronique et design industriel travaillent ensemble avant l’échantillonnage.',
        'Les plateformes existantes réduisent le risque de développement pour retailers et distributeurs.',
        'La production est pensée pour les volumes wholesale, la documentation et les commandes répétées.',
      ],
      capabilityEyebrow: 'Capacité de production',
      capabilityTitle: 'Une production que les acheteurs peuvent inspecter',
      capabilityDesc:
        'Notre galerie usine sert la confiance : sourcing d’enceintes étanches outdoor, écouteurs Bluetooth et programmes speakers spécialisés.',
      capabilityCards: [
        ['Assemblage & QC', 'Assemblage, inspection visuelle, contrôles acoustiques et cohérence par lot.'],
        ['Validation étanchéité', 'Ingénierie IPX pour catégories splash-resistant et outdoor.'],
        ['Documents export', 'Catalogues, données modèles, références conformité et informations RFQ.'],
      ],
      processEyebrow: 'Workflow B2B',
      processTitle: 'Un chemin clair de la RFQ à l’expédition',
      process: [
        ['01', 'Définir le marché cible', 'Canal, prix cible, quantité, indice étanchéité et direction packaging.'],
        ['02', 'Choisir la plateforme', 'Sélection parmi enceintes Bluetooth étanches, portables, spécialisées ou écouteurs.'],
        ['03', 'Personnaliser et échantillonner', 'Logo, couleurs, packaging, fonctions, certificats et validation échantillon.'],
        ['04', 'Produire et soutenir', 'Production avec QC, documentation, logistique et planification des réassorts.'],
      ],
      valueTitle: 'Pourquoi les équipes sourcing restent avec Puxijie',
      valueDesc:
        'La différence n’est pas une seule fonction, mais l’équilibre entre ingénierie, communication claire, qualité répétable et fit wholesale.',
      valueCards: [
        ['Discipline technique', 'Étanchéité, batterie, acoustique, matériaux et usage sont pensés comme un système produit.'],
        ['Clarté commerciale', 'MOQ, délai, personnalisation et RFQ sont clarifiés avant engagement.'],
        ['Coopération long terme', 'Support après la première commande : sélection modèle et planification de gamme.'],
      ],
      partnerTitle: 'Présent dans les canaux audio et électronique',
      partnerDesc:
        'Nos plateformes accompagnent retail, cadeau, distributeurs et programmes private label.',
      ctaTitle: 'Vous cherchez un fabricant d’enceintes Bluetooth étanches ?',
      ctaDesc:
        'Envoyez votre marché, modèle cible, quantité, besoin IPX et branding. Nous vous aiderons à choisir la bonne plateforme OEM/ODM ou wholesale.',
      factoryAlt: 'Photo production et QC usine Puxijie enceinte Bluetooth étanche {n}',
      imageAlt: 'Bureau et réception Puxijie fabricant chinois enceinte Bluetooth étanche',
      dialogTitle: 'Aperçu photo usine Puxijie',
    },
    vi: {
      title: 'Về Puxijie — Nhà sản xuất loa Bluetooth chống nước OEM/ODM',
      description:
        'Tìm hiểu Puxijie, nhà sản xuất loa Bluetooth chống nước tại Trung Quốc cho OEM/ODM, private label audio, loa portable bán sỉ, IPX6/IPX7 và sourcing B2B.',
      badge: 'Nhà máy audio chống nước cho buyer B2B',
      heroTitle: 'Cách rõ ràng hơn để xây dòng loa outdoor của bạn',
      heroDesc:
        'Puxijie là nhà sản xuất loa Bluetooth chống nước tại Trung Quốc, hỗ trợ thương hiệu, distributor, retailer và buyer quà tặng đưa sản phẩm ra thị trường.',
      heroSupport:
        'Chúng tôi kết hợp kỹ thuật OEM/ODM, private label, kiểm định IPX, sản xuất quy mô và hỗ trợ B2B xuất khẩu.',
      primaryCta: 'Trao đổi dự án OEM/ODM',
      secondaryCta: 'Xem nền tảng sản phẩm',
      chips: ['Nhà máy loa OEM/ODM', 'Private label audio', 'Loa portable bán sỉ', 'Loa chống nước IPX6/IPX7'],
      stats: [
        ['Từ 2013', '12+ năm sản xuất'],
        ['250K+', 'năng lực mỗi tháng'],
        ['5.200 m²', '8 dây chuyền'],
        ['320+', 'nhân viên & kỹ sư'],
        ['IPX6/IPX7/IPX8', 'kiểm định chống nước'],
        ['45+ Quốc gia', '6 lục địa'],
      ],
      trustTitle: 'Trả lời đúng câu hỏi đầu tiên của buyer chuyên nghiệp',
      trustDesc:
        'Trang About không chỉ để kể chuyện công ty. Với sourcing team, nó phải trả lời: nhà máy có tuỳ chỉnh được không, có scale được không, có kiểm chứng chất lượng không, và giao tiếp trước sản xuất có rõ không.',
      trustCards: [
        ['Kiểm soát OEM/ODM', 'Logo, màu, bao bì, tính năng, market fit và roadmap cho loa Bluetooth chống nước private label.'],
        ['Minh bạch nhà máy', 'Dây chuyền, điểm QC, tài liệu pin, báo cáo chống nước và dữ liệu từng model.'],
        ['Sẵn sàng bán sỉ', 'MOQ, mẫu, dữ liệu carton, giao tiếp xuất khẩu và thông tin RFQ cho distributor và retailer.'],
      ],
      storyEyebrow: 'Chúng tôi là ai',
      storyTitle: 'Từ kỹ thuật audio đến nguồn cung đáng tin cậy',
      storyBody:
        'Puxijie phát triển từ đội ngũ audio thiên về công nghệ thành nhà cung cấp loa outdoor chống nước chuyên sâu. Tên công ty đổi vào tháng 11/2024, nhưng mục tiêu vẫn rõ: giúp buyer B2B đánh giá, tuỳ chỉnh và đặt lại chương trình loa dễ hơn.',
      storyPoints: [
        'Đội acoustic, điện tử và thiết kế công nghiệp phối hợp trước khi làm mẫu.',
        'Nền tảng sản phẩm sẵn có giúp giảm rủi ro phát triển cho retailer và distributor.',
        'Kế hoạch sản xuất được xây cho số lượng wholesale, tài liệu và đơn hàng lặp lại.',
      ],
      capabilityEyebrow: 'Năng lực sản xuất',
      capabilityTitle: 'Sản xuất mà buyer có thể kiểm tra',
      capabilityDesc:
        'Thư viện nhà máy hỗ trợ niềm tin khi sourcing loa chống nước outdoor, tai nghe Bluetooth và các chương trình loa đặc biệt.',
      capabilityCards: [
        ['Lắp ráp & QC', 'Lắp ráp loa, kiểm tra ngoại quan, test âm thanh và kiểm soát batch.'],
        ['Kiểm định chống nước', 'Kỹ thuật IPX cho dòng loa chống bắn nước và dùng outdoor.'],
        ['Tài liệu xuất khẩu', 'Catalog, dữ liệu model, tham chiếu chứng nhận và thông tin RFQ.'],
      ],
      processEyebrow: 'Quy trình B2B',
      processTitle: 'Đường đi rõ từ RFQ đến xuất hàng',
      process: [
        ['01', 'Xác định thị trường', 'Kênh bán, mức giá, số lượng, chuẩn chống nước và hướng bao bì.'],
        ['02', 'Chọn nền tảng', 'Chọn từ loa Bluetooth chống nước, loa portable, loa đặc biệt hoặc tai nghe.'],
        ['03', 'Tuỳ chỉnh và làm mẫu', 'Chốt logo, màu, bao bì, tính năng, chứng nhận và mẫu.'],
        ['04', 'Sản xuất và hỗ trợ', 'Sản xuất với QC, tài liệu, điều phối vận chuyển và kế hoạch đặt lại.'],
      ],
      valueTitle: 'Vì sao sourcing team tiếp tục làm việc với Puxijie',
      valueDesc:
        'Khác biệt không nằm ở một tính năng, mà ở kỹ thuật thực tế, giao tiếp rõ, chất lượng lặp lại và sản phẩm phù hợp kênh bán sỉ.',
      valueCards: [
        ['Kỷ luật kỹ thuật', 'Chống nước, pin, âm học, vật liệu và trải nghiệm được xem như một hệ thống.'],
        ['Rõ ràng thương mại', 'MOQ, lead time, phạm vi tuỳ chỉnh và RFQ được làm rõ trước khi cam kết.'],
        ['Hợp tác dài hạn', 'Hỗ trợ sau đơn đầu tiên qua chọn model và quy hoạch dòng sản phẩm.'],
      ],
      partnerTitle: 'Được dùng trong các kênh audio và điện tử',
      partnerDesc:
        'Nền tảng loa của chúng tôi hỗ trợ retail, quà tặng, distributor và private label.',
      ctaTitle: 'Bạn cần nhà sản xuất loa Bluetooth chống nước?',
      ctaDesc:
        'Gửi thị trường, model mục tiêu, số lượng, yêu cầu IPX và kế hoạch branding. Chúng tôi sẽ giúp chọn nền tảng Puxijie phù hợp cho OEM/ODM hoặc bán sỉ.',
      factoryAlt: 'Ảnh sản xuất và QC nhà máy loa Bluetooth chống nước Puxijie {n}',
      imageAlt: 'Văn phòng Puxijie nhà sản xuất loa Bluetooth chống nước Trung Quốc',
      dialogTitle: 'Xem ảnh nhà máy Puxijie',
    },
  };

  return copy[locale] ?? copy.en;
}

function AboutUsPage() {
  const locale = useLocale();
  const pageCopy = useMemo(() => getAboutCopy(locale), [locale]);
  const [factoryOpen, setFactoryOpen] = useState(false);
  const [factoryIndex, setFactoryIndex] = useState(0);
  const factoryPhotos = useMemo(
    () => [
      factory1,
      factory2,
      factory3,
      factory4,
      factory5,
      factory6,
      factory7,
      factory8,
      factory9,
      factory10,
      factory11,
      factory12,
    ],
    []
  );

  const factoryPhotoMeta = useMemo(
    () =>
      factoryPhotos.map((src, idx) => ({
        src,
        alt: pageCopy.factoryAlt.replace('{n}', String(idx + 1)),
      })),
    [factoryPhotos, pageCopy]
  );

  const aboutCanonical = `${getSiteOrigin()}/${locale}/about-us`;
  const aboutOgImage = `${getSiteOrigin()}${getImageSrc(companyFrontdeskImage)}`;
  const proofIcons = [Award, Zap, Shield, Globe, Factory, Users];
  const trustIcons = [Factory, Microscope, PackageCheck];

  const fadeIn = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.55 },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${getSiteOrigin()}/${locale}/about-us#organization`,
    name: 'Puxijie',
    alternateName: 'Puxijie Tech',
    url: getSiteOrigin(),
    logo: `${getSiteOrigin()}/images/puxijie-logo-dark.webp`,
    foundingDate: '2013',
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 320, unitText: 'FTE' },
    description: pageCopy.description,
    knowsAbout: [
      'waterproof Bluetooth speaker manufacturer',
      'OEM/ODM speaker factory',
      'private label portable speakers',
      'wholesale Bluetooth speakers',
      'IPX6/IPX7/IPX8 outdoor speaker manufacturing',
      'Six Sigma audio manufacturing',
      'Bluetooth earbuds OEM',
    ],
    areaServed: [
      { '@type': 'Continent', name: 'North America' },
      { '@type': 'Continent', name: 'Europe' },
      { '@type': 'Continent', name: 'Asia-Pacific' },
      { '@type': 'Continent', name: 'Middle East' },
      { '@type': 'Continent', name: 'South America' },
      { '@type': 'Continent', name: 'Africa' },
    ],
    hasCredential: [
      { '@type': 'EducationalOccupationalCredential', credentialCategory: 'ISO 9001:2015', about: 'Quality Management Systems', recognizedBy: { '@type': 'Organization', name: 'SGS' } },
      { '@type': 'EducationalOccupationalCredential', credentialCategory: 'ISO 14001:2015', about: 'Environmental Management', recognizedBy: { '@type': 'Organization', name: 'SGS' } },
      { '@type': 'EducationalOccupationalCredential', credentialCategory: 'BSCI', about: 'Social Compliance Audit — Rating B', recognizedBy: { '@type': 'Organization', name: 'Amfori' } },
    ],
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dongguan',
        addressRegion: 'Guangdong',
        addressCountry: 'CN',
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#111827]">
      <Helmet>
        <html lang={locale} />
        <title>{pageCopy.title}</title>
        <meta name="description" content={pageCopy.description} />
        <meta
          name="keywords"
          content="waterproof Bluetooth speaker manufacturer, OEM/ODM speaker factory, private label audio supplier, wholesale portable speakers, IPX7 outdoor speaker supplier, China Bluetooth speaker factory"
        />
        <link rel="canonical" href={aboutCanonical} />
        {['en', 'fr', 'vi'].map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`${getSiteOrigin()}/${l}/about-us`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${getSiteOrigin()}/en/about-us`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Puxijie" />
        <meta property="og:url" content={aboutCanonical} />
        <meta property="og:title" content={pageCopy.title} />
        <meta property="og:description" content={pageCopy.description} />
        <meta property="og:image" content={aboutOgImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageCopy.title} />
        <meta name="twitter:description" content={pageCopy.description} />
        <meta name="twitter:image" content={aboutOgImage} />
        <script type="application/ld+json">{JSON.stringify(organizationJsonLd)}</script>
      </Helmet>

      <Header />

      <main>
        <section className="relative overflow-hidden bg-[#101820] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(69,137,255,0.24),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(245,177,74,0.18),transparent_30%),linear-gradient(135deg,#101820_0%,#1a232d_52%,#2b261e_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f5f1e8] to-transparent" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col justify-center"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur">
                <RadioTower className="h-4 w-4 text-[#f5b14a]" />
                {pageCopy.badge}
              </div>
              <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                {pageCopy.heroTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76 sm:text-xl">
                {pageCopy.heroDesc}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                {pageCopy.heroSupport}
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                {pageCopy.chips.map((chip) => (
                  <span key={chip} className="rounded-full border border-white/12 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold text-white/72">
                    {chip}
                  </span>
                ))}
              </div>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={`/${locale}/contact`}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#f5b14a] px-6 py-4 text-sm font-black text-[#101820] shadow-[0_16px_50px_rgba(245,177,74,0.22)] transition-transform hover:-translate-y-0.5"
                >
                  {pageCopy.primaryCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  to={`/${locale}/products`}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/15"
                >
                  {pageCopy.secondaryCta}
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.08 }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/10 shadow-2xl">
                <img
                  src={getImageSrc(companyFrontdeskImage)}
                  srcSet={getImageSrcSet(companyFrontdeskImage)}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  alt={pageCopy.imageAlt}
                  width={getImageWidth(companyFrontdeskImage, 1200)}
                  height={getImageHeight(companyFrontdeskImage, 900)}
                  className="aspect-[4/4.6] w-full object-cover sm:aspect-[4/3.4] lg:aspect-[4/4.35]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101820]/88 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
                  {pageCopy.stats.map(([value, label], index) => {
                    const Icon = proofIcons[index];
                    return (
                      <div key={label} className="rounded-2xl border border-white/10 bg-[#101820]/70 p-3 backdrop-blur">
                        <Icon className="mb-2 h-4 w-4 text-[#f5b14a]" />
                        <p className="text-xl font-black tracking-[-0.03em]">{value}</p>
                        <p className="mt-1 text-[11px] leading-4 text-white/58">{label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative -mt-6 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 rounded-[2rem] border border-[#dfd6c5] bg-white p-4 shadow-[0_24px_80px_rgba(16,24,32,0.08)] md:grid-cols-4">
            {pageCopy.stats.map(([value, label], index) => {
              const Icon = proofIcons[index];
              return (
                <div key={label} className="rounded-3xl bg-[#f7f3eb] p-5">
                  <Icon className="h-5 w-5 text-[#9a6a20]" />
                  <p className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#111827]">{value}</p>
                  <p className="mt-1 text-sm leading-5 text-[#5b6472]">{label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeIn} className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9a6a20]">B2B confidence</p>
                <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-[-0.04em] text-[#101820] md:text-5xl">
                  {pageCopy.trustTitle}
                </h2>
              </div>
              <p className="text-base leading-8 text-[#5b6472] md:text-lg">
                {pageCopy.trustDesc}
              </p>
            </motion.div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {pageCopy.trustCards.map(([title, desc], index) => {
                const Icon = trustIcons[index];
                return (
                  <motion.div
                    key={title}
                    {...fadeIn}
                    transition={{ duration: 0.55, delay: index * 0.08 }}
                    className="group rounded-[1.75rem] border border-[#dfd6c5] bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#101820] text-[#f5b14a]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-7 text-xl font-black tracking-[-0.03em] text-[#101820]">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#5b6472]">{desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#101820] px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div {...fadeIn}>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#f5b14a]">{pageCopy.storyEyebrow}</p>
              <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
                {pageCopy.storyTitle}
              </h2>
              <p className="mt-6 text-base leading-8 text-white/68 md:text-lg">
                {pageCopy.storyBody}
              </p>
            </motion.div>
            <motion.div {...fadeIn} className="grid gap-4">
              {pageCopy.storyPoints.map((point, index) => (
                <div key={point} className="flex gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5b14a] text-sm font-black text-[#101820]">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-7 text-white/72">{point}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeIn} className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9a6a20]">{pageCopy.capabilityEyebrow}</p>
              <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] text-[#101820] md:text-5xl">
                {pageCopy.capabilityTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-[#5b6472] md:text-lg">
                {pageCopy.capabilityDesc}
              </p>
            </motion.div>

            <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <button
                type="button"
                onClick={() => {
                  setFactoryIndex(0);
                  setFactoryOpen(true);
                }}
                className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-[#dfd6c5] bg-white text-left shadow-sm"
                aria-label={factoryPhotoMeta[0]?.alt}
              >
                <img
                  src={getImageSrc(factoryPhotos[0])}
                  srcSet={getImageSrcSet(factoryPhotos[0])}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  alt={factoryPhotoMeta[0]?.alt}
                  width={getImageWidth(factoryPhotos[0], 1600)}
                  height={getImageHeight(factoryPhotos[0], 1200)}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101820]/76 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <p className="max-w-xl text-2xl font-black tracking-[-0.04em] text-white">Factory floor, product handling, and QC visibility</p>
                </div>
              </button>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {pageCopy.capabilityCards.map(([title, desc], index) => (
                  <div key={title} className="rounded-[1.5rem] border border-[#dfd6c5] bg-white p-6 shadow-sm">
                    <p className="text-lg font-black tracking-[-0.03em] text-[#101820]">{title}</p>
                    <p className="mt-3 text-sm leading-6 text-[#5b6472]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {factoryPhotoMeta.slice(1, 9).map((photo, index) => (
                <button
                  key={photo.alt}
                  type="button"
                  onClick={() => {
                    setFactoryIndex(index + 1);
                    setFactoryOpen(true);
                  }}
                  className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-[#dfd6c5] bg-white"
                  aria-label={photo.alt}
                >
                  <img
                    src={getImageSrc(photo.src)}
                    srcSet={getImageSrcSet(photo.src)}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    alt={photo.alt}
                    width={getImageWidth(photo.src, 900)}
                    height={getImageHeight(photo.src, 675)}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#dfd6c5] bg-white px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeIn} className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9a6a20]">{pageCopy.processEyebrow}</p>
                <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] text-[#101820] md:text-5xl">
                  {pageCopy.processTitle}
                </h2>
              </div>
              <div className="grid gap-3">
                {pageCopy.process.map(([step, title, desc]) => (
                  <div key={step} className="grid gap-4 rounded-3xl border border-[#e5ddce] bg-[#f7f3eb] p-5 sm:grid-cols-[70px_1fr]">
                    <span className="text-3xl font-black tracking-[-0.05em] text-[#9a6a20]">{step}</span>
                    <div>
                      <h3 className="text-lg font-black tracking-[-0.03em] text-[#101820]">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#5b6472]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <motion.div {...fadeIn}>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9a6a20]">Why Puxijie</p>
              <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] text-[#101820] md:text-5xl">
                {pageCopy.valueTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-[#5b6472] md:text-lg">{pageCopy.valueDesc}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {['CE / FCC / RoHS support', 'IPX waterproof speaker data', 'OEM/ODM customization', 'Wholesale RFQ support'].map((tag) => (
                  <span key={tag} className="rounded-full border border-[#dfd6c5] bg-white px-4 py-2 text-xs font-bold text-[#101820]">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeIn} className="grid gap-4">
              {pageCopy.valueCards.map(([title, desc], index) => (
                <div key={title} className="rounded-[1.6rem] border border-[#dfd6c5] bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#101820] text-[#f5b14a]">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-[-0.03em] text-[#101820]">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#5b6472]">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="bg-[#101820] px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeIn} className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur md:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <Sparkles className="h-8 w-8 text-[#f5b14a]" />
                <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] md:text-5xl">{pageCopy.partnerTitle}</h2>
                <p className="mt-4 text-base leading-8 text-white/64">{pageCopy.partnerDesc}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {['Sansui', 'Aiwa', 'Yongwei', 'Remax', 'XO', 'Colorful', 'Maitian'].map((partner) => (
                  <span key={partner} className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-sm font-black text-white/78">
                    {partner}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#dfd6c5] bg-white p-7 text-center shadow-[0_24px_80px_rgba(16,24,32,0.08)] md:p-12">
            <motion.div {...fadeIn}>
              <h2 className="text-4xl font-black leading-tight tracking-[-0.05em] text-[#101820] md:text-6xl">
                {pageCopy.ctaTitle}
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#5b6472] md:text-lg">
                {pageCopy.ctaDesc}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to={`/${locale}/contact`}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#101820] px-7 py-4 text-sm font-black text-white transition-transform hover:-translate-y-0.5"
                >
                  {pageCopy.primaryCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  to={`/${locale}/lab`}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#dfd6c5] bg-[#f7f3eb] px-7 py-4 text-sm font-black text-[#101820] transition-colors hover:bg-[#efe7d8]"
                >
                  {t(locale, 'home.ctaLab')}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Dialog open={factoryOpen} onOpenChange={setFactoryOpen}>
        <DialogContent
          className="left-0 top-0 z-[100] flex h-[100dvh] max-h-[100dvh] w-[100vw] max-w-none translate-x-0 translate-y-0 gap-0 border-0 bg-zinc-950/98 p-0 shadow-none sm:rounded-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">{pageCopy.dialogTitle}</DialogTitle>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 pt-14">
            <img
              src={getImageSrc(factoryPhotoMeta[factoryIndex]?.src)}
              srcSet={getImageSrcSet(factoryPhotoMeta[factoryIndex]?.src)}
              sizes="100vw"
              alt={factoryPhotoMeta[factoryIndex]?.alt}
              width={getImageWidth(factoryPhotoMeta[factoryIndex]?.src, 1600)}
              height={getImageHeight(factoryPhotoMeta[factoryIndex]?.src, 1200)}
              className="max-h-[min(85dvh,900px)] max-w-full select-none object-contain"
              draggable={false}
            />
            <p className="pointer-events-none absolute bottom-4 left-1/2 z-[3] -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/90">
              {factoryIndex + 1} / {factoryPhotoMeta.length}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default AboutUsPage;
