import React from 'react';
import { Helmet } from 'react-helmet';
import { m as motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Users } from 'lucide-react';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import { getSiteOrigin, t, tv } from '@/shared/lib/i18n.js';
import { useLocale } from '@/shared/lib/useLocale.js';

function HelpCenterPage() {
  const locale = useLocale();
  const businessEmail = 'contact@puxijietech.com';
  const supportEmail = 'contact@puxijietech.com';
  const phone = '+86 13532328175';
  const workingHours = 'Mon - Fri (GMT+8)';
  const pageCopy = {
    en: {
      seoLine: 'FAQs for B2B buyers of outdoor waterproof Bluetooth speakers: MOQ, lead time, private label, certifications, and packaging options.',
      salesDirector: 'Sales Director',
      region1: 'Europe/Africa/Asia',
      region2: 'North America/South America/Asia',
      addressRef: 'GUANGZHOU PUXIJIE TECHNOLOGY CO., LTD (address reference)',
      address: 'Building 6, No. 49, Fenghuang 2nd Road, Humen Town, Dongguan City, Guangdong Province',
      workingHours: 'Working hours',
      businessHelp: 'For business inquiries, please email our team. If you need urgent assistance, include your product model and batch/invoice details.',
    },
    fr: {
      seoLine: 'FAQ pour acheteurs B2B d’enceintes Bluetooth étanches outdoor : MOQ, délai, private label, certifications et options packaging.',
      salesDirector: 'Directeur commercial',
      region1: 'Europe / Afrique / Asie',
      region2: 'Amérique du Nord / Amérique du Sud / Asie',
      addressRef: 'GUANGZHOU PUXIJIE TECHNOLOGY CO., LTD (adresse de référence)',
      address: 'Bâtiment 6, n°49, Fenghuang 2nd Road, Humen, Dongguan, Guangdong',
      workingHours: 'Horaires',
      businessHelp: 'Pour toute demande professionnelle, envoyez un email à notre équipe. En cas d’urgence, indiquez le modèle produit et les détails de lot/facture.',
    },
    vi: {
      seoLine: 'FAQ cho buyer B2B loa Bluetooth chống nước outdoor: MOQ, lead time, private label, chứng nhận và tuỳ chọn bao bì.',
      salesDirector: 'Giám đốc kinh doanh',
      region1: 'Châu Âu / Châu Phi / Châu Á',
      region2: 'Bắc Mỹ / Nam Mỹ / Châu Á',
      addressRef: 'GUANGZHOU PUXIJIE TECHNOLOGY CO., LTD (địa chỉ tham khảo)',
      address: 'Tòa nhà 6, số 49, đường Fenghuang 2nd, Humen, Dongguan, Guangdong',
      workingHours: 'Giờ làm việc',
      businessHelp: 'Với yêu cầu kinh doanh, vui lòng email cho đội ngũ của chúng tôi. Nếu cần hỗ trợ gấp, hãy ghi model sản phẩm và thông tin lô/hóa đơn.',
    },
  }[locale] ?? {};

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>
          {locale === 'en'
            ? 'Help Center — OEM/ODM & Wholesale Waterproof Speakers | Puxijie'
            : `${t(locale, 'helpCenterPage.title')} | Puxijie`}
        </title>
        <meta
          name="description"
          content={
            locale === 'en'
              ? 'B2B support for OEM/ODM and wholesale outdoor waterproof speakers. Find FAQs on MOQ, lead time, private label, certifications, packaging, and shipping.'
              : t(locale, 'helpCenterPage.heroDesc')
          }
        />
        {locale === 'en' ? (
          <meta
            name="keywords"
            content="OEM/ODM speaker FAQ, waterproof speaker MOQ lead time, private label bluetooth speaker support, certifications CE FCC RoHS, wholesale portable speakers help"
          />
        ) : null}
        <link rel="canonical" href={`${getSiteOrigin()}/${locale}/help-center`} />
        {['en', 'fr', 'vi'].map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`${getSiteOrigin()}/${l}/help-center`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${getSiteOrigin()}/en/help-center`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <section className="py-24 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-900">
                {t(locale, 'helpCenterPage.badge')}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mt-5 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {t(locale, 'helpCenterPage.heroTitle')}
              </h1>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {t(locale, 'helpCenterPage.heroDesc')}
              </p>
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                {pageCopy.seoLine}
              </p>

              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {(tv(locale, 'helpCenterPage.tags', []) ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 text-left">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{t(locale, 'helpCenterPage.consumerTipsTitle')}</p>
                      <p className="mt-2 text-gray-700 leading-relaxed">
                        {t(locale, 'helpCenterPage.consumerTipsBody')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900">{t(locale, 'helpCenterPage.contactsTitle')}</h2>
              <p className="mt-3 text-gray-600 leading-relaxed">
                {t(locale, 'helpCenterPage.contactsDesc')}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-3xl border border-gray-200 bg-white p-7">
                <h3 className="text-xl font-bold text-gray-900">{pageCopy.region1}</h3>
                <p className="mt-2 text-gray-700 leading-relaxed">{pageCopy.salesDirector}</p>
                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <a href={`mailto:${supportEmail}`} className="text-gray-800 hover:underline">
                      {supportEmail}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-gray-800 hover:underline">
                      {phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{t(locale, 'helpCenterPage.coverage')}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-7">
                <h3 className="text-xl font-bold text-gray-900">{pageCopy.region2}</h3>
                <p className="mt-2 text-gray-700 leading-relaxed">{pageCopy.salesDirector}</p>
                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <a href={`mailto:${supportEmail}`} className="text-gray-800 hover:underline">
                      {supportEmail}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-gray-800 hover:underline">
                      {phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{t(locale, 'helpCenterPage.coverage')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-7">
              <h3 className="text-xl font-bold text-gray-900">{t(locale, 'helpCenterPage.chinaHq')}</h3>
              <p className="mt-2 text-gray-700 leading-relaxed">
                {pageCopy.addressRef}
              </p>
              <div className="mt-5 space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span>
                    {pageCopy.address}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${supportEmail}`} className="hover:underline">
                    {supportEmail}
                  </a>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">{pageCopy.workingHours}: {workingHours}</p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <h2 className="text-3xl font-bold text-gray-900">{t(locale, 'contactPage.heroTitle')}</h2>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  {pageCopy.businessHelp}
                </p>

                <div className="space-y-3 mt-6">
                  <div className="flex items-start gap-4 rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <Mail className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{t(locale, 'contactPage.businessEmail')}</p>
                      <a href={`mailto:${businessEmail}`} className="text-sm text-gray-700 hover:underline">
                        {businessEmail}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <Mail className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{t(locale, 'contactPage.supportEmail')}</p>
                      <a href={`mailto:${supportEmail}`} className="text-sm text-gray-700 hover:underline">
                        {supportEmail}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <Phone className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{t(locale, 'contactPage.call')}</p>
                      <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-sm text-gray-700 hover:underline">
                        {phone}
                      </a>
                      <p className="mt-1 text-sm text-gray-500">{workingHours}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 bg-white">
                  <h3 className="text-xl font-bold text-gray-900">{t(locale, 'helpCenterPage.suggestedNext')}</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    {t(locale, 'helpCenterPage.suggestedDesc')}
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold flex-shrink-0">1</span>
                    <div>
                      <p className="font-medium text-gray-900">{t(locale, 'helpCenterPage.step1Title')}</p>
                      <p className="text-sm text-gray-600">{t(locale, 'helpCenterPage.step1Desc')}</p>
                      <Link to={`/${locale}/contact`} className="text-sm font-medium text-gray-900 hover:underline block mt-1">
                        {t(locale, 'helpCenterPage.step1Cta')}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold flex-shrink-0">2</span>
                    <div>
                      <p className="font-medium text-gray-900">{t(locale, 'helpCenterPage.step2Title')}</p>
                      <p className="text-sm text-gray-600">{t(locale, 'helpCenterPage.step2Desc')}</p>
                      <Link to={`/${locale}/faq`} className="text-sm font-medium text-gray-900 hover:underline block mt-1">
                        {t(locale, 'helpCenterPage.step2Cta')}
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default HelpCenterPage;

