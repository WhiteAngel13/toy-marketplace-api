import { z } from 'zod';

export const PaymentMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  store_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
