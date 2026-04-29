
import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { m } from 'framer-motion';
import { Package, Palette, HeartHandshake as Handshake, TrendingUp } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import InquiryButton from '@/shared/site/InquiryButton.jsx';
import { DEFAULT_LOCALE, getSiteOrigin, isSupportedLocale, t } from '@/shared/lib/i18n.js';
import { useParams } from 'react-router-dom';

function getB2bCopy(locale) {
  const copy = {
    en: {
      title: 'B2B & Wholesale',
      metaDesc: 'Request wholesale pricing for outdoor portable wireless waterproof speakers. OEM/ODM, private label, and bulk order sourcing for brands, distributors, and gift buyers. IPX6/IPX7 verified, 250,000+ monthly capacity.',
      desc: 'Partner with Puxijie to bring professional waterproof audio to your customers. Flexible terms, custom solutions, and dedicated support.',
      seoLine: 'Source outdoor portable wireless waterproof speakers with OEM/ODM, private label, and bulk order support — designed for brands, distributors, and project buyers.',
      benefits: [
        ['Bulk Pricing', 'Volume pricing starts at over 1,000 pcs per model. Tiered pricing for larger orders.', ['Quantity-based brackets for wholesale programs', 'Quotation includes project scope and customization level']],
        ['Custom Branding', 'OEM/ODM services with your logo, packaging, and color schemes.', ['Logo, colors, and packaging customization support', 'Market-ready product presentation alignment']],
        ['Partnership Support', 'Dedicated account manager and technical support for partners.', ['Technical guidance for sampling and specification alignment', 'Coordination for documentation and compliance needs']],
        ['Flexible Terms', 'Commercial terms for qualified partners and long-term programs.', ['Terms negotiable for qualified partners', 'Shipping and logistics coordination support']],
      ],
      formTitle: 'Request wholesale pricing',
      formDesc: 'Fill out the form below or contact us directly for immediate assistance.',
      direct: 'Prefer to contact us directly?',
      labels: ['Company Name *', 'Contact Name *', 'Email Address *', 'Phone Number', 'Estimated Order Quantity *', 'Message *'],
      placeholders: ['Your company name', 'Your full name', 'your@email.com', '+1 (234) 567-890', 'e.g., 1,000 units', 'Tell us about your business and requirements...'],
      sending: 'Sending...',
      submit: 'Submit Inquiry',
      note: 'After tapping submit, your email app will open with a prefilled draft to',
      toastTitle: 'Opening email client',
      toastDesc: 'We will draft an email to {email}. Please click Send to submit.',
      customTitle: 'Customization options',
      customDesc: 'Tailor Puxijie speakers to match your brand identity and market requirements.',
      customCards: [
        ['Logo & Branding', ['Laser engraving or UV printing', 'Custom packaging design', 'Branded user manuals']],
        ['Color & Finish', ['Custom color matching (Pantone)', 'Matte, glossy, or textured finishes', 'Multi-color options available']],
        ['Technical Specs', ['Battery capacity adjustments', 'Bluetooth version selection', 'Additional features integration']],
      ],
    },
    fr: {
      title: 'B2B & Grossiste',
      metaDesc: 'Demandez un prix grossiste pour enceintes Bluetooth étanches outdoor. Puxijie accompagne marques, distributeurs et acheteurs projets avec OEM/ODM, private label et production en volume.',
      desc: 'Développez votre offre audio étanche avec Puxijie : conditions flexibles, solutions personnalisées et accompagnement dédié.',
      seoLine: 'Sourcez des enceintes Bluetooth étanches outdoor avec OEM/ODM, private label et commandes en volume pour marques, distributeurs et acheteurs projets.',
      benefits: [
        ['Prix de volume', 'Programmes de prix par quantité, généralement à partir de 1 000 pièces par modèle.', ['Paliers par quantité pour programmes wholesale', 'Devis selon périmètre projet et personnalisation']],
        ['Branding personnalisé', 'Services OEM/ODM pour logo, packaging et couleurs de marque.', ['Logo, couleurs et emballage personnalisés', 'Présentation produit adaptée au marché cible']],
        ['Support partenaire', 'Responsable commercial dédié et support technique pour les partenaires.', ['Aide technique pour échantillons et spécifications', 'Coordination documents et conformité']],
        ['Conditions flexibles', 'Conditions commerciales adaptées aux partenaires qualifiés et projets long terme.', ['Termes négociables pour partenaires qualifiés', 'Support transport et logistique']],
      ],
      formTitle: 'Demander un prix grossiste',
      formDesc: 'Remplissez le formulaire ou contactez-nous directement pour une réponse rapide.',
      direct: 'Vous préférez nous contacter directement ?',
      labels: ['Nom de société *', 'Nom du contact *', 'Adresse email *', 'Téléphone', 'Quantité estimée *', 'Message *'],
      placeholders: ['Nom de votre société', 'Votre nom complet', 'votre@email.com', '+33 ...', 'ex. 1 000 unités', 'Décrivez votre activité, marché et besoins...'],
      sending: 'Envoi...',
      submit: 'Envoyer la demande',
      note: 'Après validation, votre application email ouvrira un brouillon prérempli vers',
      toastTitle: 'Ouverture de votre email',
      toastDesc: 'Nous préparons un brouillon vers {email}. Cliquez sur Envoyer pour soumettre.',
      customTitle: 'Options de personnalisation',
      customDesc: 'Adaptez les enceintes Puxijie à votre identité de marque et aux exigences de votre marché.',
      customCards: [
        ['Logo & marque', ['Gravure laser ou impression UV', 'Design packaging personnalisé', 'Manuels utilisateur à votre marque']],
        ['Couleur & finition', ['Correspondance couleur Pantone', 'Finitions mates, brillantes ou texturées', 'Options multi-couleurs disponibles']],
        ['Spécifications techniques', ['Ajustement capacité batterie', 'Sélection version Bluetooth', 'Intégration de fonctions additionnelles']],
      ],
    },
    vi: {
      title: 'B2B & Bán sỉ',
      metaDesc: 'Yêu cầu báo giá bán sỉ cho loa Bluetooth chống nước outdoor. Puxijie hỗ trợ OEM/ODM, private label và đơn hàng số lượng lớn cho thương hiệu, nhà phân phối và buyer dự án.',
      desc: 'Hợp tác với Puxijie để xây dựng dòng âm thanh chống nước chuyên nghiệp: điều khoản linh hoạt, tuỳ chỉnh thương hiệu và hỗ trợ riêng.',
      seoLine: 'Sourcing loa Bluetooth chống nước outdoor với OEM/ODM, private label và đơn hàng số lượng lớn cho thương hiệu, nhà phân phối và buyer dự án.',
      benefits: [
        ['Giá số lượng', 'Chương trình giá theo sản lượng, thường từ 1.000 pcs mỗi model.', ['Bậc giá theo số lượng cho bán sỉ', 'Báo giá theo phạm vi dự án và tuỳ chỉnh']],
        ['Tuỳ chỉnh thương hiệu', 'Dịch vụ OEM/ODM cho logo, bao bì và màu sắc thương hiệu.', ['Hỗ trợ logo, màu sắc và packaging', 'Trình bày sản phẩm phù hợp thị trường']],
        ['Hỗ trợ đối tác', 'Account manager riêng và hỗ trợ kỹ thuật cho đối tác.', ['Tư vấn kỹ thuật cho mẫu và thông số', 'Điều phối tài liệu và chứng nhận']],
        ['Điều khoản linh hoạt', 'Điều khoản thương mại phù hợp cho đối tác đủ điều kiện và dự án dài hạn.', ['Có thể thương lượng với đối tác đủ điều kiện', 'Hỗ trợ vận chuyển và logistics']],
      ],
      formTitle: 'Yêu cầu giá bán sỉ',
      formDesc: 'Điền form bên dưới hoặc liên hệ trực tiếp để được hỗ trợ nhanh.',
      direct: 'Bạn muốn liên hệ trực tiếp?',
      labels: ['Tên công ty *', 'Tên người liên hệ *', 'Email *', 'Số điện thoại', 'Số lượng dự kiến *', 'Tin nhắn *'],
      placeholders: ['Tên công ty của bạn', 'Họ tên của bạn', 'ban@email.com', '+84 ...', 'vd. 1.000 chiếc', 'Cho biết thị trường, model và yêu cầu của bạn...'],
      sending: 'Đang gửi...',
      submit: 'Gửi yêu cầu',
      note: 'Sau khi bấm gửi, ứng dụng email sẽ mở bản nháp đã điền sẵn tới',
      toastTitle: 'Đang mở email',
      toastDesc: 'Chúng tôi sẽ tạo bản nháp gửi tới {email}. Vui lòng bấm Send để gửi.',
      customTitle: 'Tuỳ chọn cá nhân hoá',
      customDesc: 'Điều chỉnh loa Puxijie theo nhận diện thương hiệu và yêu cầu thị trường của bạn.',
      customCards: [
        ['Logo & thương hiệu', ['Khắc laser hoặc in UV', 'Thiết kế bao bì riêng', 'Sách hướng dẫn mang thương hiệu']],
        ['Màu sắc & hoàn thiện', ['Match màu theo Pantone', 'Hoàn thiện mờ, bóng hoặc vân', 'Có tuỳ chọn nhiều màu']],
        ['Thông số kỹ thuật', ['Điều chỉnh dung lượng pin', 'Chọn phiên bản Bluetooth', 'Tích hợp tính năng bổ sung']],
      ],
    },
  };

  return copy[locale] ?? copy.en;
}

