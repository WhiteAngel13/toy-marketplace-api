import { z } from 'zod';

export const AdSchema = z.object({
  id: z.string(),
  image_url: z.string(),
  store_id: z.string(),
  product_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Ad = z.infer<typeof AdSchema>;
