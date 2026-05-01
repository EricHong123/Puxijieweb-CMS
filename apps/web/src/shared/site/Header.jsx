import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Boxes,
  Building2,
  ChevronDown,
  Download,
  Factory,
  Facebook,
  FlaskConical,
  Headphones,
  HelpCircle,
  Instagram,
  Menu,
  MessageCircle,
  Newspaper,
  PackageSearch,
  Search,
  Sparkles,
  Waves,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import puxijieLogo from '@/shared/site/assets/brand/puxijie-logo-dark.webp?w=64;128;200;260&format=webp&quality=82&as=img';
import { getImageSrc, getImageSrcSet } from '@/shared/lib/resolveImage.js';
import { DEFAULT_LOCALE, isSupportedLocale, t } from '@/shared/lib/i18n.js';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/ui/command';
import { products } from '@/features/products/data/products.js';
import { getLocalizedProduct } from '@/features/products/utils/productI18n.js';
import { getModelSlugById } from '@/features/products/utils/modelSlugs.js';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/shared/ui/navigation-menu';

function isPathActive(pathname, target) {
  const cleanTarget = target.split('?')[0];
  return pathname === cleanTarget || pathname.startsWith(`${cleanTarget}/`);
}

function NavLink({ to, active, children }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        to={to}
        className={`relative inline-flex h-10 items-center rounded-full px-3.5 text-sm font-semibold transition-colors ${
          active
            ? 'bg-white text-gray-950 shadow-sm'
            : 'text-white/78 hover:bg-white/10 hover:text-white'
        }`}
      >
        {children}
      </Link>
    </NavigationMenuLink>
  );
}

