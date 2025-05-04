import { z } from 'zod';

export const StoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  owner_user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Store = z.infer<typeof StoreSchema>;
