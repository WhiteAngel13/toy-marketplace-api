import { z } from 'zod';

export const CartStatusSchema = z.enum(['open', 'closed']);

export type CartStatus = z.infer<typeof CartStatusSchema>;

export const CartProductSchema = z.object({
  id: z.string(),
  cart_id: z.string(),
  product_id: z.string(),
  quantity: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CartProduct = z.infer<typeof CartProductSchema>;

export const CartSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  store_id: z.string(),
  status: CartStatusSchema,
  delivery_address: z.string().optional(),
  payment_method_id: z.string().optional(),
  shipping_id: z.string().optional(),
  coupon_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Cart = z.infer<typeof CartSchema>;
