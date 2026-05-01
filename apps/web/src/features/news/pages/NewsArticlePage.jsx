import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Clock3, Globe2, Tag } from 'lucide-react';
import Header from '@/shared/site/Header.jsx';
import Footer from '@/shared/site/Footer.jsx';
import { getSiteOrigin } from '@/shared/lib/i18n.js';
import { useLocale } from '@/shared/lib/useLocale.js';
import { getNewsPost } from '@/features/news/lib/newsContent.js';
import './NewsArticlePage.css';

function getArticlePageCopy(locale) {
  const copy = {
    en: {
      article: 'News Article',
      notFound: 'Article not found',
      notFoundDesc: 'This article is not available for the selected locale.',
      backNews: 'Back to News',
      news: 'News',
      magazine: 'CC / Magazine',
      kicker: 'OEM / ODM Audio Report',
      minRead: 'min read',
      sourcing: 'B2B sourcing',
      featuredRefs: 'Featured product references',
      inIssue: 'In This Issue',
      articleSections: 'Article sections',
      startInquiry: 'Start Inquiry',
      closingKicker: 'Wholesale CTA',
      closingTitle: 'Turn the article into a quote-ready brief.',
      closingDesc:
        'Send your target quantity, destination market, waterproof level, and packaging direction so the speaker recommendation starts from the real sales channel.',
      b2bProgram: 'B2B Program',
      contactSales: 'Contact Sales',
    },
    fr: {
      article: 'Article',
      notFound: 'Article introuvable',
      notFoundDesc: 'Cet article n’est pas disponible dans la langue sélectionnée.',
      backNews: 'Retour aux actualités',
      news: 'Actualités',
      magazine: 'CC / Magazine',
      kicker: 'Rapport audio OEM / ODM',
      minRead: 'min de lecture',
      sourcing: 'Sourcing B2B',
      featuredRefs: 'Références produits mises en avant',
      inIssue: 'Dans cet article',
      articleSections: 'Sections de l’article',
      startInquiry: 'Démarrer une demande',
      closingKicker: 'CTA wholesale',
      closingTitle: 'Transformez l’article en brief prêt pour devis.',
      closingDesc:
        'Envoyez quantité cible, marché de destination, niveau d’étanchéité et direction packaging pour partir du vrai canal de vente.',
      b2bProgram: 'Programme B2B',
      contactSales: 'Contacter le commercial',
    },
    vi: {
      article: 'Bài viết',
      notFound: 'Không tìm thấy bài viết',
      notFoundDesc: 'Bài viết này chưa có ở ngôn ngữ đã chọn.',
      backNews: 'Quay lại News',
      news: 'News',
      magazine: 'CC / Magazine',
      kicker: 'Báo cáo audio OEM / ODM',
      minRead: 'phút đọc',
      sourcing: 'Sourcing B2B',
      featuredRefs: 'Sản phẩm tham khảo nổi bật',
      inIssue: 'Trong bài viết',
      articleSections: 'Các phần của bài viết',
      startInquiry: 'Bắt đầu inquiry',
      closingKicker: 'CTA bán sỉ',
      closingTitle: 'Biến bài viết thành brief sẵn sàng báo giá.',
      closingDesc:
        'Gửi số lượng mục tiêu, thị trường đích, cấp chống nước và hướng bao bì để đề xuất loa bắt đầu từ kênh bán hàng thực tế.',
      b2bProgram: 'Chương trình B2B',
      contactSales: 'Liên hệ sales',
    },
  };
  return copy[locale] || copy.en;
}

