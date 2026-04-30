import { z } from 'zod';

export const newsArticleSchema = z.object({
  slug: z.string().min(1).max(200),
  locale: z.enum(['en', 'fr', 'vi']),
  title: z.string().min(1).max(300),
  description: z.string().max(500).optional(),
  body_markdown: z.string().min(1),
  date: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  hero_image_url: z.string().max(500).optional(),
  scheduled_publish_at: z.string().datetime().nullable().optional(),
});

export const createNewsSchema = newsArticleSchema;
export const updateNewsSchema = newsArticleSchema.partial();

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
