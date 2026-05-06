import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().min(1),
  role: z.enum(['admin', 'editor']),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  display_name: z.string().min(1).optional(),
  role: z.enum(['admin', 'editor']).optional(),
  is_active: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