function NewsArticlePage() {
  const locale = useLocale();
  const params = useParams();
  const slug = params?.slug || '';
  const post = getNewsPost(locale, slug);
  const pageCopy = getArticlePageCopy(locale);

  if (!post) {
    return (
      <div className="magazine-page">
        <Header />
        <main className="magazine-not-found">
          <p className="magazine-kicker">{pageCopy.article}</p>
          <h1>{pageCopy.notFound}</h1>
          <p>{pageCopy.notFoundDesc}</p>
          <Link to={`/${locale}/news/`} className="magazine-button magazine-button--dark">
            <ArrowLeft size={18} />
            {pageCopy.backNews}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const canonicalPath = `/${locale}/news/${post.slug}/`;
  const canonicalUrl = `${getSiteOrigin()}${canonicalPath}`;
  const alternateLocales = ['en', 'fr', 'vi']
    .map((lang) => ({ lang, post: getNewsPost(lang, post.slug) }))
    .filter((entry) => entry.post);

  const relatedTopics = post.keywords.slice(0, 6);
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date || undefined,
    dateModified: post.date || undefined,
    inLanguage: locale,
    mainEntityOfPage: canonicalUrl,
    image: post.heroImages?.[0]?.src ? `${getSiteOrigin()}${post.heroImages[0].src}` : post.image,
    author: {
      '@type': 'Person',
      name: 'Puxijie Editorial Team',
      jobTitle: 'OEM/ODM Audio Manufacturing Insights',
      affiliation: {
        '@type': 'Organization',
        name: 'Puxijie',
        url: getSiteOrigin(),
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Puxijie',
      logo: {
        '@type': 'ImageObject',
        url: `${getSiteOrigin()}/images/logo.svg`,
      },
    },
    keywords: post.keywords.join(', '),
  };

  return (
    <>
      <Helmet>
        <html lang={locale} />
        <title>{`${post.title} | Puxijie`}</title>
        <meta name="description" content={post.description} />
        {post.keywords.length ? <meta name="keywords" content={post.keywords.join(', ')} /> : null}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={articleJsonLd.image} />
        <meta property="article:published_time" content={post.date || ''} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={articleJsonLd.image} />
        <link rel="canonical" href={canonicalUrl} />
        {alternateLocales.map(({ lang, post: localizedPost }) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={`${getSiteOrigin()}${localizedPost.href}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${getSiteOrigin()}/en/news/${post.slug}/`} />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      </Helmet>

      <div className="magazine-page">
        <Header />

        <main>
          <section className="magazine-cover">
            <div className="magazine-cover__topline">
              <Link to={`/${locale}/news/`} className="magazine-back">
                <ArrowLeft size={18} />
                {pageCopy.news}
              </Link>
              <span>{pageCopy.magazine}</span>
            </div>

            <div className="magazine-cover__grid">
              <div className="magazine-cover__copy">
                <p className="magazine-kicker">{pageCopy.kicker}</p>
                <h1>{post.title}</h1>
                <p className="magazine-deck">{post.description}</p>
                <div className="magazine-meta">
                  <span>
                    <Clock3 size={17} />
                    {post.readingMinutes} {pageCopy.minRead}
                  </span>
                  <span>
                    <Globe2 size={17} />
                    {post.displayDate}
                  </span>
                  <span>
                    <BookOpen size={17} />
                    {pageCopy.sourcing}
                  </span>
                </div>
              </div>

              {post.heroImages.length ? (
                <div className="magazine-cover__images" aria-label={pageCopy.featuredRefs}>
                  {post.heroImages.map((image, index) => (
                    <figure key={image.src} className={index === 0 ? 'is-primary' : ''}>
                      <img src={image.src} alt={image.alt} loading="eager" decoding="async" />
                    </figure>
                  ))}
                </div>
              ) : null}
            </div>

            {relatedTopics.length ? (
              <div className="magazine-topic-row">
                {relatedTopics.map((keyword) => (
                  <span key={keyword}>
                    <Tag size={14} />
                    {keyword}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <section className="magazine-body-shell">
            <aside className="magazine-rail">
              <p className="magazine-rail__label">{pageCopy.inIssue}</p>
              {post.sections.length ? (
                <nav className="magazine-toc" aria-label={pageCopy.articleSections}>
                  {post.sections.map((section) => (
                    <a key={section.id} href={`#${section.id}`} className={section.depth === 3 ? 'is-child' : ''}>
                      {section.title}
                    </a>
                  ))}
                </nav>
              ) : null}
              <Link to={`/${locale}/contact`} className="magazine-button magazine-button--dark">
                {pageCopy.startInquiry}
                <ArrowRight size={17} />
              </Link>
            </aside>

            <article className="magazine-article" dangerouslySetInnerHTML={{ __html: post.html }} />
          </section>

          <section className="magazine-closing">
            <div>
              <p className="magazine-kicker">{pageCopy.closingKicker}</p>
              <h2>{pageCopy.closingTitle}</h2>
              <p>
                {pageCopy.closingDesc}
              </p>
            </div>
            <div className="magazine-closing__actions">
              <Link to={`/${locale}/b2b`} className="magazine-button magazine-button--light">
                {pageCopy.b2bProgram}
              </Link>
              <Link to={`/${locale}/contact`} className="magazine-button magazine-button--dark">
                {pageCopy.contactSales}
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default NewsArticlePage;
