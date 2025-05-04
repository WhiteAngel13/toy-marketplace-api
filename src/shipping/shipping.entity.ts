import { z } from 'zod';

export const ShippingSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  name: z.string(),
  price: z.number(),
  delivery_time: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Shipping = z.infer<typeof ShippingSchema>;
