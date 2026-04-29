
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { m } from 'framer-motion';
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  MessageCircle,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  FileSpreadsheet,
  HelpCircle,
  FlaskConical,
  Building2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import { Button } from '@/shared/ui/button';
import { getSiteOrigin, t } from '@/shared/lib/i18n.js';
import { useLocale } from '@/shared/lib/useLocale.js';

function ContactPage() {
  const locale = useLocale();
  const [wechatCopied, setWechatCopied] = useState(false);
  const businessEmail = 'contact@puxijietech.com';
  const phone = '+86 13532328175';
  const wechatId = 'EricH0625';

  const addressTitle = "Dongguan Phoenix Mt. Ind'l. Zone";
  const addressLines = ['49 Fenghuanger Rd', 'Humen, Dongguan', 'Guangdong Province, China, 523900'];
  const sourcingHint = {
    en: (
      <>
        For <span className="font-semibold text-gray-900">outdoor waterproof Bluetooth speaker</span> OEM/ODM & wholesale quotes, send your target quantity, IPX rating, and branding requirements (private label/packaging).
      </>
    ),
    fr: (
      <>
        Pour un devis OEM/ODM ou grossiste d&apos;<span className="font-semibold text-gray-900">enceintes Bluetooth étanches outdoor</span>, indiquez quantité cible, indice IPX et besoins de marque (private label/packaging).
      </>
    ),
    vi: (
      <>
        Để nhận báo giá OEM/ODM hoặc bán sỉ cho <span className="font-semibold text-gray-900">loa Bluetooth chống nước outdoor</span>, hãy gửi số lượng mục tiêu, chuẩn IPX và yêu cầu thương hiệu (private label/bao bì).
      </>
    ),
  };

  const mapLat = 22.75181;
  const mapLng = 113.69522;
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapLat},${mapLng}&z=15&output=embed`;
  const mapOpenInGoogleUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    "Dongguan Phoenix Mt. Ind'l. Zone, 49 Fenghuanger Rd, Humen, Dongguan, Guangdong, China"
  )}`;

  const copyWechat = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(wechatId);
      setWechatCopied(true);
      window.setTimeout(() => setWechatCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, []);

  const prepareItems = [
    t(locale, 'contactPage.prepare1'),
    t(locale, 'contactPage.prepare2'),
    t(locale, 'contactPage.prepare3'),
    t(locale, 'contactPage.prepare4'),
    t(locale, 'contactPage.prepare5'),
  ];

  const quickLinks = [
    {
      to: `/${locale}/b2b`,
      icon: Building2,
      title: t(locale, 'contactPage.linkB2bTitle'),
      desc: t(locale, 'contactPage.linkB2bDesc'),
    },
    {
      to: `/${locale}/catalog-downloads`,
      icon: FileSpreadsheet,
      title: t(locale, 'contactPage.linkCatalogTitle'),
      desc: t(locale, 'contactPage.linkCatalogDesc'),
    },
    {
      to: `/${locale}/faq`,
      icon: HelpCircle,
      title: t(locale, 'contactPage.linkFaqTitle'),
      desc: t(locale, 'contactPage.linkFaqDesc'),
    },
    {
      to: `/${locale}/lab`,
      icon: FlaskConical,
      title: t(locale, 'contactPage.linkLabTitle'),
      desc: t(locale, 'contactPage.linkLabDesc'),
    },
  ];

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>
          {locale === 'en'
            ? 'Contact Puxijie — Outdoor Waterproof Speaker OEM/ODM & Wholesale'
            : `${t(locale, 'contactPage.title')} | Puxijie`}
        </title>
        <meta
          name="description"
          content={
            locale === 'en'
              ? 'Contact Puxijie for outdoor portable wireless waterproof speaker OEM/ODM pricing, private label inquiries, and wholesale support. Email: contact@puxijietech.com | WeChat: EricH0625'
              : t(locale, 'contactPage.heroDesc')
          }
        />
        {locale === 'en' ? (
          <meta
            name="keywords"
            content="contact waterproof speaker manufacturer, OEM/ODM outdoor speaker inquiry, wholesale portable waterproof speakers, private label bluetooth speaker supplier, bulk order speaker factory"
          />
        ) : null}
        <link rel="canonical" href={`${getSiteOrigin()}/${locale}/contact`} />
        {['en', 'fr', 'vi'].map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`${getSiteOrigin()}/${l}/contact`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${getSiteOrigin()}/en/contact`} />
      </Helmet>

      <div className="min-h-screen bg-[#fafafa]">
        <Header />

        {/* Hero — buyer-first */}
        <section className="relative border-b border-gray-200/80 bg-gradient-to-b from-white via-gray-50/80 to-[#fafafa]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-500/[0.06] blur-3xl" />
            <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-slate-400/[0.07] blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <m.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gray-600 shadow-sm">
                {t(locale, 'contactPage.heroBadge')}
              </div>
              <h1
                className="mt-6 text-4xl md:text-5xl font-bold text-gray-900 tracking-tight"
                style={{ letterSpacing: '-0.03em' }}
              >
                {t(locale, 'contactPage.heroTitle')}
              </h1>
              <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-2xl">
                {t(locale, 'contactPage.heroDesc')}
              </p>
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                {sourcingHint[locale] ?? sourcingHint.en}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm">
                  <Clock className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
                  {t(locale, 'contactPage.responseSla')}
                </span>
              </div>
            </m.div>
          </div>
        </section>

        <section className="py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
              {/* Left: channels + map */}
              <m.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45 }}
                className="lg:col-span-5 space-y-6"
              >
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    {t(locale, 'contactPage.directLabel')}
                  </h2>
                  <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-black/[0.03]">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#07C160]/10 text-[#07C160]">
                        <MessageCircle className="h-6 w-6" strokeWidth={2} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">{t(locale, 'contactPage.wechatCardTitle')}</p>
                        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{t(locale, 'contactPage.wechatCardDesc')}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <code className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-mono font-semibold text-gray-900">
                            {wechatId}
                          </code>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 border-gray-300"
                            onClick={copyWechat}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {wechatCopied ? t(locale, 'contactPage.copied') : t(locale, 'contactPage.copyWechat')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href={`mailto:${businessEmail}`}
                    className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/[0.03] transition-all hover:border-gray-300 hover:shadow-md"
                  >
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gray-500 transition-colors group-hover:text-gray-900" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t(locale, 'contactPage.emailCardTitle')}
                      </p>
                      <p className="mt-1 font-medium text-gray-900">{businessEmail}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-sm font-medium text-blue-700">
                        {t(locale, 'cta.contactSales')}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
                      </p>
                    </div>
                  </a>

                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/[0.03] transition-all hover:border-gray-300 hover:shadow-md"
                  >
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gray-500 transition-colors group-hover:text-gray-900" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t(locale, 'contactPage.phoneCardTitle')}
                      </p>
                      <p className="mt-0.5 font-medium text-gray-900">{phone}</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/[0.03]">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t(locale, 'contactPage.hoursCardTitle')}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-gray-900">{t(locale, 'contactPage.hoursValue')}</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/[0.03]">
                  <div className="border-b border-gray-100 p-5">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                          {t(locale, 'contactPage.locationTitle')}
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">{addressTitle}</p>
                        <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                          {addressLines[0]}
                          <br />
                          {addressLines[1]}
                          <br />
                          {addressLines[2]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-[min(52vw,380px)] min-h-[240px] w-full bg-gray-100">
                    <iframe
                      title={t(locale, 'contactPage.locationTitle')}
                      src={mapEmbedUrl}
                      className="absolute inset-0 h-full w-full border-0"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                  <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-3">
                    <a
                      href={mapOpenInGoogleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-900 underline-offset-4 hover:underline"
                    >
                      {t(locale, 'contactPage.openInMaps')}
                    </a>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">{t(locale, 'contactPage.mapHint')}</p>
                  </div>
                </div>
              </m.div>

              {/* Right: buyer workflow */}
              <m.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="lg:col-span-7 space-y-10"
              >
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{t(locale, 'contactPage.quickLinksTitle')}</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {quickLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-black/[0.03] transition-all hover:border-gray-300 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
                              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                            </div>
                            <ArrowUpRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-900" />
                          </div>
                          <p className="mt-4 font-semibold text-gray-900">{item.title}</p>
                          <p className="mt-1 text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-black/[0.03] md:p-8">
                  <h2 className="text-lg font-bold text-gray-900">{t(locale, 'contactPage.prepareTitle')}</h2>
                  <ul className="mt-5 space-y-3">
                    {prepareItems.map((line, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600/90" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-6 md:p-7">
                  <p className="text-sm text-amber-950/90 leading-relaxed">{t(locale, 'contactPage.consumerNote')}</p>
                  <Link
                    to={`/${locale}/faq`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-950 underline-offset-4 hover:underline"
                  >
                    {t(locale, 'contactPage.consumerFaqLink')}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </m.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default ContactPage;
