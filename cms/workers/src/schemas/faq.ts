import { z } from 'zod';

export const faqItemSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

export const faqSectionSchema = z.object({
  section_key: z.string().min(1).max(50),
  locale: z.enum(['en', 'fr', 'vi']),
  short_title: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  items: z.array(faqItemSchema).min(1),
  sort_order: z.number().int().default(0),
});

export const createFaqSchema = faqSectionSchema;
export const updateFaqSchema = faqSectionSchema.partial();

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