function B2BPage() {
  const params = useParams();
  const locale = isSupportedLocale(params?.locale) ? params.locale : DEFAULT_LOCALE;
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    quantity: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inquiryEmail = 'inquiry@puxijietech.com';
  const pageCopy = useMemo(() => getB2bCopy(locale), [locale]);
  const benefitIcons = [Package, Palette, Handshake, TrendingUp];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subject = `B2B Inquiry - ${formData.companyName || formData.contactName || 'Puxijie'}`;
    const body = [
      `Company Name: ${formData.companyName}`,
      `Contact Name: ${formData.contactName}`,
      `Email Address: ${formData.email}`,
      `Phone Number: ${formData.phone || '-'}`,
      `Estimated Order Quantity: ${formData.quantity}`,
      '',
      'Message:',
      formData.message,
    ].join('\n');

    const emailUrl = `mailto:${inquiryEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    toast({
      title: pageCopy.toastTitle,
      description: pageCopy.toastDesc.replace('{email}', inquiryEmail),
    });

    // Open the user's email client with a prefilled draft
    window.location.href = emailUrl;

    setTimeout(() => {
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>
          {locale === 'en'
            ? 'B2B Wholesale Outdoor Waterproof Speakers — OEM/ODM & Private Label Pricing | Puxijie'
            : `${pageCopy.title} | Puxijie`}
        </title>
        <meta
          name="description"
          content={
            pageCopy.metaDesc
          }
        />
        {locale === 'en' ? (
          <meta
            name="keywords"
            content="wholesale outdoor waterproof speakers, OEM/ODM waterproof bluetooth speaker factory, private label portable speakers, bulk pricing waterproof speaker, distributor supplier outdoor speakers"
          />
        ) : null}
        <link rel="canonical" href={`${getSiteOrigin()}/${locale}/b2b`} />
        {['en', 'fr', 'vi'].map((l) => (
          <link key={l} rel="alternate" hrefLang={l} href={`${getSiteOrigin()}/${l}/b2b`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${getSiteOrigin()}/en/b2b`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'OEM/ODM & Wholesale Outdoor Waterproof Speakers',
          serviceType: 'OEM/ODM manufacturing and wholesale programs',
          provider: { '@type': 'Organization', name: 'Puxijie', url: getSiteOrigin() },
          areaServed: ['EU', 'US', 'Asia-Pacific', 'Middle East'],
          availableChannel: {
            '@type': 'ServiceChannel',
            serviceUrl: `${getSiteOrigin()}/${locale}/b2b`,
            availableLanguage: ['English', 'French', 'Vietnamese'],
          },
          audience: { '@type': 'BusinessAudience', audienceType: 'Distributors, importers, wholesale buyers' },
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'WeChat', value: 'EricH0625' },
          ],
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <section className="py-16 md:py-24 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-10 md:mb-16"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {pageCopy.title}
              </h1>
              <p className="text-base sm:text-xl text-gray-600 leading-relaxed">
                {pageCopy.desc}
              </p>
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                {pageCopy.seoLine}
              </p>
            </m.div>

            <div className="relative -mx-4 px-4 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory md:mx-0 md:px-0 md:overflow-visible">
              <div className="flex gap-4 pb-2 pr-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:pb-0 md:pr-0">
                {pageCopy.benefits.map(([title, desc, bullets], index) => {
                  const Icon = benefitIcons[index];
                  return (
                    <m.div
                      key={title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="snap-start flex-none w-[280px] md:w-auto bg-white rounded-2xl p-5 md:p-6 border border-gray-200 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300"
                    >
                      <Icon className="w-10 h-10 md:w-12 md:h-12 text-gray-900 mx-auto mb-3 md:mb-4" />
                      <h3 className="text-lg font-bold mb-2 text-gray-900">{title}</h3>
                      <p className="text-sm text-gray-600">{desc}</p>
                      <ul className="mt-4 text-left text-sm text-gray-600 list-disc pl-5 space-y-1">
                        {bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    </m.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gray-50 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {pageCopy.formTitle}
              </h2>
              <p className="text-sm sm:text-lg text-gray-600">
                {pageCopy.formDesc}
              </p>
            </m.div>

            <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{t(locale, 'b2bTerms.title')}</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {t(locale, 'geo.responseTime')}
                  </p>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {t(locale, 'b2bTerms.contactValue')}
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t(locale, 'b2bTerms.moqLabel')}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{t(locale, 'b2bTerms.moqValue')}</dd>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t(locale, 'b2bTerms.leadLabel')}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{t(locale, 'b2bTerms.leadValue')}</dd>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t(locale, 'b2bTerms.paymentLabel')}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{t(locale, 'b2bTerms.paymentValue')}</dd>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t(locale, 'b2bTerms.incotermsLabel')}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{t(locale, 'b2bTerms.incotermsValue')}</dd>
                </div>
              </dl>
            </div>

            <m.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-5 sm:space-y-6 bg-white rounded-2xl p-5 sm:p-8 border border-gray-200 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-gray-900">{pageCopy.labels[0]}</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 focus-visible:ring-gray-900"
                    placeholder={pageCopy.placeholders[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-gray-900">{pageCopy.labels[1]}</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={handleChange}
                    className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 focus-visible:ring-gray-900"
                    placeholder={pageCopy.placeholders[1]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900">{pageCopy.labels[2]}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 focus-visible:ring-gray-900"
                    placeholder={pageCopy.placeholders[2]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-900">{pageCopy.labels[3]}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 focus-visible:ring-gray-900"
                    placeholder={pageCopy.placeholders[3]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-gray-900">{pageCopy.labels[4]}</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="text"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 focus-visible:ring-gray-900"
                  placeholder={pageCopy.placeholders[4]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-900">{pageCopy.labels[5]}</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 focus-visible:ring-gray-900 resize-none"
                  placeholder={pageCopy.placeholders[5]}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-white border border-gray-900 text-gray-900 hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? pageCopy.sending : pageCopy.submit}
              </Button>

              <p className="text-xs text-gray-500">
                {pageCopy.note} <span className="font-semibold text-gray-700">{inquiryEmail}</span>.
              </p>
            </m.form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-4">
                {pageCopy.direct}
              </p>
              <InquiryButton />
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {pageCopy.customTitle}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {pageCopy.customDesc}
              </p>
            </m.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pageCopy.customCards.map(([title, items], index) => (
                <m.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
                >
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{title}</h3>
                  <ul className="space-y-2 text-gray-700">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-2 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </m.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default B2BPage;
