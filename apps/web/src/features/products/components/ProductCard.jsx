
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { m } from 'framer-motion';
import { BadgeCheck, Boxes, Cpu, Radio } from 'lucide-react';
import { DEFAULT_LOCALE, isSupportedLocale, t } from '@/shared/lib/i18n.js';
import { getLocalizedProduct } from '@/features/products/utils/productI18n.js';
import { getModelSlugById } from '@/features/products/utils/modelSlugs.js';
import { getImageFallbackSrc, getImageSrc, getImageSrcSet } from '@/shared/lib/resolveImage.js';

function ProductCard({ product, index = 0 }) {
  const params = useParams();
  const locale = isSupportedLocale(params?.locale) ? params.locale : DEFAULT_LOCALE;
  const p = useMemo(() => getLocalizedProduct(product, locale), [product, locale]);
  const imageSrc = Array.isArray(p.image) ? p.image[0] : p.image;
  const modelSlug = useMemo(() => getModelSlugById(p.id), [p.id]);
  const to = modelSlug ? `/${locale}/model/${modelSlug}` : `/${locale}/products/${p.id}`;

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={to} className="block h-full">
        <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-900/30 hover:shadow-2xl">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f2ee]">
            <img
              src={getImageSrc(imageSrc)}
              srcSet={getImageSrcSet(imageSrc)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 320px, (max-width: 1280px) 360px, 300px"
              alt={`${p.name}${p.ipxRating && p.ipxRating !== 'N/A' ? ` ${p.ipxRating}` : ''} waterproof Bluetooth speaker — Puxijie OEM/ODM`}
              width={480}
              height={360}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.src = getImageFallbackSrc();
                event.currentTarget.srcset = '';
              }}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-80" />
            <div className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm">
              RFQ ready
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white">
              <span className="rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
                {p.ipxRating && p.ipxRating !== 'N/A' ? p.ipxRating : p.category.replace('Bluetooth ', '')}
              </span>
              {p.sheetVerified ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  2026 verified
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-1 flex-col p-4 sm:p-5">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase text-gray-500">
                {p.category}
              </p>
              <h3 className="text-lg font-bold text-gray-950 transition-colors duration-200 group-hover:text-gray-700 sm:text-xl">
                {p.name}
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-y border-gray-100 py-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase text-gray-400">MOQ</p>
                <p className="mt-1 truncate text-xs font-semibold text-gray-900">{p.moq || 'Confirm'}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase text-gray-400">Colors</p>
                <p className="mt-1 truncate text-xs font-semibold text-gray-900">{p.colorOptions || 'Custom'}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-gray-50 px-2 py-2">
                <Radio className="mx-auto h-4 w-4 text-gray-500" />
                <span className="mt-1 block truncate text-[10px] font-semibold text-gray-700">{p.bluetoothVersion || 'BT'}</span>
              </div>
              <div className="rounded-md bg-gray-50 px-2 py-2">
                <Cpu className="mx-auto h-4 w-4 text-gray-500" />
                <span className="mt-1 block truncate text-[10px] font-semibold text-gray-700">{p.chipset || 'Chipset'}</span>
              </div>
              <div className="rounded-md bg-gray-50 px-2 py-2">
                <Boxes className="mx-auto h-4 w-4 text-gray-500" />
                <span className="mt-1 block truncate text-[10px] font-semibold text-gray-700">{p.cartonQuantity || p.caseBattery || p.batteryLife || 'Bulk'}</span>
              </div>
            </div>

            <div className="mt-auto hidden pt-4 sm:block">
              <p className="text-xs font-semibold text-gray-500">{t(locale, 'productCard.b2bFitTitle')}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">{t(locale, 'productCard.b2bFitDesc')}</p>
            </div>
          </div>
        </div>
      </Link>
    </m.div>
  );
}

export default ProductCard;
