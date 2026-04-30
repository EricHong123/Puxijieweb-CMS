import { z } from 'zod';

export const pageTranslationSchema = z.object({
  locale: z.enum(['en', 'fr', 'vi']),
  title: z.string().min(1).max(200),
  meta_description: z.string().max(500).optional(),
  hero_badge: z.string().max(200).optional(),
  headline_line1: z.string().max(300).optional(),
  headline_line2: z.string().max(300).optional(),
  headline_emphasis: z.string().max(300).optional(),
  subhead: z.string().optional(),
  body_json: z.any().optional(),
});

export const createPageSchema = z.object({
  slug: z.string().min(1).max(100),
  page_type: z.enum(['home', 'standard', 'contact']),
  translations: z.array(pageTranslationSchema).min(1).max(3),
  scheduled_publish_at: z.string().datetime().nullable().optional(),
});

export const updatePageSchema = createPageSchema.partial();

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
