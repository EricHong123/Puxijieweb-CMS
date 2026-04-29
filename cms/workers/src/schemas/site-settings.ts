import { z } from 'zod';

export const siteSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.any(),
});

export const updateSiteSettingSchema = z.object({
  value: z.any(),
});

export type SiteSetting = z.infer<typeof siteSettingSchema>;
