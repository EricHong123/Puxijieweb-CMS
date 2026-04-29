import { DEFAULT_LOCALE, isSupportedLocale, t } from '@/shared/lib/i18n.js';
import { PRODUCT_TRANSLATIONS } from '@/features/products/data/productTranslations.js';

/**
 * Merge base product (English specs from `products.js`) with FR/VI display strings.
 */
export function getLocalizedProduct(product, locale) {
  if (!product) return product;
  const loc = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  if (loc === 'en') return product;

  const tr = PRODUCT_TRANSLATIONS[loc]?.[product.id];
  if (!tr) return product;

  const downloads =
    Array.isArray(product.downloads) && product.downloads.length > 0
      ? product.downloads.map((d, i) => ({
          ...d,
          title: tr.downloads?.[i]?.title ?? d.title,
        }))
      : product.downloads;

  return {
    ...product,
    name: tr.name ?? product.name,
    category: tr.category ?? product.category,
    waterproofDepth: tr.waterproofDepth ?? product.waterproofDepth,
    material: tr.material ?? product.material,
    frequencyRange: tr.frequencyRange ?? product.frequencyRange,
    features: tr.features ?? product.features,
    benefits: tr.benefits ?? product.benefits,
    downloads,
  };
}

const CATEGORY_KEY_TO_I18N = {
  All: 'categories.all',
  'Waterproof Bluetooth Speaker': 'categories.waterproofBt',
  'Normal Bluetooth Speaker': 'categories.normalBt',
  'Specialty Speaker': 'categories.specialty',
  'Bluetooth Earbuds': 'categories.earbuds',
};

/** Localized category name for listings / filters (URL still uses English keys). */
export function getCategoryLabel(locale, categoryKey) {
  const path = CATEGORY_KEY_TO_I18N[categoryKey];
  return path ? t(locale, path) : categoryKey;
}
