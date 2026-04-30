import React from 'react';
import { Link } from 'react-router-dom';
import { getSiteOrigin, t } from '@/shared/lib/i18n.js';
import { useLocale } from '@/shared/lib/useLocale.js';

const FOOTER_LINK_GROUPS = [
  {
    title: 'Company',
    links: [
      ['about-us', 'nav.about'],
      ['contact', 'nav.contact'],
      ['faq', 'nav.faq'],
      ['sitemap', 'Sitemap'],
    ],
  },
  {
    title: 'Buyer Resources',
    links: [
      ['products', 'nav.products'],
      ['b2b', 'nav.b2b'],
      ['catalog-downloads', 'Catalog Downloads'],
      ['lab', 'nav.lab'],
    ],
  },
  {
    title: 'Policies',
    links: [
      ['privacy', 'Privacy Policy'],
      ['terms-of-use', 'Terms of Use'],
      ['warranty', 'Warranty Policy'],
    ],
  },
];

const trustPoints = ['OEM/ODM manufacturer', 'Waterproof speaker factory', 'Wholesale supply', 'CE/FCC/RoHS support'];

function resolveLabel(locale, label) {
  return label.includes('.') ? t(locale, label) : label;
}

function Footer() {
  const locale = useLocale();
  const year = new Date().getFullYear();
  const origin = getSiteOrigin();

  return (
    <footer className="border-t border-[#d8d0c2] bg-[#111814] text-[#f8f1e7]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link to={`/${locale}`} className="text-2xl font-bold tracking-tight">
              Puxijie
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#d7cbbc]">
              Waterproof Bluetooth speaker manufacturer for procurement teams, private-label brands,
              retailers, and distributors.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {trustPoints.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-[#f8f1e7]/15 bg-[#f8f1e7]/8 px-3 py-1 text-xs font-semibold text-[#f8f1e7]/85"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-[#cdbb9c]">{group.title}</h2>
                <nav className="mt-4 space-y-3" aria-label={group.title}>
                  {group.links.map(([href, label]) => (
                    <Link
                      key={href}
                      to={`/${locale}/${href}`}
                      className="block text-sm text-[#d7cbbc] transition hover:text-white"
                    >
                      {resolveLabel(locale, label)}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 border-t border-[#f8f1e7]/12 pt-6 text-sm text-[#d7cbbc] md:grid-cols-3">
          <p>Business email: contact@puxijietech.com</p>
          <p>WeChat: EricH0625</p>
          <p className="md:text-right">{origin.replace('https://', '')}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 text-xs text-[#a99b89] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Puxijie Technology. All rights reserved.</p>
          <p>Built for B2B sourcing, wholesale programs, and OEM/ODM speaker projects.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
