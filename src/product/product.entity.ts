import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  image_url: z.string(),
  category_id: z.string(),
  store_id: z.string(),
  price: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;
