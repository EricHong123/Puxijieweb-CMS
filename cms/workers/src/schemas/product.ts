import { z } from 'zod';

export const productTranslationSchema = z.object({
  locale: z.enum(['en', 'fr', 'vi']),
  name: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  material: z.string().max(255).optional(),
  weight: z.string().max(50).optional(),
  dimensions: z.string().max(100).optional(),
  waterproof_depth: z.string().max(100).optional(),
  frequency_range: z.string().max(100).optional(),
  features: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  procurement_notes: z.array(z.string()).default([]),
  description_html: z.string().optional(),
});

export const productSpecsSchema = z.object({
  ipx_rating: z.string().optional(),
  battery_life: z.string().optional(),
  chipset: z.string().optional(),
  bluetooth_version: z.string().optional(),
  transmission_distance: z.string().optional(),
  speaker_spec: z.string().optional(),
  battery_spec: z.string().optional(),
  function_set: z.string().optional(),
  color_options: z.string().optional(),
  moq: z.string().optional(),
  package_size: z.string().optional(),
  carton_size: z.string().optional(),
  carton_quantity: z.string().optional(),
  carton_weight: z.string().optional(),
  accessory_content: z.string().optional(),
});

const downloadSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().min(1).max(500),
});

export const createProductSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  category: z.enum(['waterproof_bt', 'normal_bt', 'specialty', 'earbuds']),
  sort_order: z.number().int().default(0),
  downloads: z.array(downloadSchema).default([]),
  translations: z.array(productTranslationSchema).min(1).max(3),
  specs: productSpecsSchema.optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductTranslation = z.infer<typeof productTranslationSchema>;
export type ProductSpecs = z.infer<typeof productSpecsSchema>;
