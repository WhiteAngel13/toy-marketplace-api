import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { drizzleUser } from './user.drizzle.schema';

export const drizzleStore = pgTable('stores', {
  id: text().primaryKey(),
  name: text().notNull(),
  owner_user_id: text()
    .notNull()
    .references(() => drizzleUser.id),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleStoreColumns = {
  id: drizzleStore.id,
  name: drizzleStore.name,
  owner_user_id: drizzleStore.owner_user_id,
  created_at: drizzleStore.created_at,
  updated_at: drizzleStore.updated_at,
};
