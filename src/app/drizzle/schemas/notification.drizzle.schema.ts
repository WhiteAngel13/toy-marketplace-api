import {
  boolean,
  mediumtext,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { drizzleUser } from './user.drizzle.schema';

export const drizzleNotification = mysqlTable('notifications', {
  id: varchar('id', { length: 191 }).primaryKey(),
  user_id: varchar('user_id', { length: 191 })
    .notNull()
    .references(() => drizzleUser.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull(),
  metadata: mediumtext('metadata').notNull(),
  created_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleNotificationColumns = {
  id: drizzleNotification.id,
  user_id: drizzleNotification.user_id,
  title: drizzleNotification.title,
  message: drizzleNotification.message,
  read: drizzleNotification.read,
  created_at: drizzleNotification.created_at,
  metadata: drizzleNotification.metadata,
};
