// Merged product data: hardcoded base + CMS products.
// Hardcoded products keep their vite-imagetools image imports (with srcset).
// CMS products use plain Supabase Storage URLs — resolveImage.js handles both.

import {
  rawProducts as hardcodedRawProducts,
  excelProductData as hardcodedExcelData,
  buildSheetSpecs,
  buildPackagingSpecs,
} from './products.data.js';
import { cmsProducts } from './products.generated.js';

// Split CMS products into overrides (matching hardcoded slugs) and new products
const hardcodedSlugs = new Set(hardcodedRawProducts.map((p) => p.id));
const cmsOverrides = {};
const cmsOnlyProducts = [];

for (const p of cmsProducts) {
  const slug = p.slug || p.id;
  if (hardcodedSlugs.has(slug)) {
    cmsOverrides[slug] = p;
  } else {
    cmsOnlyProducts.push(p);
  }
}

// Apply CMS overrides to hardcoded products, preserving image imports
const mergedRawProducts = hardcodedRawProducts.map((product) => {
  const override = cmsOverrides[product.id];
  if (!override) return product;

  return {
    ...product,
    ...override,
    image: override.image ?? product.image,
    features: override.features ?? product.features,
    benefits: override.benefits ?? product.benefits,
    downloads: override.downloads ?? product.downloads,
    relatedProducts: override.relatedProducts ?? product.relatedProducts,
  };
});

// Merge Excel data overrides
const mergedExcelData = { ...hardcodedExcelData };
for (const [slug, override] of Object.entries(cmsOverrides)) {
  if (override.excelData) {
    mergedExcelData[slug] = {
      ...(mergedExcelData[slug] || {}),
      ...override.excelData,
    };
  }
}

// Append CMS-only products (plain URL images, no vite-imagetools imports)
const allRawProducts = [
  ...mergedRawProducts,
  ...cmsOnlyProducts.map((p) => ({
    id: p.slug || p.id,
    name: p.name,
    category: p.category,
    image: p.image || [],
    downloads: p.downloads || [],
    ipxRating: p.ipx_rating ?? 'N/A',
    batteryLife: p.battery_life ?? 'N/A',
    waterproofDepth: p.waterproof_depth ?? 'Not specified',
    frequencyRange: p.frequency_range ?? 'N/A - N/A',
    material: p.material || '',
    weight: p.weight || '',
    dimensions: p.dimensions || '',
    features: p.features || [],
    benefits: p.benefits || [],
    relatedProducts: p.related_products || [],
    ...(p.specs || {}),
  })),
];

// Same transformation pipeline as original products.js
export const products = allRawProducts.map((product) => {
  const excelData = mergedExcelData[product.id] || {};
  const merged = { ...product, ...excelData };
  return {
    ...merged,
    sheetSpecs: buildSheetSpecs(merged),
    packagingSpecs: buildPackagingSpecs(merged),
    procurementNotes: [
      merged.sheetVerified
        ? '2026 specification parameters verified'
        : 'Confirm final specification before order',
      merged.moqNote || 'OEM/ODM branding, packaging, and compliance support available',
      'Final quotation is issued after quantity, packaging, branding, certification, and destination market are confirmed',
    ],
  };
});

export const getProductById = (id) => {
  return products.find((product) => product.id === id);
};

export const getProductsByCategory = (category) => {
  if (!category || category === 'All') return products;
  return products.filter((product) => product.category === category);
};

export const getRelatedProducts = (productId, limit = 3) => {
  const product = getProductById(productId);
  if (!product) return [];

  return product.relatedProducts
    .map((id) => getProductById(id))
    .filter(Boolean)
    .slice(0, limit);
};
