
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { m, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import ProductCard from '@/features/products/components/ProductCard.jsx';
import { products } from '@/features/products/data/products.js';
import { getSiteOrigin, t } from '@/shared/lib/i18n.js';
import { getHomeCopy, getLaunchCopy } from '@/features/home/data/homeCopy.js';
import { useLocale } from '@/shared/lib/useLocale.js';
import { getImageHeight, getImageSrc, getImageSrcSet, getImageWidth } from '@/shared/lib/resolveImage.js';
import seriesBanner1New from '@/features/home/assets/series-banner-1-new.webp?w=480;560;640;720;768;840;960;1080;1280&format=webp&quality=72&as=img';
import seriesBanner2New from '@/features/home/assets/series-banner-2-new.webp?w=400;480;560;640;720;768;840;960;1080&format=webp&quality=72&as=img';
import heroBanner1 from '@/features/home/assets/hero-banner-new-1.webp?w=480;640;768;960;1120;1280&format=webp&quality=68&as=img';
import heroBanner2 from '@/features/home/assets/hero-banner-new-2.webp?w=480;640;768;960;1120;1280&format=webp&quality=68&as=img';
import heroBanner3 from '@/features/home/assets/hero-banner-new-3.webp?w=480;640;768;960;1120;1280&format=webp&quality=68&as=img';
import heroBanner1Mobile from '@/features/home/assets/hero-banner-new-1.webp?w=320;360;400;440;480;520;560;640;720&format=webp&quality=58&as=img';
import heroBanner2Mobile from '@/features/home/assets/hero-banner-new-2.webp?w=320;360;400;440;480;520;560;640;720&format=webp&quality=58&as=img';
import heroBanner3Mobile from '@/features/home/assets/hero-banner-new-3.webp?w=320;360;400;440;480;520;560;640;720&format=webp&quality=58&as=img';
import g31NewLaunch from '@/features/home/assets/g31-new-launch.webp?w=480;640;768;960;1120;1280&format=webp&quality=70&as=img';
import g31NewLaunchMobile from '@/features/home/assets/g31-new-launch.webp?w=320;360;400;440;480;520;560;640;720&format=webp&quality=58&as=img';
import aboutFactoryBuilding from '@/features/home/assets/about-factory-building.webp?w=400;480;560;640;720;800;960;1080&format=webp&quality=72&as=img';
import patent01 from '@/features/home/assets/patents/patent-01.webp?w=320;480;640;800&format=webp&quality=78&as=img';
import patent02 from '@/features/home/assets/patents/patent-02.webp?w=320;480;640;800&format=webp&quality=78&as=img';
import patent03 from '@/features/home/assets/patents/patent-03.webp?w=320;480;640;800&format=webp&quality=78&as=img';
import patent04 from '@/features/home/assets/patents/patent-04.webp?w=320;480;640;800&format=webp&quality=78&as=img';
import patent05 from '@/features/home/assets/patents/patent-05.webp?w=320;480;640;800&format=webp&quality=78&as=img';
import patent06 from '@/features/home/assets/patents/patent-06.webp?w=320;480;640;800&format=webp&quality=78&as=img';
import patent07 from '@/features/home/assets/patents/patent-07.webp?w=320;480;640;800&format=webp&quality=78&as=img';
import patent08 from '@/features/home/assets/patents/patent-08.webp?w=320;480;640;800&format=webp&quality=78&as=img';
import patent09 from '@/features/home/assets/patents/patent-09.webp?w=320;480;640;800&format=webp&quality=78&as=img';

function HomePage() {
  const locale = useLocale();
  const featuredProducts = products;
  const prefersReducedMotion = useReducedMotion();
  const patentScrollerRef = useRef(null);
  const patentItemRefs = useRef([]);
  const [activePatentIndex, setActivePatentIndex] = useState(0);
  const [wechatCopied, setWechatCopied] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  );

  const homeCopy = useMemo(() => getHomeCopy(locale), [locale]);
  const launchCopy = useMemo(() => getLaunchCopy(locale), [locale]);

  const heroStats = homeCopy.stats;

  const b2bQuickFacts = useMemo(() => {
    if (locale === 'fr') {
      return ['MOQ dès 1 000 pcs/modèle', 'Réponse sous 24 h', 'OEM/ODM', 'CE/FCC/RoHS'];
    }
    if (locale === 'vi') {
      return ['MOQ từ 1.000 pcs/model', 'Phản hồi trong 24h', 'OEM/ODM', 'CE/FCC/RoHS'];
    }
    return ['MOQ from 1,000 pcs/model', 'Reply within 24h', 'OEM/ODM', 'CE/FCC/RoHS'];
  }, [locale]);

  const copyWechat = async () => {
    try {
      await navigator.clipboard.writeText('EricH0625');
      setWechatCopied(true);
      window.setTimeout(() => setWechatCopied(false), 1600);
    } catch {
      // Fallback for browsers that block clipboard API.
      try {
        window.prompt('WeChat ID', 'EricH0625');
      } catch {
        // ignore
      }
    }
  };

  const heroSlides = [
    {
      src: heroBanner1,
      mobileSrc: heroBanner1Mobile,
      alt: 'Puxijie waterproof Bluetooth speaker OEM/ODM manufacturer — hero banner 1',
    },
    {
      src: heroBanner2,
      mobileSrc: heroBanner2Mobile,
      alt: 'Puxijie wholesale waterproof speakers — hero banner 2',
    },
    {
      src: heroBanner3,
      mobileSrc: heroBanner3Mobile,
      alt: 'Puxijie OEM/ODM waterproof speaker factory — hero banner 3',
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const [heroHoverPaused, setHeroHoverPaused] = useState(false);
  const [heroVisibilityPaused, setHeroVisibilityPaused] = useState(false);
  const startXRef = useRef(null);
  const hasSwipedRef = useRef(false);
  const featuredScrollerRef = useRef(null);

  const heroPaused =
    prefersReducedMotion ||
    heroSlides.length <= 1 ||
    heroHoverPaused ||
    heroVisibilityPaused;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(max-width: 767px)');
    const onChange = (event) => setIsMobileViewport(event.matches);
    setIsMobileViewport(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (heroPaused) return;

    let t = null;
    const schedule = () => {
      t = window.setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % heroSlides.length);
        schedule();
      }, 3000);
    };
    schedule();
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [heroPaused, heroSlides.length]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const onVisibilityChange = () => {
      setHeroVisibilityPaused(document.visibilityState !== 'visible');
    };
    onVisibilityChange();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [prefersReducedMotion]);

  const goPrev = () => setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const goNext = () => setActiveSlide((prev) => (prev + 1) % heroSlides.length);

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    // Don't hijack pointer events meant for interactive UI (dots/buttons/links).
    if (e.target?.closest?.('button, a, [role="button"], [data-no-hero-swipe="true"]')) return;
    startXRef.current = e.clientX;
    hasSwipedRef.current = false;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerUp = (e) => {
    if (startXRef.current === null) return;
    const dx = e.clientX - startXRef.current;
    startXRef.current = null;
    if (hasSwipedRef.current) return;
    if (Math.abs(dx) < 50) return;
    hasSwipedRef.current = true;
    if (dx > 0) goPrev();
    else goNext();
  };

  const handlePointerCancel = () => {
    startXRef.current = null;
    hasSwipedRef.current = false;
  };

  const handleHeroKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  };

  const handleFeaturedWheel = (e) => {
    const el = featuredScrollerRef.current;
    if (!el) return;
    const isMostlyVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
    if (!isMostlyVertical) return;
    el.scrollLeft += e.deltaY;
    e.preventDefault();
  };

  const patents = useMemo(() => {
    const items = [
      { id: 'p01', title: 'Patent 01', src: patent01 },
      { id: 'p02', title: 'Patent 02', src: patent02 },
      { id: 'p03', title: 'Patent 03', src: patent03 },
      { id: 'p04', title: 'Patent 04', src: patent04 },
      { id: 'p05', title: 'Patent 05', src: patent05 },
      { id: 'p06', title: 'Patent 06', src: patent06 },
      { id: 'p07', title: 'Patent 07', src: patent07 },
      { id: 'p08', title: 'Patent 08', src: patent08 },
      { id: 'p09', title: 'Patent 09', src: patent09 },
    ];
    return items.map((p) => ({
      ...p,
      alt: `Puxijie ${p.title} patent certificate — waterproof Bluetooth speaker OEM/ODM`,
    }));
  }, []);

  useEffect(() => {
    const el = patentScrollerRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Avoid forced reflow: rely on scroll geometry instead of getBoundingClientRect().
        const centerX = el.scrollLeft + el.clientWidth / 2;
        let bestIdx = 0;
        let bestDist = Number.POSITIVE_INFINITY;

        for (let i = 0; i < patentItemRefs.current.length; i++) {
          const node = patentItemRefs.current[i];
          if (!node) continue;
          const c = node.offsetLeft + node.offsetWidth / 2;
          const d = Math.abs(c - centerX);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
          }
        }

        setActivePatentIndex((prev) => (prev === bestIdx ? prev : bestIdx));
      });
    };

    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const scrollToPatent = (idx) => {
    const el = patentScrollerRef.current;
    const node = patentItemRefs.current[idx];
    if (!el || !node) return;
    const reduce = prefersReducedMotion ? 'auto' : 'smooth';
    node.scrollIntoView({ behavior: reduce, inline: 'center', block: 'nearest' });
  };

  const manufacturingPoints = homeCopy.manufacturingPoints;
  const partnershipPoints = homeCopy.partnershipPoints;
  const buyerPaths = homeCopy.buyerPaths;

  const homeSeo = useMemo(() => {
    if (locale === 'en') {
      return {
        title: 'Waterproof Bluetooth Speaker OEM/ODM Manufacturer | Puxijie',
        desc:
          'Puxijie is a top-10 China OEM/ODM audio manufacturer since 2013. ISO 9001 & ISO 14001 certified, Six Sigma quality, 5,200 sqm facility. Waterproof Bluetooth speakers, portable speakers, and earbuds for procurement, private label, and wholesale across 45+ countries.',
        keywords:
          'waterproof bluetooth speaker manufacturer, top 10 bluetooth speaker factory China, waterproof speaker OEM ODM, wholesale waterproof speakers, private label bluetooth speaker, IPX7 IPX8 waterproof speaker supplier, ISO 9001 speaker manufacturer Dongguan, bluetooth speaker for retailers',
        ogTitle: 'Top-10 China Waterproof Bluetooth Speaker OEM/ODM Manufacturer | Puxijie',
        ogDesc:
          'One of China\'s top-10 OEM/ODM audio manufacturers. Since 2013 — ISO 9001 & ISO 14001 certified, Six Sigma quality, 5,200 sqm facility, 320+ employees, 250,000+ monthly capacity, exporting to 45+ countries. IPX6/IPX7/IPX8 waterproof speakers, portable wireless speakers, Bluetooth earbuds.',
        canonical: `${getSiteOrigin()}/en/`,
        ogImage: `${getSiteOrigin()}/images/og-image.svg`,
        ogLocale: 'en_US',
      };
    }
    if (locale === 'fr') {
      return {
        title: 'Puxijie | Enceintes étanches OEM/ODM',
        desc: t(locale, 'home.subhead'),
        canonical: `${getSiteOrigin()}/fr/`,
        ogTitle: 'Puxijie | Enceintes étanches OEM/ODM',
        ogDesc: t(locale, 'home.subhead'),
        ogImage: `${getSiteOrigin()}${getImageSrc(heroBanner1)}`,
        ogLocale: 'fr_FR',
      };
    }
    if (locale === 'vi') {
      return {
        title: 'Puxijie | Loa chống nước OEM/ODM',
        desc: t(locale, 'home.subhead'),
        canonical: `${getSiteOrigin()}/vi/`,
        ogTitle: 'Puxijie | Loa chống nước OEM/ODM',
        ogDesc: t(locale, 'home.subhead'),
        ogImage: `${getSiteOrigin()}${getImageSrc(heroBanner1)}`,
        ogLocale: 'vi_VN',
      };
    }
    return {
      title: 'Puxijie | OEM/ODM Outdoor Waterproof Speakers',
      desc: t(locale, 'home.subhead'),
      canonical: `${getSiteOrigin()}/${locale}/`,
      ogTitle: 'Puxijie | OEM/ODM Outdoor Waterproof Speakers',
      ogDesc: t(locale, 'home.subhead'),
      ogImage: `${getSiteOrigin()}${getImageSrc(heroBanner1)}`,
      ogLocale: 'en_US',
    };
  }, [locale]);

  const homeTitle = homeSeo.title;
  const homeDesc = homeSeo.desc;
  const homeOgImage = homeSeo.ogImage;
  const homeCanonical = homeSeo.canonical;

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>{homeTitle}</title>
        <meta name="description" content={homeDesc} />
        {locale === 'en' ? <meta name="keywords" content={homeSeo.keywords} /> : null}
        {locale === 'en' ? <meta name="robots" content="index, follow" /> : null}
        <link rel="canonical" href={homeCanonical} />
        {['en', 'fr', 'vi'].map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`${getSiteOrigin()}/${l}/`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${getSiteOrigin()}/en/`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Puxijie" />
        <meta property="og:url" content={homeCanonical} />
        <meta property="og:title" content={homeSeo.ogTitle ?? homeTitle} />
        <meta property="og:description" content={homeSeo.ogDesc ?? homeDesc} />
        <meta property="og:image" content={homeOgImage} />
        {locale === 'en' ? <meta property="og:locale" content={homeSeo.ogLocale} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={homeSeo.ogTitle ?? homeTitle} />
        <meta name="twitter:description" content={locale === 'en' ? homeSeo.ogDesc : homeDesc} />
        <meta name="twitter:image" content={homeOgImage} />
        <link
          rel="preload"
          as="image"
          href={getImageSrc(isMobileViewport ? heroBanner1Mobile : heroBanner1)}
          {...(getImageSrcSet(isMobileViewport ? heroBanner1Mobile : heroBanner1)
            ? {
                imagesrcset: getImageSrcSet(isMobileViewport ? heroBanner1Mobile : heroBanner1),
                imagesizes: '(max-width: 768px) 100vw, 100vw',
              }
            : {})}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebSite',
                '@id': `${getSiteOrigin()}/#website`,
                url: `${getSiteOrigin()}/${locale}/`,
                name: 'Puxijie',
                description: homeSeo.desc ?? homeDesc,
                inLanguage: locale,
                publisher: {
                  '@type': 'Organization',
                  '@id': `${getSiteOrigin()}/#organization`,
                  name: 'Puxijie',
                  url: `${getSiteOrigin()}/${locale}/`,
                },
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${getSiteOrigin()}/${locale}/products?q={search_term_string}`,
                  },
                  'query-input': 'required name=search_term_string',
                },
              },
            ],
          })}
        </script>
      </Helmet>

      <div
        className="min-h-screen bg-[#f3efe8] sm:pb-0"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 7rem)' }}
      >
        <Header />

        {/* Hero Section (Image Banner Carousel) */}
        <section
          className="relative overflow-hidden border-b border-[#d8d0c2] bg-black min-h-[520px] sm:min-h-[620px] lg:min-h-[720px]"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerCancel}
          onMouseEnter={() => setHeroHoverPaused(true)}
          onMouseLeave={() => setHeroHoverPaused(false)}
          onFocusCapture={() => setHeroHoverPaused(true)}
          onBlurCapture={() => setHeroHoverPaused(false)}
          onKeyDown={handleHeroKeyDown}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Homepage hero carousel"
        >
          <div className="absolute inset-0 z-0">
            {heroSlides.map((slide, idx) => {
              return (
                <picture key={`hero-${idx}`} id={`hero-slide-${idx}`} className={isMobileViewport && idx !== activeSlide ? 'hidden' : ''}>
                  <source media="(max-width: 767px)" srcSet={getImageSrcSet(slide.mobileSrc)} />
                  <img
                    src={getImageSrc(slide.src)}
                    srcSet={getImageSrcSet(slide.src)}
                    sizes="(max-width: 767px) 100vw, 100vw"
                    alt={slide.alt}
                    width={getImageWidth(slide.src, 1280)}
                    height={getImageHeight(slide.src, 900)}
                    loading={idx === activeSlide ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={idx === activeSlide ? 'high' : 'low'}
                    className={`absolute inset-0 h-full w-full object-cover object-center transition-[opacity,transform] ${
                      prefersReducedMotion ? 'duration-0' : 'duration-700'
                    } ease-out ${
                      idx === activeSlide ? 'opacity-100 scale-[1.03]' : 'opacity-0 scale-[1]'
                    }`}
                  />
                </picture>
              );
            })}
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_70%,rgba(0,0,0,0.55)_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/15" />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-4 pb-12 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24 lg:pt-32">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-5xl space-y-6 sm:space-y-8 text-center"
            >
              <div className="inline-flex items-center rounded-full border border-white/15 bg-[#fcfaf6]/10 px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm font-medium text-white backdrop-blur-sm">
                {t(locale, 'home.badge')}
              </div>
              <h1
                className="text-4xl font-bold text-white md:text-6xl lg:text-7xl"
                style={{ lineHeight: locale === 'en' ? 1.04 : 1.12 }}
              >
                <span className="block">{homeCopy.heroLine1}</span>
                <span className="mt-2 block sm:mt-3">{homeCopy.heroLine2}</span>
              </h1>
              <p className="mx-auto max-w-3xl text-base leading-relaxed text-white/80 sm:text-lg md:text-xl">
                {homeCopy.heroDesc}
              </p>
              <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
                {homeCopy.heroTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full border border-white/15 bg-[#fcfaf6]/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur-sm sm:text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Mobile-first B2B facts */}
              <div className="sm:hidden">
                <div className="flex flex-wrap justify-center gap-2">
                  {b2bQuickFacts.map((fact) => (
                    <span
                      key={fact}
                      className="inline-flex items-center rounded-full border border-white/15 bg-[#fcfaf6]/10 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm"
                    >
                      {fact}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-3 sm:pt-4">
                <Button asChild size="lg" className="bg-[#fcfaf6] text-[#1f2a24] hover:bg-[#fcfaf6]/90 active:scale-[0.98] transition-all duration-200">
                  <Link to={`/${locale}/b2b`}>
                    {t(locale, 'home.ctaQuote')} <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="bg-[#fcfaf6]/10 border border-white/20 text-white hover:bg-[#fcfaf6]/15 active:scale-[0.98] transition-all duration-200 backdrop-blur-sm">
                  <Link to={`/${locale}/products`}>
                    {t(locale, 'home.ctaBrowse')}
                  </Link>
                </Button>
                <Link
                  to={`/${locale}/lab`}
                  className="sm:hidden mt-1 inline-flex items-center justify-center text-sm font-semibold text-white/85 underline-offset-4 hover:underline"
                >
                  {t(locale, 'home.ctaLab')}
                </Link>
              </div>
              <div className="hidden sm:block">
                <Link
                  to={`/${locale}/lab`}
                  className="inline-flex items-center justify-center text-sm font-semibold text-white/85 underline-offset-4 hover:underline"
                >
                  {t(locale, 'home.ctaLab')}
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 sm:gap-4 sm:pt-6 md:grid-cols-4">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/15 bg-[#fcfaf6]/10 p-3 sm:p-4 shadow-sm backdrop-blur transition-all duration-300 hover:bg-[#fcfaf6]/15 hover:-translate-y-0.5"
                  >
                    <div className="text-center text-base font-bold text-white sm:text-lg md:text-xl">{stat.value}</div>
                    <div className="mt-1 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </m.div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-5 sm:bottom-8 left-0 right-0 z-20">
            <div className="flex justify-center gap-1.5 sm:gap-2">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-controls={`hero-slide-${idx}`}
                  aria-current={idx === activeSlide ? 'true' : 'false'}
                  onClick={() => setActiveSlide(idx)}
                  data-no-hero-swipe="true"
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <span
                    aria-hidden
                    className={`h-2.5 w-2.5 rounded-full border transition-all duration-200 ${
                      idx === activeSlide ? 'bg-[#fcfaf6] border-white scale-110' : 'bg-[#fcfaf6]/45 border-white/40 hover:bg-[#fcfaf6]/70'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* New Product Launch */}
        <section className="cv-auto border-b border-[#d8d0c2] bg-[#0f1512] py-10 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-amber-100/20 bg-black/40 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="order-2 p-6 sm:p-8 lg:order-1 lg:col-span-5 lg:p-10">
                  <span className="inline-flex items-center rounded-full border border-amber-200/35 bg-amber-100/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-100">
                    {launchCopy.badge}
                  </span>
                  <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">{launchCopy.title}</h2>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#f2e8d8]/90 sm:text-base">{launchCopy.desc}</p>
                  <div className="mt-7">
                    <Button asChild className="bg-amber-100 text-[#1f2a24] hover:bg-amber-50">
                      <Link to={`/${locale}/model/g31`}>
                        {launchCopy.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="order-1 lg:order-2 lg:col-span-7">
                  <picture>
                    <source media="(max-width: 767px)" srcSet={getImageSrcSet(g31NewLaunchMobile)} />
                    <img
                      src={getImageSrc(g31NewLaunch)}
                      srcSet={getImageSrcSet(g31NewLaunch)}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, min(700px, 55vw)"
                      alt="G31 IPX6 waterproof Bluetooth speaker — Puxijie OEM/ODM new launch product visual"
                      width={getImageWidth(g31NewLaunch, 1280)}
                      height={getImageHeight(g31NewLaunch, 900)}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="cv-auto py-12 sm:py-16 bg-[#f3efe8] border-b border-[#d8d0c2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 sm:mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1f2a24]" style={{ letterSpacing: '-0.02em' }}>
                {t(locale, 'home.collectionsTitle')}
              </h2>
              <p className="text-lg text-[#5e675f] max-w-2xl mx-auto">
                {t(locale, 'home.collectionsDesc')}
              </p>
            </m.div>

            <div className="mb-3 flex items-center justify-between lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#505750]">{homeCopy.swipe}</p>
              <p className="text-xs text-[#505750]">{featuredProducts.length} {homeCopy.items}</p>
            </div>

            <div
              ref={featuredScrollerRef}
              onWheel={handleFeaturedWheel}
              className="relative -mx-4 px-4 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="flex gap-4 sm:gap-6 pb-2 pr-6">
                {featuredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex-none w-[248px] sm:w-[320px] lg:w-[360px] xl:w-[calc((100%-4*1.5rem)/5)] snap-start"
                  >
                    <ProductCard product={product} index={index} />
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" variant="secondary" className="bg-[#fcfaf6] border border-[#d8d0c2] text-[#1f2a24] hover:bg-[#ece6dc] active:scale-[0.98] transition-all duration-200">
                <Link to={`/${locale}/products`}>
                  {t(locale, 'home.ctaBrowse')} <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="cv-auto border-b border-[#d8d0c2] bg-[#fcfaf6] py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#505750]">{homeCopy.buyerIntro.eyebrow}</p>
                <h2 className="mt-2 text-3xl font-bold text-[#1f2a24] md:text-4xl">
                  {homeCopy.buyerIntro.title}
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-relaxed text-[#5e675f]">
                {homeCopy.buyerIntro.desc}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {buyerPaths.map((path) => (
                <Link
                  key={path.label}
                  to={path.href}
                  className="group border border-[#d8d0c2] bg-[#f3efe8] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1f2a24] hover:bg-[#fcfaf6] hover:shadow-lg"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-[#505750]">{path.label}</p>
                  <h3 className="mt-4 text-2xl font-bold leading-tight text-[#1f2a24]">{path.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#5e675f]">{path.description}</p>
                  <span className="mt-6 inline-flex items-center text-sm font-semibold text-[#1f2a24]">
                    {path.cta}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile sticky CTA bar (B2B buyers) */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent" />
          <div className="border-t border-[#d8d0c2] bg-[#fcfaf6]/92 backdrop-blur supports-[backdrop-filter]:bg-[#fcfaf6]/75">
            <div
              className="mx-auto max-w-7xl px-4 pt-3"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
            >
              <div className="flex items-center gap-2">
                <Link
                  to={`/${locale}/b2b`}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#1f2a24] px-4 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.99] transition hover:bg-[#18211c]"
                >
                  {t(locale, 'home.ctaQuote')}
                </Link>
                <Link
                  to={`/${locale}/catalog-downloads`}
                  className="inline-flex items-center justify-center rounded-xl border border-[#d8d0c2] bg-[#fcfaf6] px-4 py-3 text-sm font-semibold text-[#1f2a24] shadow-sm active:scale-[0.99] transition"
                >
                  {t(locale, 'contactPage.linkCatalogTitle')}
                </Link>
                <button
                  type="button"
                  onClick={copyWechat}
                  className="inline-flex items-center justify-center rounded-xl border border-[#d8d0c2] bg-[#fcfaf6] px-3 py-3 text-sm font-semibold text-[#1f2a24] shadow-sm active:scale-[0.99] transition"
                  aria-label={t(locale, 'contactPage.copyWechat')}
                >
                  {wechatCopied ? t(locale, 'contactPage.copied') : 'WeChat'}
                </button>
              </div>
              <div className="mt-2 text-[11px] text-[#5e675f]">
                WeChat: <span className="font-semibold text-[#1f2a24]">EricH0625</span> · Email: <span className="font-semibold text-[#1f2a24]">inquiry@puxijietech.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates & Patents */}
        <section className="cv-auto py-14 sm:py-16 bg-[#fcfaf6] border-b border-[#d8d0c2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1f2a24]" style={{ letterSpacing: '-0.02em' }}>
                  {homeCopy.certTitle}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#5e675f] max-w-2xl">
                  {homeCopy.certDesc}
                </p>
              </div>
            </m.div>

            <div
              ref={patentScrollerRef}
              className="mt-8 -mx-4 px-4 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="flex gap-4 pb-2 pr-6">
                {patents.map((p) => (
                  <div
                    key={p.id}
                    ref={(node) => {
                      // Avoid O(n) indexOf on every render; preserve stable indices.
                      const idx = patents.findIndex((x) => x.id === p.id);
                      if (idx !== -1) patentItemRefs.current[idx] = node;
                    }}
                    className="snap-center flex-none w-[220px] sm:w-[260px]"
                  >
                    <div className="group rounded-3xl border border-[#d8d0c2] bg-[#fcfaf6] overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                      <div className="relative aspect-[7/10] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_45%,#f1f5f9_100%)]">
                        <div className="pointer-events-none absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.22)_1px,transparent_0)] [background-size:16px_16px]" />
                        <img
                          src={getImageSrc(p.src)}
                          srcSet={getImageSrcSet(p.src)}
                          sizes="(max-width: 640px) 220px, 260px"
                          alt={p.alt}
                          width={getImageWidth(p.src, 520)}
                          height={getImageHeight(p.src, 735)}
                          loading="lazy"
                          decoding="async"
                          className="relative z-[1] h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="px-4 py-3 border-t border-[#e7dfd2]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-[#1f2a24]">{p.title}</div>
                          <span className="inline-flex items-center rounded-full border border-[#d8d0c2] bg-[#f3efe8] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#525b54]">
                            {homeCopy.patentBadge}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-[#5e675f]">
                          {homeCopy.patentNote}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots indicator */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {patents.map((p, idx) => {
                const isActive = idx === activePatentIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-label={`${homeCopy.viewPatent} ${p.title}`}
                    aria-current={isActive ? 'true' : 'false'}
                    onClick={() => scrollToPatent(idx)}
                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f2a24]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfaf6]"
                  >
                    <span
                      aria-hidden
                      className={`h-2.5 w-2.5 rounded-full border transition-all duration-200 ${
                        isActive
                          ? 'bg-[#1f2a24] border-[#1f2a24] scale-110'
                          : 'bg-[#c7bbab] border-[#c7bbab] hover:bg-[#b8aa98] hover:border-[#b8aa98]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section className="cv-auto py-16 md:py-24 bg-[#fcfaf6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1f2a24]" style={{ letterSpacing: '-0.02em' }}>
                {t(locale, 'home.categoriesTitle')}
              </h2>
              <p className="text-lg text-[#5e675f] max-w-2xl mx-auto">
                {t(locale, 'home.categoriesDesc')}
              </p>
            </m.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <m.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2"
              >
                <Link to={`/${locale}/products?category=Waterproof%20Bluetooth%20Speaker`} className="group block">
                  <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-[#ece6dc] border border-[#d8d0c2]">
                    <img
                      src={getImageSrc(seriesBanner1New)}
                      srcSet={getImageSrcSet(seriesBanner1New)}
                      sizes="(max-width: 1280px) calc(100vw - 2rem), min(1200px, calc(100vw - 2rem))"
                      alt="Waterproof Bluetooth speaker manufacturer — OEM/ODM and wholesale programs by Puxijie"
                      width={getImageWidth(seriesBanner1New, 2100)}
                      height={getImageHeight(seriesBanner1New, 900)}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h3 className="text-3xl font-bold mb-2 text-white">{homeCopy.categoryCards[0].title}</h3>
                      <p className="text-gray-200 max-w-2xl">
                        {homeCopy.categoryCards[0].desc}
                      </p>
                    </div>
                  </div>
                </Link>
              </m.div>

              <m.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Link to={`/${locale}/products?category=Normal%20Bluetooth%20Speaker`} className="group block">
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#ece6dc] border border-[#d8d0c2]">
                    <img
                      src={getImageSrc(seriesBanner2New)}
                      srcSet={getImageSrcSet(seriesBanner2New)}
                      sizes="(max-width: 1024px) calc(100vw - 2rem), min(592px, calc((min(100vw, 80rem) - 3.5rem) / 2))"
                      alt="Portable Bluetooth speaker OEM/ODM supplier — wholesale models by Puxijie"
                      width={getImageWidth(seriesBanner2New, 1600)}
                      height={getImageHeight(seriesBanner2New, 900)}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold mb-2 text-white">{homeCopy.categoryCards[1].title}</h3>
                      <p className="text-gray-200">
                        {homeCopy.categoryCards[1].desc}
                      </p>
                    </div>
                  </div>
                </Link>
              </m.div>

              <m.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link to={`/${locale}/products?category=Specialty%20Speaker`} className="group block">
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#ece6dc] border border-[#d8d0c2]">
                    <img
                      src={getImageSrc(heroBanner3)}
                      srcSet={getImageSrcSet(heroBanner3)}
                      sizes="(max-width: 1024px) calc(100vw - 2rem), min(592px, calc((min(100vw, 80rem) - 3.5rem) / 2))"
                      alt="Specialty speaker OEM/ODM supplier — gift and niche market speaker programs by Puxijie"
                      width={getImageWidth(heroBanner3, 1600)}
                      height={getImageHeight(heroBanner3, 900)}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold mb-2 text-white">{homeCopy.categoryCards[2].title}</h3>
                      <p className="text-gray-200">
                        {homeCopy.categoryCards[2].desc}
                      </p>
                    </div>
                  </div>
                </Link>
              </m.div>
            </div>
          </div>
        </section>

        {/* About Puxijie (replaces Product Series) */}
        <section className="cv-auto py-16 md:py-24 bg-[#fcfaf6] border-t border-[#d8d0c2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 md:mb-14"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1f2a24]" style={{ letterSpacing: '-0.02em' }}>
                {homeCopy.partnerTitle}
              </h2>
              <p className="text-lg text-[#5e675f] max-w-3xl mx-auto">
                {homeCopy.partnerDesc}
              </p>
            </m.div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <m.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl border border-[#d8d0c2] bg-[#ece6dc] shadow-sm aspect-[4/3]"
              >
                <img
                  src={getImageSrc(aboutFactoryBuilding)}
                  srcSet={getImageSrcSet(aboutFactoryBuilding)}
                  sizes="(max-width: 1024px) 100vw, 600px"
                  alt="Puxijie factory — waterproof Bluetooth speaker OEM/ODM manufacturing facility in China"
                  width={getImageWidth(aboutFactoryBuilding, 1200)}
                  height={getImageHeight(aboutFactoryBuilding, 900)}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/10 to-transparent" />
              </m.div>

              <m.div
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center rounded-full border border-[#d8d0c2] bg-[#f3efe8] px-3 py-1 text-xs font-semibold text-[#1f2a24]">
                  {homeCopy.partnerBadge}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1f2a24]">
                  {homeCopy.partnerSubtitle}
                </h3>
                <p className="text-base sm:text-lg text-[#525b54] leading-relaxed">
                  {homeCopy.partnerBody}
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {homeCopy.partnerBullets.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-2xl border border-[#d8d0c2] bg-[#fcfaf6] p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#1f2a24] flex-shrink-0" />
                      <span className="text-sm text-[#525b54]">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                  to={`/${locale}/about-us`}
                    className="inline-flex items-center justify-center rounded-xl bg-[#1f2a24] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#18211c] active:scale-[0.98]"
                  >
                    {homeCopy.learnMore} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                  to={`/${locale}/contact`}
                    className="inline-flex items-center justify-center rounded-xl border border-[#d8d0c2] bg-[#fcfaf6] px-6 py-3 text-sm font-semibold text-[#1f2a24] shadow-sm transition-colors hover:bg-[#f3efe8] active:scale-[0.98]"
                  >
                    {homeCopy.contactSales}
                  </Link>
                </div>
              </m.div>
            </div>
          </div>
        </section>

        {/* Manufacturing & Partnership */}
        <section className="cv-auto border-y border-[#d8d0c2] bg-[#f3efe8] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-10 md:mb-14 text-center"
            >
              <h2 className="text-3xl font-bold text-[#1f2a24] md:text-4xl" style={{ letterSpacing: '-0.02em' }}>
                {homeCopy.workflowTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-[#5e675f]">
                {homeCopy.workflowDesc}
              </p>
            </m.div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <m.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl border border-[#d8d0c2] bg-[#fcfaf6] p-8 shadow-sm"
              >
                <h3 className="text-2xl font-bold text-[#1f2a24]">{homeCopy.whyTitle}</h3>
                <ul className="mt-6 space-y-4">
                  {manufacturingPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[#525b54]">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1f2a24]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </m.div>

              <m.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-3xl border border-[#d8d0c2] bg-[#fcfaf6] p-8 shadow-sm"
              >
                <h3 className="text-2xl font-bold text-[#1f2a24]">{homeCopy.workflowListTitle}</h3>
                <ul className="mt-6 space-y-4">
                  {partnershipPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[#525b54]">
                      <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#c7bbab] bg-[#f3efe8] text-xs font-semibold text-[#1f2a24]">
                        {partnershipPoints.indexOf(point) + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 rounded-2xl border border-[#d8d0c2] bg-[#f3efe8] p-5">
                  <p className="text-sm font-medium leading-relaxed text-[#525b54]">
                    {homeCopy.quoteHint}
                  </p>
                </div>
              </m.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cv-auto py-16 md:py-24 bg-[#fcfaf6] border-t border-[#d8d0c2]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-[#1f2a24]" style={{ letterSpacing: '-0.02em' }}>
                {homeCopy.ctaTitle}
              </h2>
              <p className="text-lg text-[#5e675f] max-w-2xl mx-auto">
                {homeCopy.ctaDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="bg-[#1f2a24] text-white hover:bg-[#18211c] active:scale-[0.98] transition-all duration-200">
                  <Link to={`/${locale}/b2b`}>
                    {homeCopy.ctaQuote}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="bg-[#fcfaf6] border border-[#c7bbab] text-[#1f2a24] hover:bg-[#ece6dc] active:scale-[0.98] transition-all duration-200">
                  <Link to={`/${locale}/products`}>
                    {homeCopy.ctaCatalog}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="bg-[#fcfaf6] border border-[#c7bbab] text-[#1f2a24] hover:bg-[#ece6dc] active:scale-[0.98] transition-all duration-200">
                  <Link to={`/${locale}/lab`}>
                    {homeCopy.ctaLab}
                  </Link>
                </Button>
              </div>
            </m.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default HomePage;