function MegaLink({ item }) {
  const Icon = item.icon || ArrowRight;
  return (
    <NavigationMenuLink asChild>
      <Link
        to={item.path}
        className="group flex gap-3 rounded-xl border border-transparent p-3 text-left transition-all hover:border-gray-200 hover:bg-gray-50 focus:border-gray-300 focus:bg-gray-50"
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-950 text-white transition-colors group-hover:bg-[#c8a45d]">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-gray-950">{item.name}</span>
          {item.desc ? <span className="mt-1 block text-xs leading-relaxed text-gray-500">{item.desc}</span> : null}
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

function MobileSection({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MobileLink({ to, onClick, children, accent = false }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
        accent ? 'bg-white text-gray-950' : 'text-white/78 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span>{children}</span>
      <ArrowRight className="h-3.5 w-3.5 opacity-60" />
    </Link>
  );
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const locale = useMemo(() => {
    const seg = (location.pathname || '/').split('/').filter(Boolean)[0];
    return isSupportedLocale(seg) ? seg : DEFAULT_LOCALE;
  }, [location.pathname]);

  const withLocale = useMemo(() => {
    return (p) => {
      if (!p) return `/${locale}`;
      if (p.startsWith('http')) return p;
      if (p.startsWith(`/${locale}`)) return p;
      if (p === '/') return `/${locale}`;
      return `/${locale}${p.startsWith('/') ? p : `/${p}`}`;
    };
  }, [locale]);

  const switchLocaleHref = useMemo(() => {
    return (toLocale) => {
      const parts = (location.pathname || '/').split('/').filter(Boolean);
      const hasLocale = isSupportedLocale(parts[0]);
      const rest = hasLocale ? parts.slice(1).join('/') : parts.join('/');
      const pathname = `/${toLocale}/${rest}`.replace(/\/+$/, '') || `/${toLocale}`;
      return `${pathname}${location.search || ''}${location.hash || ''}`;
    };
  }, [location.hash, location.pathname, location.search]);

  const labels = useMemo(() => {
    if (locale === 'fr') {
      return {
        products: 'Produits',
        solutions: 'Solutions',
        resources: 'Ressources',
        company: 'Entreprise',
        allProducts: 'Tous les produits',
        catalog: 'Catalogue',
        news: 'Actualités',
        quote: 'Demander un devis',
        productDesc1: 'Plateformes outdoor IPX6/IPX7 pour canaux B2B.',
        productDesc2: 'Modèles sans fil portables pour wholesale et retail.',
        productDesc3: 'Concepts cadeau, live commerce et recharge sans fil.',
        productDesc4: 'Écouteurs TWS pour private label, retail et promotion.',
        b2bDesc: 'MOQ, RFQ, OEM/ODM et workflow wholesale.',
        oemDesc: 'Logo, packaging, couleur, certification et adaptation marché.',
        privateLabelDesc: 'Créez des gammes enceintes et écouteurs pour marques et retailers.',
        labDesc: 'Batterie, étanchéité, certifications et rapports de test.',
        catalogDesc: 'Téléchargez le catalogue actuel sans prix pour revue sourcing.',
        faqDesc: 'Questions achats sur échantillons, paiement, certifications et logistique.',
        newsDesc: 'Éducation acheteur, sourcing enceintes étanches et actualités.',
        aboutDesc: 'Profil usine, capacité de production et histoire de l’entreprise.',
        contactDesc: 'Contact commercial par WeChat, email, téléphone ou demande.',
        helpDesc: 'Contacts support business et guide acheteur.',
        factoryBadge: 'Usine audio OEM',
        productFamilies: 'Familles produits',
        buyerShortcuts: 'Raccourcis acheteur',
        matchedModelTitle: 'Besoin du bon modèle ?',
        matchedModelDesc: 'Envoyez marché, quantité et besoins packaging.',
      };
    }
    if (locale === 'vi') {
      return {
        products: 'Sản phẩm',
        solutions: 'Giải pháp',
        resources: 'Tài nguyên',
        company: 'Công ty',
        allProducts: 'Tất cả sản phẩm',
        catalog: 'Catalog',
        news: 'Tin tức',
        quote: 'Yêu cầu báo giá',
        productDesc1: 'Nền tảng loa outdoor IPX6/IPX7 cho kênh B2B.',
        productDesc2: 'Model không dây portable cho bán sỉ và retail.',
        productDesc3: 'Concept quà tặng, live commerce và loa sạc không dây.',
        productDesc4: 'Tai nghe TWS cho private label, retail và promotion.',
        b2bDesc: 'MOQ, RFQ, phạm vi OEM/ODM và quy trình bán sỉ.',
        oemDesc: 'Logo, bao bì, màu, chứng nhận và hỗ trợ fit thị trường.',
        privateLabelDesc: 'Xây dòng loa và tai nghe cho thương hiệu và retailer.',
        labDesc: 'Pin, chống nước, chứng nhận và trung tâm báo cáo test.',
        catalogDesc: 'Tải catalog không giá hiện tại để review sourcing.',
        faqDesc: 'Câu hỏi mua hàng về mẫu, thanh toán, chứng nhận và logistics.',
        newsDesc: 'Nội dung cho buyer, sourcing loa chống nước và cập nhật.',
        aboutDesc: 'Hồ sơ nhà máy, quy mô sản xuất và câu chuyện công ty.',
        contactDesc: 'Liên hệ sales qua WeChat, email, điện thoại hoặc inquiry.',
        helpDesc: 'Liên hệ hỗ trợ business và hướng dẫn buyer.',
        factoryBadge: 'Nhà máy audio OEM',
        productFamilies: 'Nhóm sản phẩm',
        buyerShortcuts: 'Lối tắt cho buyer',
        matchedModelTitle: 'Cần model phù hợp?',
        matchedModelDesc: 'Gửi thị trường, số lượng và yêu cầu bao bì.',
      };
    }
    return {
      products: 'Products',
      solutions: 'Solutions',
      resources: 'Resources',
      company: 'Company',
      allProducts: 'All products',
      catalog: 'Catalog',
      news: 'News',
      quote: 'Request quote',
      productDesc1: 'IPX6/IPX7 outdoor speaker platforms for B2B channels.',
      productDesc2: 'Portable wireless models for wholesale and retail programs.',
      productDesc3: 'Gift, live commerce, and wireless charging speaker concepts.',
      productDesc4: 'TWS earbuds for private label, retail, and promotional lines.',
      b2bDesc: 'MOQ, RFQ inputs, OEM/ODM scope, and wholesale workflow.',
      oemDesc: 'Logo, packaging, color, certification, and market fit support.',
      privateLabelDesc: 'Build speaker and earbud lines for brands and retailers.',
      labDesc: 'Battery, waterproofing, certification, and test report hub.',
      catalogDesc: 'Download the current no-price catalog for sourcing review.',
      faqDesc: 'Procurement questions for samples, payment, and logistics.',
      newsDesc: 'Buyer education, waterproof speaker sourcing, and updates.',
      aboutDesc: 'Factory profile, production scale, and company story.',
      contactDesc: 'Contact sales by WeChat, email, phone, or inquiry form.',
      helpDesc: 'Business support contacts and buyer guidance.',
      factoryBadge: 'OEM Audio Factory',
      productFamilies: 'Product families',
      buyerShortcuts: 'Buyer shortcuts',
      matchedModelTitle: 'Need a matched model?',
      matchedModelDesc: 'Send market, quantity, and packaging needs.',
    };
  }, [locale]);

  const languageOptions = useMemo(
    () => [
      { code: 'en', flag: '🇺🇸', label: 'English' },
      { code: 'fr', flag: '🇫🇷', label: 'Français' },
      { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
    ],
    []
  );

  const currentLanguage = useMemo(
    () => languageOptions.find((o) => o.code === locale) || languageOptions[0],
    [languageOptions, locale]
  );

  const productLinks = useMemo(
    () => [
      {
        name: locale === 'fr' ? 'Enceintes étanches' : locale === 'vi' ? 'Loa chống nước' : 'Waterproof speakers',
        desc: labels.productDesc1,
        path: withLocale('/products?category=Waterproof%20Bluetooth%20Speaker'),
        icon: Waves,
      },
      {
        name: locale === 'fr' ? 'Enceintes Bluetooth' : locale === 'vi' ? 'Loa Bluetooth' : 'Bluetooth speakers',
        desc: labels.productDesc2,
        path: withLocale('/products?category=Normal%20Bluetooth%20Speaker'),
        icon: Headphones,
      },
      {
        name: locale === 'fr' ? 'Produits spécialisés' : locale === 'vi' ? 'Dòng đặc biệt' : 'Specialty speakers',
        desc: labels.productDesc3,
        path: withLocale('/products?category=Specialty%20Speaker'),
        icon: Sparkles,
      },
      {
        name: locale === 'fr' ? 'Écouteurs Bluetooth' : locale === 'vi' ? 'Tai nghe Bluetooth' : 'Bluetooth earbuds',
        desc: labels.productDesc4,
        path: withLocale('/products?category=Bluetooth%20Earbuds'),
        icon: BadgeCheck,
      },
    ],
    [labels, locale, withLocale]
  );

  const solutionLinks = useMemo(
    () => [
      {
        name: t(locale, 'nav.b2b'),
        desc: labels.b2bDesc,
        path: withLocale('/b2b'),
        icon: PackageSearch,
      },
      {
        name: locale === 'fr' ? 'Fabrication OEM/ODM' : locale === 'vi' ? 'Sản xuất OEM/ODM' : 'OEM/ODM manufacturing',
        desc: labels.oemDesc,
        path: withLocale('/b2b'),
        icon: Factory,
      },
      {
        name: locale === 'fr' ? 'Marque distributeur' : locale === 'vi' ? 'Private label' : 'Private label audio',
        desc: labels.privateLabelDesc,
        path: withLocale('/products'),
        icon: Boxes,
      },
    ],
    [labels, locale, withLocale]
  );

  const resourceLinks = useMemo(
    () => [
      {
        name: t(locale, 'nav.lab'),
        desc: labels.labDesc,
        path: withLocale('/lab'),
        icon: FlaskConical,
      },
      {
        name: labels.catalog,
        desc: labels.catalogDesc,
        path: withLocale('/catalog-downloads'),
        icon: Download,
      },
      {
        name: t(locale, 'nav.faq'),
        desc: labels.faqDesc,
        path: withLocale('/faq'),
        icon: HelpCircle,
      },
      {
        name: labels.news,
        desc: labels.newsDesc,
        path: withLocale('/news'),
        icon: Newspaper,
      },
    ],
    [labels, locale, withLocale]
  );

  const companyLinks = useMemo(
    () => [
      {
        name: t(locale, 'nav.about'),
        desc: labels.aboutDesc,
        path: withLocale('/about-us'),
        icon: Building2,
      },
      {
        name: t(locale, 'nav.contact'),
        desc: labels.contactDesc,
        path: withLocale('/contact'),
        icon: MessageCircle,
      },
      {
        name: locale === 'fr' ? 'Centre d’aide' : locale === 'vi' ? 'Trung tâm hỗ trợ' : 'Help center',
        desc: labels.helpDesc,
        path: withLocale('/help-center'),
        icon: BookOpenText,
      },
    ],
    [labels, locale, withLocale]
  );

  const featuredModels = useMemo(() => {
    const wanted = ['qw-g34', 'qw-g31', 'qw-g23', 'me-136'];
    return wanted
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean)
      .map((product) => {
        const localized = getLocalizedProduct(product, locale);
        const slug = getModelSlugById(product.id);
        return {
          id: product.id,
          name: localized.name,
          meta: product.ipxRating && product.ipxRating !== 'N/A' ? product.ipxRating : localized.category,
          path: slug ? withLocale(`/model/${slug}`) : withLocale(`/products/${product.id}`),
        };
      });
  }, [locale, withLocale]);

  const productSearchItems = useMemo(
    () =>
      products.map((p) => {
        const lp = getLocalizedProduct(p, locale);
        const slug = getModelSlugById(p.id);
        const productHref = slug ? withLocale(`/model/${slug}`) : withLocale(`/products/${p.id}`);
        return { p, lp, productHref };
      }),
    [locale, withLocale]
  );

  const activeProducts = isPathActive(location.pathname, withLocale('/products')) || location.pathname.includes('/model/');
  const activeSolutions = isPathActive(location.pathname, withLocale('/b2b'));
  const activeResources = resourceLinks.some((item) => isPathActive(location.pathname, item.path));
  const activeCompany = companyLinks.some((item) => isPathActive(location.pathname, item.path));

  const closeMobile = () => setMobileOpen(false);
  const goTo = (to) => {
    setSearchOpen(false);
    navigate(to);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[rgba(11,15,20,0.9)] text-white shadow-[0_10px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(11,15,20,0.82)]">
      <div className="mx-auto max-w-[1480px] px-3 sm:px-5 lg:px-7">
        <div className="flex h-[72px] items-center justify-between gap-3">
          <Link to={withLocale('/')} className="group flex min-w-0 items-center gap-3" aria-label="Puxijie home">
            <span className="flex h-12 w-[152px] items-center justify-start rounded-2xl bg-white px-3 shadow-sm transition-transform group-hover:-translate-y-0.5 sm:w-[188px]">
              <img
                src={getImageSrc(puxijieLogo)}
                srcSet={getImageSrcSet(puxijieLogo)}
                sizes="(max-width: 640px) 150px, 188px"
                alt="Puxijie waterproof Bluetooth speaker OEM/ODM manufacturer logo"
                width={220}
                height={54}
                className="h-10 w-auto object-contain"
                loading="eager"
                decoding="async"
              />
            </span>
            <span className="hidden border-l border-white/12 pl-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45 xl:block">
              {labels.factoryBadge}
            </span>
          </Link>

          <div className="hidden flex-1 justify-center lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="rounded-full border border-white/10 bg-white/[0.055] p-1 shadow-inner shadow-white/5">
                <NavigationMenuItem>
                  <NavLink to={withLocale('/')} active={location.pathname === withLocale('/')}>
                    {t(locale, 'nav.home')}
                  </NavLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={`h-10 rounded-full border-0 bg-transparent px-3.5 text-sm font-semibold ${
                      activeProducts ? 'bg-white text-gray-950' : 'text-white/78 hover:bg-white/10 hover:text-white'
                    } data-[state=open]:bg-white data-[state=open]:text-gray-950`}
                  >
                    {labels.products}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[760px] overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-950 shadow-2xl">
                      <div className="grid grid-cols-[1.1fr_0.9fr]">
                        <div className="p-4">
                          <div className="mb-2 flex items-center justify-between px-1">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">{labels.productFamilies}</p>
                            <Link to={withLocale('/products')} className="text-xs font-bold text-gray-950 hover:underline">
                              {labels.allProducts}
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {productLinks.map((item) => (
                              <MegaLink key={item.name} item={item} />
                            ))}
                          </div>
                        </div>
                        <div className="bg-[#f4f0e7] p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">{labels.buyerShortcuts}</p>
                          <div className="mt-3 space-y-2">
                            {featuredModels.map((model) => (
                              <NavigationMenuLink key={model.id} asChild>
                                <Link
                                  to={model.path}
                                  className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-gray-950 shadow-sm transition-transform hover:-translate-y-0.5"
                                >
                                  <span>{model.name}</span>
                                  <span className="rounded-full bg-gray-950 px-2 py-1 text-[11px] font-bold text-white">{model.meta}</span>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                          <Link
                            to={withLocale('/contact')}
                            className="mt-4 flex items-center justify-between rounded-2xl bg-gray-950 p-4 text-white transition-colors hover:bg-[#1b1f25]"
                          >
                            <span>
                              <span className="block text-sm font-bold">{labels.matchedModelTitle}</span>
                              <span className="mt-1 block text-xs text-white/60">{labels.matchedModelDesc}</span>
                            </span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={`h-10 rounded-full border-0 bg-transparent px-3.5 text-sm font-semibold ${
                      activeSolutions ? 'bg-white text-gray-950' : 'text-white/78 hover:bg-white/10 hover:text-white'
                    } data-[state=open]:bg-white data-[state=open]:text-gray-950`}
                  >
                    {labels.solutions}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[520px] rounded-2xl border border-gray-200 bg-white p-4 text-gray-950 shadow-2xl">
                      <div className="grid gap-1.5">
                        {solutionLinks.map((item) => (
                          <MegaLink key={item.name} item={item} />
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={`h-10 rounded-full border-0 bg-transparent px-3.5 text-sm font-semibold ${
                      activeResources ? 'bg-white text-gray-950' : 'text-white/78 hover:bg-white/10 hover:text-white'
                    } data-[state=open]:bg-white data-[state=open]:text-gray-950`}
                  >
                    {labels.resources}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[620px] rounded-2xl border border-gray-200 bg-white p-4 text-gray-950 shadow-2xl">
                      <div className="grid grid-cols-2 gap-1.5">
                        {resourceLinks.map((item) => (
                          <MegaLink key={item.name} item={item} />
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={`h-10 rounded-full border-0 bg-transparent px-3.5 text-sm font-semibold ${
                      activeCompany ? 'bg-white text-gray-950' : 'text-white/78 hover:bg-white/10 hover:text-white'
                    } data-[state=open]:bg-white data-[state=open]:text-gray-950`}
                  >
                    {labels.company}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[520px] rounded-2xl border border-gray-200 bg-white p-4 text-gray-950 shadow-2xl">
                      <div className="grid gap-1.5">
                        {companyLinks.map((item) => (
                          <MegaLink key={item.name} item={item} />
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                onBlur={() => setTimeout(() => setLangOpen(false), 120)}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 text-xs font-bold text-white/85 hover:bg-white/10 hover:text-white"
                aria-label="Language"
                aria-haspopup="menu"
                aria-expanded={langOpen ? 'true' : 'false'}
              >
                <span className="text-sm leading-none">{currentLanguage.flag}</span>
                <span className="hidden leading-none xl:inline">{currentLanguage.label}</span>
                <ChevronDown className="h-3.5 w-3.5 text-white/55" />
              </button>

              {langOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f14]/95 p-1.5 shadow-2xl backdrop-blur-xl"
                >
                  {languageOptions.map((opt) => (
                    <a
                      key={opt.code}
                      href={switchLocaleHref(opt.code)}
                      role="menuitem"
                      className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                        opt.code === locale ? 'bg-white text-gray-950' : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-label={`Switch language to ${opt.label}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="text-sm leading-none">{opt.flag}</span>
                        <span className="leading-none">{opt.label}</span>
                      </span>
                      {opt.code === locale ? <span className="text-[11px]">Active</span> : null}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border border-white/10 bg-white/[0.055] text-white hover:bg-white/10"
              aria-label="Search products"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4.5 w-4.5" />
            </Button>

            <Link
              to={withLocale('/catalog-downloads')}
              className="hidden h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 text-xs font-bold text-white/85 transition-colors hover:bg-white/10 hover:text-white xl:inline-flex"
            >
              <Download className="h-3.5 w-3.5" />
              {labels.catalog}
            </Link>

            <Link
              to={withLocale('/contact')}
              className="hidden h-10 items-center gap-2 rounded-full bg-[#c8a45d] px-4 text-xs font-black uppercase tracking-[0.12em] text-gray-950 shadow-[0_10px_26px_rgba(200,164,93,0.28)] transition-transform hover:-translate-y-0.5 lg:inline-flex"
            >
              {labels.quote}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <div className="hidden items-center gap-0.5 xl:flex">
              <a
                href="https://www.instagram.com/puxijie_tech/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61585567220467"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="rounded-full p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>

            <div className="lg:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open navigation menu" className="h-10 w-10 rounded-full border border-white/10 bg-white/[0.055] text-white hover:bg-white/10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto border-l border-white/10 bg-[#090d12] p-0 text-white">
                  <div className="border-b border-white/10 p-5">
                    <img
                      src={getImageSrc(puxijieLogo)}
                      srcSet={getImageSrcSet(puxijieLogo)}
                      sizes="180px"
                      alt="Puxijie"
                      width={200}
                      height={52}
                      className="h-11 w-auto rounded-xl bg-white px-3 py-1.5"
                    />
                    <p className="mt-4 text-sm leading-relaxed text-white/55">
                      OEM/ODM audio navigation for product sourcing, RFQ, testing, and business contact.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <MobileLink to={withLocale('/contact')} onClick={closeMobile} accent>
                        {labels.quote}
                      </MobileLink>
                      <MobileLink to={withLocale('/products')} onClick={closeMobile}>
                        {labels.allProducts}
                      </MobileLink>
                    </div>
                  </div>

                  <nav className="space-y-4 p-4">
                    <MobileLink to={withLocale('/')} onClick={closeMobile}>
                      {t(locale, 'nav.home')}
                    </MobileLink>

                    <MobileSection title={labels.products}>
                      {productLinks.map((item) => (
                        <MobileLink key={item.name} to={item.path} onClick={closeMobile}>
                          {item.name}
                        </MobileLink>
                      ))}
                    </MobileSection>

                    <MobileSection title={labels.solutions}>
                      {solutionLinks.map((item) => (
                        <MobileLink key={item.name} to={item.path} onClick={closeMobile}>
                          {item.name}
                        </MobileLink>
                      ))}
                    </MobileSection>

                    <MobileSection title={labels.resources}>
                      {resourceLinks.map((item) => (
                        <MobileLink key={item.name} to={item.path} onClick={closeMobile}>
                          {item.name}
                        </MobileLink>
                      ))}
                    </MobileSection>

                    <MobileSection title={labels.company}>
                      {companyLinks.map((item) => (
                        <MobileLink key={item.name} to={item.path} onClick={closeMobile}>
                          {item.name}
                        </MobileLink>
                      ))}
                    </MobileSection>

                    <MobileSection title="Language">
                      <div className="grid gap-1">
                        {languageOptions.map((opt) => (
                          <a
                            key={opt.code}
                            href={switchLocaleHref(opt.code)}
                            className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                              opt.code === locale ? 'bg-white text-gray-950' : 'text-white/75 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span className="inline-flex items-center gap-2">
                              <span>{opt.flag}</span>
                              <span>{opt.label}</span>
                            </span>
                            {opt.code === locale ? <span className="text-[11px] uppercase tracking-wider">Active</span> : null}
                          </a>
                        ))}
                      </div>
                    </MobileSection>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder={t(locale, 'commandSearch.placeholder')} />
        <CommandList>
          <CommandEmpty>{t(locale, 'commandSearch.noResults')}</CommandEmpty>
          <CommandGroup heading={t(locale, 'commandSearch.groupProducts')}>
            {productSearchItems.map(({ p, lp, productHref }) => (
              <CommandItem
                key={p.id}
                value={`${p.id} ${lp.name} ${lp.category} ${p.name} ${p.category} ${p.ipxRating ?? ''}`}
                onSelect={() => goTo(productHref)}
              >
                <span className="font-semibold">{lp.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{lp.category}</span>
                {p.ipxRating ? <span className="ml-auto text-xs text-muted-foreground">{p.ipxRating}</span> : null}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t(locale, 'commandSearch.groupQuickLinks')}>
            <CommandItem value="All products" onSelect={() => goTo(withLocale('/products'))}>
              {t(locale, 'commandSearch.browseAll')}
            </CommandItem>
            {[...productLinks, ...solutionLinks, ...resourceLinks, ...companyLinks].map((item) => (
              <CommandItem key={item.path + item.name} value={item.name} onSelect={() => goTo(item.path)}>
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}

export default Header;
