import { z } from 'zod';

export const legalTranslationSchema = z.object({
  locale: z.enum(['en', 'fr', 'vi']),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  eyebrow: z.string().max(200).optional(),
  h1: z.string().max(200).optional(),
  lead: z.string().optional(),
  intro: z.array(z.string()).default([]),
  sections: z.array(z.tuple([z.string(), z.array(z.string())])),
});

export const updateLegalSchema = z.object({
  page_type: z.enum(['terms', 'privacy', 'warranty', 'do-not-sell']),
  translations: z.array(legalTranslationSchema).min(1).max(3),
});

export type UpdateLegalInput = z.infer<typeof updateLegalSchema>;
