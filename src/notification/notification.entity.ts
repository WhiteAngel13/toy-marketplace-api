import { z } from 'zod';

export const NotificationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  metadata: z.any(),
  created_at: z.string(),
});

export type Notification = z.infer<typeof NotificationSchema>;
