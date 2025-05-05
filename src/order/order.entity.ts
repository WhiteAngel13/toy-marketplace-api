import { z } from 'zod';

export const OrderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'canceled',
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  cart_id: z.string(),
  status: OrderStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;
