import { z } from 'zod';

export const CouponSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  code: z.string(),
  discount: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Coupon = z.infer<typeof CouponSchema>;
