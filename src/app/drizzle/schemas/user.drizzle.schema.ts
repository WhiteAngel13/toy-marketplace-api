import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const drizzleUser = pgTable('users', {
  id: text().primaryKey(),
  email: text().notNull(),
  password_hash: text().notNull(),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleUserColumns = {
  id: drizzleUser.id,
  email: drizzleUser.email,
  password_hash: drizzleUser.password_hash,
  created_at: drizzleUser.created_at,
  updated_at: drizzleUser.updated_at,
};
