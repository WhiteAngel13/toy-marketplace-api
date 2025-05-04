import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const drizzleUser = pgTable('users', {
  id: text().primaryKey(),
  email: text().notNull(),
  password_hash: text(),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});
